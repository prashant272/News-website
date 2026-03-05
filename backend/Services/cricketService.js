const axios = require('axios');
const path = require('path');

// ABSOLUTE PATH RESOLUTION FOR STABILITY
const LiveMatch = require(path.join(__dirname, '..', 'Models', 'LiveMatch'));
const AppConfig = require("../Models/AppConfig");
const SeriesPoints = require("../Models/SeriesPoints");

console.log("!!! CRICKET SERVICE - API VERSION - CRICAPI INTEGRATION !!!");

const API_KEY = process.env.CRICKET_API_KEY || "518150bf-8660-42e9-91bf-205c60ae2911";

const getCricketSettings = async () => {
    let config = await AppConfig.findOne({ key: "GLOBAL_CONFIG" });
    if (!config) {
        config = await AppConfig.create({
            key: "GLOBAL_CONFIG",
            cricket: {
                activeTournament: "T20 World Cup",
                activeSeriesId: "bbcaa2ce-be45-4541-9eb3-9828d8b13197",
                autoTrackEnabled: true
            }
        });
    }
    return config.cricket;
};

const updateCricketSettings = async (settings) => {
    return await AppConfig.findOneAndUpdate(
        { key: "GLOBAL_CONFIG" },
        { $set: { cricket: settings } },
        { upsert: true, new: true }
    );
};

// Mapping CricAPI to our Schema Categories
const determineCategory = (matchStarted, matchEnded) => {
    if (matchStarted && matchEnded) return 'recent';
    if (matchStarted && !matchEnded) return 'live';
    return 'upcoming';
};

const fetchMatchesFromAPI = async (endpoint, offset = 0) => {
    try {
        console.log(`[CRICAPI] Fetching: ${endpoint} (Offset: ${offset})`);
        const response = await axios.get(`https://api.cricapi.com/v1/${endpoint}?apikey=${API_KEY}&offset=${offset}`);
        if (response.data && response.data.status === "success" && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error(`[CRICAPI ERROR] ${endpoint}:`, error.message);
        return [];
    }
};

const syncMatchesWithDB = async (forceAll = false) => {
    const settings = await getCricketSettings();
    // Normalize tournament name for matching: trim and escape regex special chars
    const escapedTournament = settings.activeTournament.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tournamentRegex = new RegExp(escapedTournament, "i");
    const autoTrack = settings.autoTrackEnabled;

    console.log(`[DEBUG-SYNC] Starting API synchronization (Force All: ${forceAll}, Filter: "${settings.activeTournament}")...`);
    try {
        let synced = 0;

        const currentData = await fetchMatchesFromAPI('currentMatches');
        const matchDataToProcess = [...currentData];

        if (forceAll) {
            console.log("[CRICAPI] Discovery mode - fetching more matches (Page 1 & 2)...");
            const upcomingDataPage1 = await fetchMatchesFromAPI('matches', 0);
            const upcomingDataPage2 = await fetchMatchesFromAPI('matches', 25);

            const existingIds = new Set(matchDataToProcess.map(m => m.id));
            const allUpcoming = [...upcomingDataPage1, ...upcomingDataPage2];

            for (const match of allUpcoming) {
                if (!existingIds.has(match.id)) {
                    matchDataToProcess.push(match);
                }
            }
        }

        // Process all fetched matches
        for (const match of matchDataToProcess) {
            const category = determineCategory(match.matchStarted, match.matchEnded);

            // Format match score if needed
            if (match.score && Array.isArray(match.score)) {
                match.score = match.score.map(s => ({
                    ...s,
                    raw: `${s.r}/${s.w} (${s.o} ov)`
                }));
            }

            // Prepare update object
            const updateSet = {
                id: match.id,
                name: match.name,
                matchType: match.matchType,
                status: match.status,
                venue: match.venue,
                date: match.date,
                dateTimeGMT: match.dateTimeGMT,
                teams: match.teams || [],
                teamInfo: match.teamInfo || [],
                score: match.score || [],
                series_id: match.series_id,
                matchStarted: match.matchStarted,
                matchEnded: match.matchEnded,
                category: category,
                lastUpdated: new Date()
            };

            const existingMatch = await LiveMatch.findOne({ id: match.id });

            // CRITICAL FILTERING logic
            const matchesTournamentName = tournamentRegex.test(match.name) || tournamentRegex.test(match.status);
            const matchesSeriesId = match.series_id === settings.activeSeriesId;
            const isT20 = match.matchType === 't20' || match.name.toLowerCase().includes('t20');

            const isPriorityMatch = matchesTournamentName || matchesSeriesId;

            // Determine if we should track live score (Auto-track only for priority matches or if already tracked)
            if (category === 'live' && (existingMatch?.isLiveTracked || (autoTrack && isPriorityMatch))) {
                console.log(`[SYNC-LB] Syncing Live Scorecard for ${match.name}`);
                try {
                    const scorecardRes = await axios.get(`https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}&offset=0&id=${match.id}`);
                    if (scorecardRes.data?.status === "success") {
                        updateSet.fullScorecard = scorecardRes.data.data;
                        updateSet.isLiveTracked = true;
                    }
                } catch (scErr) {
                    console.error(`[SYNC-LB ERROR] Scorecard fetch failed: ${scErr.message}`);
                }
            } else if (isPriorityMatch) {
                // Always track matches that match the tournament/series
                updateSet.isLiveTracked = true;
            } else if (autoTrack && isT20) {
                // Still keep T20 matches in DB for discovery, but don't force 'isLiveTracked' unless explicitly marked
                // This keeps them hidden from the main view but accessible in 'All Discovered'
                updateSet.isLiveTracked = existingMatch?.isLiveTracked || false;
            }

            // Update or Insert Match
            await LiveMatch.findOneAndUpdate(
                { id: match.id },
                { $set: updateSet },
                { upsert: true, new: true }
            );
            synced++;
        }

        // Deep Sync Phase: For tracked matches, refresh them via specific API call
        // currentMatches handles all live ones automatically, so we just rely on that
        // for updates instead of individual deep scraping like before.

        console.log(`[DEBUG-SYNC] Finished API Sync! Total Processed: ${matchDataToProcess.length}, DB Updates: ${synced}`);

        // Clean up matches older than 30 days
        await LiveMatch.deleteMany({ lastUpdated: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });

    } catch (error) {
        console.error("[DEBUG-SYNC ERROR]:", error.message);
    }
};

const getLiveMatches = async () => {
    try {
        const settings = await getCricketSettings();

        // Public View: ONLY show matches explicitly approved by Admin
        const matches = await LiveMatch.find({
            $or: [
                { isLiveTracked: true },
                { showInUpcoming: true },
                { showInRecent: true }
            ]
        }).sort({ date: 1 }).lean();

        return {
            live: matches.filter(m => m.isLiveTracked && m.category === 'live'),
            upcoming: matches.filter(m => m.showInUpcoming),
            recent: matches.filter(m => m.showInRecent).reverse() // Show newest first
        };
    } catch (error) {
        console.error("DB Error:", error.message);
        return { live: [], upcoming: [], recent: [] };
    }
};

// High-Frequency Polling: Runs every 10s for active live matches
const pollLiveScores = async () => {
    try {
        const liveTracked = await LiveMatch.find({
            isLiveTracked: true,
            category: 'live'
        });

        if (liveTracked.length === 0) return;

        console.log(`[POLL] Refreshing scores for ${liveTracked.length} live matches...`);
        for (const match of liveTracked) {
            const response = await axios.get(`https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}&offset=0&id=${match.id}`);
            if (response.data?.status === "success") {
                await LiveMatch.findOneAndUpdate(
                    { id: match.id },
                    {
                        $set: {
                            fullScorecard: response.data.data,
                            lastUpdated: new Date()
                        }
                    }
                );
            }
        }
    } catch (error) {
        console.error("[POLL ERROR]:", error.message);
    }
};

const toggleMatchStatus = async (id, field, value) => {
    try {
        const update = { [field]: value };
        // If we enable live tracking, ensure it's not hidden
        if (field === 'isLiveTracked' && value === true) {
            update.isDiscoveryOnly = false;
        }
        return await LiveMatch.findOneAndUpdate({ id }, { $set: update }, { new: true });
    } catch (error) {
        console.error("Toggle Error:", error.message);
        throw error;
    }
};


const getAllDiscoveredMatches = async () => {
    try {
        const settings = await getCricketSettings();
        const escapedTournament = settings.activeTournament.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tournamentRegex = new RegExp(escapedTournament, "i");

        const { search } = settings; // Optional search from settings if we want to add it later

        const query = {
            $or: [
                { name: { $regex: tournamentRegex } },
                { status: { $regex: tournamentRegex } },
                { matchType: 't20' },
                { name: { $regex: /t20/i } },
                { isLiveTracked: true },
                { isManual: true }
            ]
        };

        // Admin view shows matches matching the filter, ALL T20s, or already tracked ones
        return await LiveMatch.find(query).sort({ date: -1 }).lean();
    } catch (error) {
        console.error("DB Error:", error.message);
        return [];
    }
};

const toggleMatchTracking = async (id, isLiveTracked) => {
    try {
        return await LiveMatch.findOneAndUpdate(
            { id },
            { isLiveTracked, isDiscoveryOnly: false },
            { new: true }
        );
    } catch (error) {
        console.error("DB Error:", error.message);
        throw error;
    }
};

const addMatchById = async (matchId) => {
    try {
        console.log(`[DEBUG-ADD] Adding match manually via Info API: ${matchId}`);
        const response = await axios.get(`https://api.cricapi.com/v1/match_info?apikey=${API_KEY}&offset=0&id=${matchId}`);

        if (!response.data || response.data.status !== "success" || !response.data.data) {
            throw new Error("Could not fetch match details. Verify the Match ID.");
        }

        const match = response.data.data;
        const category = determineCategory(match.matchStarted, match.matchEnded);

        if (match.score && Array.isArray(match.score)) {
            match.score = match.score.map(s => ({
                ...s,
                raw: `${s.r}/${s.w} (${s.o} ov)`
            }));
        }

        const matchData = {
            id: match.id,
            name: match.name,
            matchType: match.matchType,
            status: match.status,
            venue: match.venue,
            date: match.date,
            dateTimeGMT: match.dateTimeGMT,
            teams: match.teams || [],
            teamInfo: match.teamInfo || [],
            score: match.score || [],
            series_id: match.series_id,
            matchStarted: match.matchStarted,
            matchEnded: match.matchEnded,
            category: category,
            isLiveTracked: category !== 'recent',
            isDiscoveryOnly: false,
            lastUpdated: new Date()
        };

        // Immediately fetch scorecard when adding manually
        try {
            const scorecardRes = await axios.get(`https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}&offset=0&id=${matchId}`);
            if (scorecardRes.data?.status === "success") {
                matchData.fullScorecard = scorecardRes.data.data;
            }
        } catch (scErr) {
            console.error(`[ADD MATCH ERROR] Scorecard fetch failed: ${scErr.message}`);
        }

        return await LiveMatch.findOneAndUpdate(
            { id: matchId },
            { $set: matchData },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Add Match Error:", error.message);
        throw error;
    }
};

const getMatchScorecard = async (id) => {
    try {
        // Check DB first
        const match = await LiveMatch.findOne({ id });

        // If match is recent/finished, DB data is final
        if (match && match.fullScorecard) {
            const isStale = match.category === 'live' && (Date.now() - new Date(match.lastUpdated).getTime() > 120000); // 2 mins

            if (!isStale) {
                console.log(`[CACHE] Serving Scorecard from DB for ${id}`);
                return { status: "success", data: match.fullScorecard, source: "db" };
            }
        }

        console.log(`[CRICAPI] Fetching Scorecard: ${id}`);
        const response = await axios.get(`https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}&offset=0&id=${id}`);
        if (response.data && response.data.status === "success") {
            // Update cache
            await LiveMatch.findOneAndUpdate({ id }, {
                $set: {
                    fullScorecard: response.data.data,
                    lastUpdated: new Date()
                }
            });
            return response.data;
        }
        return { success: false, reason: response.data?.reason || "Not found" };
    } catch (error) {
        console.error(`[CRICAPI ERROR] Scorecard:`, error.message);
        return { success: false, error: error.message };
    }
};

const getSeriesPoints = async (id) => {
    try {
        // Check for manual points table first
        const manualTable = await SeriesPoints.findOne({ seriesId: id });
        if (manualTable) {
            console.log(`[SERIES] Returning manual points table for: ${id}`);
            return {
                status: "success",
                isManual: true,
                seriesName: manualTable.seriesName,
                // Support both old flat `data` and new `groups` format
                groups: manualTable.groups || [{ groupName: 'Group 1', rows: manualTable.data || [] }],
                data: manualTable.data || []
            };
        }

        console.log(`[CRICAPI] Fetching Points Table: ${id}`);
        const response = await axios.get(`https://api.cricapi.com/v1/series_points?apikey=${API_KEY}&offset=0&id=${id}`);
        if (response.data && response.data.status === "success") {
            return response.data;
        }
        return { success: false, reason: response.data?.reason || "Not found" };
    } catch (error) {
        console.error(`[CRICAPI ERROR] Points:`, error.message);
        return { success: false, error: error.message };
    }
};

const saveManualPointsTable = async (seriesId, seriesName, groups) => {
    try {
        // groups is an array of { groupName, rows }
        // Also keep a flat `data` for backward compatibility with old display code
        const flatData = groups.flatMap(g => g.rows || []);
        const updated = await SeriesPoints.findOneAndUpdate(
            { seriesId },
            {
                seriesName,
                groups,
                data: flatData,
                isManual: true,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );
        return { success: true, data: updated };
    } catch (error) {
        console.error("Save Manual Points Error:", error.message);
        throw error;
    }
};

const deleteMatch = async (id) => {
    try {
        const result = await LiveMatch.findOneAndDelete({ id });
        if (!result) return { success: false, reason: "Match not found" };
        return { success: true, data: result };
    } catch (error) {
        console.error("Delete Match Error:", error.message);
        throw error;
    }
};

const createManualMatch = async (matchData) => {
    try {
        const id = matchData.id || `manual-${Date.now()}`;
        const newMatch = await LiveMatch.findOneAndUpdate(
            { id },
            {
                ...matchData,
                id,
                isManual: true,
                isDiscoveryOnly: false,
                // Automatically show in the selected category
                isLiveTracked: matchData.category === 'live',
                showInUpcoming: matchData.category === 'upcoming',
                showInRecent: matchData.category === 'recent',
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );
        return { success: true, data: newMatch };
    } catch (error) {
        console.error("Create Manual Match Error:", error.message);
        throw error;
    }
};

const getMatchSquad = async (id) => {
    try {
        console.log(`[CRICAPI] Fetching Squad: ${id}`);
        const response = await axios.get(`https://api.cricapi.com/v1/match_squad?apikey=${API_KEY}&offset=0&id=${id}`);
        if (response.data && response.data.status === "success") {
            return response.data;
        }
        return { success: false, reason: response.data?.reason || "Not found" };
    } catch (error) {
        console.error(`[CRICAPI ERROR] Squad:`, error.message);
        return { success: false, error: error.message };
    }
};

const getPlayerInfo = async (id) => {
    try {
        console.log(`[CRICAPI] Fetching Player: ${id}`);
        const response = await axios.get(`https://api.cricapi.com/v1/players_info?apikey=${API_KEY}&offset=0&id=${id}`);
        if (response.data && response.data.status === "success") {
            return response.data;
        }
        return { success: false, reason: response.data?.reason || "Not found" };
    } catch (error) {
        console.error(`[CRICAPI ERROR] Player:`, error.message);
        return { success: false, error: error.message };
    }
};

const findSeries = async (search) => {
    try {
        console.log(`[CRICAPI] Searching for series: ${search}`);
        const response = await axios.get(`https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0&search=${encodeURIComponent(search)}`);
        if (response.data && response.data.status === "success" && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error(`[CRICAPI ERROR] findSeries:`, error.message);
        return [];
    }
};

module.exports = {
    getLiveMatches,
    syncMatchesWithDB,
    getAllDiscoveredMatches,
    toggleMatchTracking,
    toggleMatchStatus,
    pollLiveScores,
    addMatchById,
    createManualMatch,
    saveManualPointsTable,
    getMatchScorecard,
    getSeriesPoints,
    getMatchSquad,
    getPlayerInfo,
    getCricketSettings,
    updateCricketSettings,
    findSeries,
    deleteMatch
};
