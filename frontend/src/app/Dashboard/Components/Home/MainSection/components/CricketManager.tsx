"use client";
import React, { useEffect, useState } from 'react';
import { cricketService, LiveMatch } from '@/app/services/CricketService';
import styles from '../Main.module.scss'; // Reusing some main styles
import CricketScorecard from '@/app/Components/T20-world-cup/Scorecard/Scorecard';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';

const CricketManager: React.FC = () => {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [matchInput, setMatchInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    // Dynamic Tournament Settings
    const [tournament, setTournament] = useState('T20 World Cup');
    const [seriesId, setSeriesId] = useState('');
    const [autoTrack, setAutoTrack] = useState(true);
    const [headerMatch, setHeaderMatch] = useState({
        team1Name: '', team1Img: '', team2Name: '', team2Img: '', isActive: false
    });
    const [updatingSettings, setUpdatingSettings] = useState(false);

    const [searching, setSearching] = useState(false);
    const [seriesSearchQuery, setSeriesSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Manual Match State
    const [manualMatch, setManualMatch] = useState({
        name: '',
        teams: ['', ''],
        date: new Date().toISOString().split('T')[0],
        startTime: '14:30',
        venue: '',
        category: 'upcoming' as 'live' | 'upcoming' | 'recent',
        matchType: 'T20',
        score1: '',
        score2: '',
        winnerStatus: '',
        team1CaptainImg: '',
        team2CaptainImg: ''
    });
    const [creatingManual, setCreatingManual] = useState(false);
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

    // Manual Points Table State — multi-group
    type PointsGroup = { groupName: string; rows: any[] };
    const [pointsGroups, setPointsGroups] = useState<PointsGroup[]>([
        { groupName: 'Group 1', rows: [] }
    ]);
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
    const [isManualPoints, setIsManualPoints] = useState(false);
    const [savingPoints, setSavingPoints] = useState(false);
    const [hasFetchedPoints, setHasFetchedPoints] = useState(false);
    const [tableLanguage, setTableLanguage] = useState<'en' | 'hi'>('hi');

    const [listSearchQuery, setListSearchQuery] = useState('');

    // Convenience: rows of active group
    const pointsRows = pointsGroups[activeGroupIndex]?.rows || [];


    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await cricketService.getAllDiscovered();
            if (response.success) {
                setMatches(response.data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await cricketService.getSettings();
            if (res.success) {
                setTournament(res.data.activeTournament || '');
                setSeriesId(res.data.activeSeriesId || '');
                setAutoTrack(res.data.autoTrackEnabled ?? true);
                if (res.data.headerMatch) {
                    setHeaderMatch(res.data.headerMatch);
                }
            }
        } catch (err) {
            console.error("Failed to fetch cricket settings", err);
        }
    };

    useEffect(() => {
        fetchMatches();
        fetchSettings();
    }, []);

    const handleUpdateSettings = async () => {
        setUpdatingSettings(true);
        try {
            const res = await cricketService.updateSettings({
                activeTournament: tournament,
                activeSeriesId: seriesId,
                autoTrackEnabled: autoTrack,
                headerMatch
            });
            if (res.success) {
                alert("Settings updated successfully! New matches will be filtered by: " + tournament);
                fetchMatches(); // Refresh list to see filtering change
            }
        } catch (err: any) {
            alert("Failed to update settings: " + err.message);
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleAddMatch = async () => {
        if (!matchInput.trim()) return;

        setAdding(true);
        try {
            // Extract ID from Cricbuzz URL if necessary
            let matchId = matchInput.trim();
            if (matchId.includes('cricbuzz.com')) {
                const parts = matchId.split('/');
                const scoreIndex = parts.indexOf('live-cricket-scores') !== -1 ?
                    parts.indexOf('live-cricket-scores') :
                    parts.indexOf('live-cricket-score');
                if (scoreIndex !== -1 && parts[scoreIndex + 1]) {
                    matchId = parts[scoreIndex + 1];
                }
            }

            // Clean matchId: only take the numeric part or alphanumeric if it's a valid ID
            // Most Cricbuzz IDs are just numbers. Let's strip anything that's not alphanumeric.
            matchId = matchId.replace(/[^a-zA-Z0-9-]/g, '');

            if (!matchId) {
                alert("Invalid Match ID or URL");
                setAdding(false);
                return;
            }

            const response = await cricketService.addMatch(matchId);
            if (response.success) {
                setMatchInput('');
                fetchMatches(); // Refresh list
                alert("Match added successfully!");
            }
        } catch (err: any) {
            alert("Error adding match: " + err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleToggleStatus = async (id: string, field: string, currentValue: boolean) => {
        try {
            const response = await cricketService.toggleStatus(id, field, !currentValue);
            if (response.success) {
                setMatches(prev => prev.map(m => m.id === id ? response.data : m));
            }
        } catch (err: any) {
            alert("Error updating status: " + err.message);
        }
    };

    const handleCreateManualMatch = async () => {
        if (!manualMatch.name || !manualMatch.teams[0] || !manualMatch.teams[1]) {
            alert("Please fill match name and both teams");
            return;
        }

        // TIMEZONE FIX: combine date and time and convert to ISO for dateTimeGMT
        const localDateTimeStr = `${manualMatch.date}T${manualMatch.startTime}:00`;
        const dateTimeGMT = new Date(localDateTimeStr).toISOString();

        setCreatingManual(true);
        try {
            const matchData = {
                ...manualMatch,
                id: editingMatchId || undefined,
                dateTimeGMT: dateTimeGMT,
                score: [
                    { inning: 'Team 1', raw: manualMatch.score1 },
                    { inning: 'Team 2', raw: manualMatch.score2 }
                ],
                status: manualMatch.winnerStatus || (manualMatch.category === 'upcoming' ? 'Upcoming' : (manualMatch.category === 'live' ? 'Live' : 'Match Finished'))
            };

            const res = await cricketService.createManualMatch(matchData);
            if (res.success) {
                alert(editingMatchId ? "Match updated!" : "Manual match created!");
                fetchMatches();
                setEditingMatchId(null);
                setManualMatch({
                    name: '',
                    teams: ['', ''],
                    date: new Date().toISOString().split('T')[0],
                    startTime: '14:30',
                    venue: '',
                    category: 'upcoming',
                    matchType: 'T20',
                    score1: '',
                    score2: '',
                    winnerStatus: '',
                    team1CaptainImg: '',
                    team2CaptainImg: ''
                });
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setCreatingManual(false);
        }
    };

    const handleDeleteMatch = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this match?")) return;
        try {
            const res = await cricketService.deleteMatch(id);
            if (res.success) {
                alert("Match deleted");
                fetchMatches();
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleEditMatch = (match: LiveMatch) => {
        setEditingMatchId(match.id);
        // Parse dateTimeGMT back to date and time if possible, otherwise use existing
        let d = match.date || "";
        let t = "14:30";

        if (match.dateTimeGMT) {
            const dt = new Date(match.dateTimeGMT);
            d = dt.toISOString().split('T')[0];
            t = dt.toTimeString().split(' ')[0].substring(0, 5);
        }

        setManualMatch({
            name: match.name,
            teams: match.teams || ['', ''],
            date: d,
            startTime: t,
            venue: match.venue || '',
            category: match.category,
            matchType: match.matchType || 'T20',
            score1: match.score?.[0]?.raw || '',
            score2: match.score?.[1]?.raw || '',
            winnerStatus: match.status || '',
            team1CaptainImg: match.team1CaptainImg || '',
            team2CaptainImg: match.team2CaptainImg || ''
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchPointsTable = async () => {
        if (!seriesId) return;
        try {
            const res = await cricketService.getPointsTable(seriesId, tableLanguage);
            if (res.success) {
                // If manual data: { isManual: true, groups: [...] }
                if (res.data?.isManual && Array.isArray(res.data?.groups)) {
                    setPointsGroups(res.data.groups);
                    setActiveGroupIndex(0);
                    setIsManualPoints(true);
                } else {
                    // API data — wrap in single group
                    const rows = res.data?.data || res.data || [];
                    setPointsGroups([{ groupName: 'Group 1', rows: Array.isArray(rows) ? rows : [] }]);
                    setActiveGroupIndex(0);
                    setIsManualPoints(false);
                }
            }
        } catch (err) {
            console.error("Points Table Error:", err);
        }
    };

    // Fetch when seriesId or language changes
    useEffect(() => {
        if (seriesId) {
            fetchPointsTable();
            setHasFetchedPoints(true);
        }
    }, [seriesId, tableLanguage]);

    const handleSavePoints = async () => {
        if (!seriesId) return;
        setSavingPoints(true);
        try {
            const res = await cricketService.saveManualPoints(seriesId, tournament, pointsGroups as any, tableLanguage);
            if (res.success) {
                alert("Points Table saved!");
                setIsManualPoints(true);
                fetchPointsTable();
            }
        } catch (err: any) {
            alert("Error saving points: " + err.message);
        } finally {
            setSavingPoints(false);
        }
    };

    const addGroup = () => {
        const newName = `Group ${pointsGroups.length + 1}`;
        setPointsGroups(prev => [...prev, { groupName: newName, rows: [] }]);
        setActiveGroupIndex(pointsGroups.length);
    };

    const removeGroup = (idx: number) => {
        if (pointsGroups.length === 1) return alert("At least one group is required.");
        setPointsGroups(prev => prev.filter((_, i) => i !== idx));
        setActiveGroupIndex(0);
    };

    const renameGroup = (idx: number, name: string) => {
        setPointsGroups(prev => prev.map((g, i) => i === idx ? { ...g, groupName: name } : g));
    };

    const addPointsRow = () => {
        setPointsGroups(prev => prev.map((g, i) =>
            i === activeGroupIndex
                ? { ...g, rows: [...g.rows, { teamname: '', matches: 0, wins: 0, loss: 0, ties: 0, nr: 0, pts: 0, nrr: '0.000' }] }
                : g
        ));
    };

    const updatePointsRow = (index: number, field: string, value: any) => {
        setPointsGroups(prev => prev.map((group, gIdx) => {
            if (gIdx !== activeGroupIndex) return group;

            const updatedRows = [...group.rows];
            const updatedRow = { ...updatedRows[index], [field]: value };

            // Auto-calculate points if wins/ties/nr change
            if (field === 'wins' || field === 'nr' || field === 'ties') {
                const w = parseInt(updatedRow.wins || '0', 10);
                const nr = parseInt(updatedRow.nr || '0', 10);
                const t = parseInt(updatedRow.ties || '0', 10);
                updatedRow.pts = (w * 2) + nr + t;
            }

            updatedRows[index] = updatedRow;
            return { ...group, rows: updatedRows };
        }));
    };

    const removePointsRow = (index: number) => {
        setPointsGroups(prev => prev.map((g, i) =>
            i === activeGroupIndex
                ? { ...g, rows: g.rows.filter((_, rIdx) => rIdx !== index) }
                : g
        ));
    };


    if (loading) return <div className={styles.loading}>Loading matches...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.managerContainer}>
            {/* Global Cricket Settings */}
            <div className={styles.settingsSection} style={{
                background: '#222',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                border: '1px solid #444'
            }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Global Settings</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Filter & Series ID Row */}
                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '13px' }}>Active Tournament Filter (e.g. IPL, World Cup)</label>
                            <input
                                type="text"
                                value={tournament}
                                onChange={(e) => setTournament(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', background: '#111', border: '1px solid #333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '13px' }}>Active Series ID (UUID for Points Table)</label>
                            <input
                                type="text"
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                placeholder="e.g. bbcaa2ce-be45-4541-9eb3-9828d8b13197"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', background: '#111', border: '1px solid #333', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="autoTrack"
                                checked={autoTrack}
                                onChange={(e) => setAutoTrack(e.target.checked)}
                            />
                            <label htmlFor="autoTrack" style={{ color: '#fff', cursor: 'pointer', fontSize: '14px' }}>Auto-track Live Scores</label>
                        </div>
                    </div>

                    {/* Navbar Header Match Control */}
                    <div style={{ flex: 1, minWidth: '350px', background: '#333', padding: '15px', borderRadius: '8px', border: '1px solid #444' }}>
                        <h4 style={{ color: '#fbbf24', marginBottom: '10px', fontSize: '14px' }}>Navbar Header Widget (Manual Override)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Team 1 Name</label>
                                <input type="text" value={headerMatch.team1Name} onChange={e => setHeaderMatch({ ...headerMatch, team1Name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Team 2 Name</label>
                                <input type="text" value={headerMatch.team2Name} onChange={e => setHeaderMatch({ ...headerMatch, team2Name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Team 1 Image URL</label>
                                <input type="text" value={headerMatch.team1Img} onChange={e => setHeaderMatch({ ...headerMatch, team1Img: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Team 2 Image URL</label>
                                <input type="text" value={headerMatch.team2Img} onChange={e => setHeaderMatch({ ...headerMatch, team2Img: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }} />
                            </div>
                        </div>
                        <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={headerMatch.isActive} onChange={(e) => setHeaderMatch({ ...headerMatch, isActive: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                            Show Manual Match Widget in Navbar
                        </label>
                    </div>

                    {/* Series Discovery Column */}
                    <div style={{ flex: 1, minWidth: '300px', borderLeft: '1px solid #444', paddingLeft: '20px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>Series Discovery (Find IDs)</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                value={seriesSearchQuery}
                                onChange={(e) => setSeriesSearchQuery(e.target.value)}
                                placeholder="Search series (e.g. 'IPL 2024')"
                                style={{ flex: 1, padding: '8px', borderRadius: '4px', background: '#111', border: '1px solid #333', color: '#fff' }}
                            />
                            <button
                                onClick={async () => {
                                    if (!seriesSearchQuery) return;
                                    setSearching(true);
                                    try {
                                        const results = await cricketService.searchSeries(seriesSearchQuery);
                                        setSearchResults(results || []);
                                    } catch (err) {
                                        console.error("Search error:", err);
                                    } finally {
                                        setSearching(false);
                                    }
                                }}
                                style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                disabled={searching}
                            >
                                {searching ? '...' : 'Search'}
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#111', borderRadius: '4px', border: '1px solid #333' }}>
                                <table style={{ width: '100%', fontSize: '11px', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#1a1a1a', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Series</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((s) => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '8px' }}>
                                                    <div style={{ color: '#fff' }}>{s.name}</div>
                                                    <div style={{ color: '#aaa', fontSize: '9px' }}>{s.startDate} to {s.endDate}</div>
                                                    <div style={{ color: '#666', fontSize: '8px', fontFamily: 'monospace' }}>{s.id}</div>
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSeriesId(s.id);
                                                            setTournament(s.name);
                                                        }}
                                                        style={{ color: '#007bff', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Actions Row */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #444', paddingTop: '20px' }}>
                    <button
                        onClick={handleUpdateSettings}
                        disabled={updatingSettings}
                        style={{ padding: '10px 30px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {updatingSettings ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const res = await cricketService.triggerSync();
                                if (res.success) {
                                    // Give the API a moment to start and then refresh list
                                    setTimeout(() => fetchMatches(), 2000);
                                    alert("Sync triggered! Refreshing list in 2s...");
                                }
                            } catch (err: any) {
                                alert("Sync failed: " + err.message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Sync Data
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {/* Manual Match Creation Form */}
                <div style={{ flex: 1, minWidth: '400px', background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '18px' }}>🔨 Create Manual Match</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '15px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Match Name</label>
                            <input
                                type="text" value={manualMatch.name}
                                onChange={(e) => setManualMatch({ ...manualMatch, name: e.target.value })}
                                placeholder="e.g. India vs Pakistan"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 1</label>
                            <input
                                type="text" value={manualMatch.teams[0]}
                                onChange={(e) => setManualMatch({ ...manualMatch, teams: [e.target.value, manualMatch.teams[1]] })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 2</label>
                            <input
                                type="text" value={manualMatch.teams[1]}
                                onChange={(e) => setManualMatch({ ...manualMatch, teams: [manualMatch.teams[0], e.target.value] })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 1 Captain Image URL</label>
                            <input
                                type="text" value={manualMatch.team1CaptainImg}
                                onChange={(e) => setManualMatch({ ...manualMatch, team1CaptainImg: e.target.value })}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 2 Captain Image URL</label>
                            <input
                                type="text" value={manualMatch.team2CaptainImg}
                                onChange={(e) => setManualMatch({ ...manualMatch, team2CaptainImg: e.target.value })}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Date</label>
                            <input
                                type="date" value={manualMatch.date}
                                onChange={(e) => setManualMatch({ ...manualMatch, date: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Start Time</label>
                            <input
                                type="time" value={manualMatch.startTime}
                                onChange={(e) => setManualMatch({ ...manualMatch, startTime: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Category</label>
                            <select
                                value={manualMatch.category}
                                onChange={(e) => setManualMatch({ ...manualMatch, category: e.target.value as any })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="recent">Recent</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Venue</label>
                            <input
                                type="text" value={manualMatch.venue}
                                onChange={(e) => setManualMatch({ ...manualMatch, venue: e.target.value })}
                                placeholder="e.g. Melbourne Cricket Ground"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        
                        {/* MANUAL SCORE FIELDS */}
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 1 Score (e.g. 180/5)</label>
                            <input
                                type="text" value={manualMatch.score1}
                                onChange={(e) => setManualMatch({ ...manualMatch, score1: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Team 2 Score (e.g. 165/8)</label>
                            <input
                                type="text" value={manualMatch.score2}
                                onChange={(e) => setManualMatch({ ...manualMatch, score2: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Match Result/Status (e.g. MI won by 15 runs)</label>
                            <input
                                type="text" value={manualMatch.winnerStatus}
                                onChange={(e) => setManualMatch({ ...manualMatch, winnerStatus: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#000', border: '1px solid #444', color: '#fff' }}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleCreateManualMatch}
                                disabled={creatingManual}
                                style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {creatingManual ? 'Processing...' : (editingMatchId ? 'Update Match' : 'Create Manual Match')}
                            </button>
                            {editingMatchId && (
                                <button
                                    onClick={() => {
                                        setEditingMatchId(null);
                                        setManualMatch({
                                            name: '',
                                            teams: ['', ''],
                                            date: new Date().toISOString().split('T')[0],
                                            startTime: '14:30',
                                            venue: '',
                                            category: 'upcoming',
                                            matchType: 'T20',
                                            score1: '',
                                            score2: '',
                                            winnerStatus: '',
                                            team1CaptainImg: '',
                                            team2CaptainImg: ''
                                        });
                                    }}
                                    style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Manual Points Table Editor */}
                <div style={{ flex: 1, minWidth: '400px', background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>📝 Manual Points Table</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select 
                                value={tableLanguage} 
                                onChange={(e) => setTableLanguage(e.target.value as 'en'|'hi')}
                                style={{ padding: '3px', background: '#333', color: '#fff', border: '1px solid #666', borderRadius: '4px', fontSize: '12px' }}
                            >
                                <option value="hi">Hindi Table</option>
                                <option value="en">English Table</option>
                            </select>
                            {isManualPoints && <span style={{ fontSize: '10px', background: '#28a745', color: '#fff', padding: '2px 6px', borderRadius: '10px' }}>MANUAL MODE</span>}
                            <button
                                onClick={() => { setHasFetchedPoints(false); fetchPointsTable(); setHasFetchedPoints(true); }}
                                style={{ fontSize: '11px', padding: '3px 10px', background: '#444', color: '#aaa', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}
                                title="Reload from DB (will discard unsaved changes)"
                            >🔄 Reload</button>
                        </div>
                    </div>
                    {seriesId ? (
                        <div>
                            {/* Group Tabs */}
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
                                {pointsGroups.map((g, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <button
                                            onClick={() => setActiveGroupIndex(idx)}
                                            style={{
                                                padding: '4px 10px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', border: 'none',
                                                background: activeGroupIndex === idx ? '#007bff' : '#333', color: '#fff', fontWeight: activeGroupIndex === idx ? 'bold' : 'normal'
                                            }}
                                        >
                                            {g.groupName}
                                        </button>
                                        <button onClick={() => removeGroup(idx)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}>×</button>
                                    </div>
                                ))}
                                <button onClick={addGroup} style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: '#444', color: '#aaa', border: '1px dashed #666', cursor: 'pointer' }}>+ Add Group</button>
                            </div>

                            {/* Rename active group */}
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={pointsGroups[activeGroupIndex]?.groupName || ''}
                                    onChange={(e) => renameGroup(activeGroupIndex, e.target.value)}
                                    style={{ padding: '4px 8px', borderRadius: '4px', background: '#000', border: '1px solid #555', color: '#fff', fontSize: '12px', width: '180px' }}
                                    placeholder="Group name"
                                />
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', fontSize: '11px', color: '#fff' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Team</th>
                                            <th>P</th><th>W</th><th>L</th><th>NR</th><th>Pts</th><th>NRR</th><th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pointsRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td><input type="text" value={row.teamname ?? ''} onChange={(e) => updatePointsRow(idx, 'teamname', e.target.value)} style={{ width: '80px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td><input type="number" value={row.matches ?? 0} onChange={(e) => updatePointsRow(idx, 'matches', parseInt(e.target.value, 10) || 0)} style={{ width: '35px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td><input type="number" value={row.wins ?? 0} onChange={(e) => updatePointsRow(idx, 'wins', parseInt(e.target.value, 10) || 0)} style={{ width: '35px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td><input type="number" value={row.loss ?? 0} onChange={(e) => updatePointsRow(idx, 'loss', parseInt(e.target.value, 10) || 0)} style={{ width: '35px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td><input type="number" value={row.nr ?? 0} onChange={(e) => updatePointsRow(idx, 'nr', parseInt(e.target.value, 10) || 0)} style={{ width: '35px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td style={{ textAlign: 'center' }}><strong>{row.pts ?? 0}</strong></td>
                                                <td><input type="text" value={row.nrr ?? '0.000'} onChange={(e) => updatePointsRow(idx, 'nrr', e.target.value)} style={{ width: '50px', background: '#000', border: '1px solid #444', color: '#fff', padding: '2px' }} /></td>
                                                <td><button onClick={() => removePointsRow(idx)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}>×</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button onClick={addPointsRow} style={{ flex: 1, padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Add Team</button>
                                    <button onClick={handleSavePoints} disabled={savingPoints} style={{ flex: 1, padding: '8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                        {savingPoints ? 'Saving...' : 'Save All Groups'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#666', fontSize: '12px' }}>Set an Active Series ID in settings to enable manual points table.</p>
                    )}
                </div>
            </div>

            {/* Manual Match Add Section */}
            <div className={styles.addMatchSection} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter Match ID or Cricbuzz URL to add manually"
                    value={matchInput}
                    onChange={(e) => setMatchInput(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', flex: 1, background: '#1a1a1a', color: '#fff' }}
                />
                <button
                    onClick={handleAddMatch}
                    disabled={adding}
                    style={{ padding: '10px 20px', borderRadius: '4px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                    {adding ? 'Adding...' : 'Add Match Manually'}
                </button>
            </div>

            {/* Previews: Scorecard & Points Table */}
            {selectedMatchId && (
                <div style={{ marginBottom: '30px', position: 'relative', border: '1px solid #444', borderRadius: '8px', padding: '20px', background: '#111' }}>
                    <button
                        onClick={() => setSelectedMatchId(null)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', zIndex: 10 }}
                    >
                        Close Preview
                    </button>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>Match Scorecard Preview</h3>
                    <CricketScorecard matchId={selectedMatchId} />
                </div>
            )}

            {seriesId && (
                <div style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '8px', border: '4px solid #007bff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ color: '#000', margin: 0 }}>Points Table Preview</h3>
                        <span style={{ fontSize: '12px', background: '#007bff', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>ID: {seriesId}</span>
                    </div>
                    <CricketPointsTable seriesId={seriesId} lang={tableLanguage} />
                </div>
            )}

            {/* Matches List Table */}
            <div className={styles.tableWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>All Discovered Matches</h3>
                    <input
                        type="text"
                        placeholder="🔍 Search matches in list..."
                        value={listSearchQuery}
                        onChange={(e) => setListSearchQuery(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '20px', background: '#111', border: '1px solid #444', color: '#fff', fontSize: '13px', width: '250px' }}
                    />
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Tracking Actions</th>
                            <th>Last Sync</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches
                            .filter(m =>
                                !listSearchQuery ||
                                m.name.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
                                m.status.toLowerCase().includes(listSearchQuery.toLowerCase())
                            )
                            .map((match) => (
                                <tr key={match.id}>
                                    <td>
                                        <div className={styles.matchName}>{match.name}</div>
                                        <div className={styles.matchMeta}>{match.matchType} • {match.venue}</div>
                                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                                            {match.isManual && <span style={{ color: '#6f42c1', fontSize: '9px', border: '1px solid #6f42c1', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>MANUAL</span>}
                                            {match.isLiveTracked && <span style={{ color: '#28a745', fontSize: '9px', border: '1px solid #28a745', padding: '1px 4px', borderRadius: '3px' }}>LIVE</span>}
                                            {match.showInUpcoming && <span style={{ color: '#ffc107', fontSize: '9px', border: '1px solid #ffc107', padding: '1px 4px', borderRadius: '3px' }}>UPCOMING</span>}
                                            {match.showInRecent && <span style={{ color: '#6c757d', fontSize: '9px', border: '1px solid #6c757d', padding: '1px 4px', borderRadius: '3px' }}>RECENT</span>}
                                        </div>

                                    </td>
                                    <td>{match.status}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[match.category]}`}>
                                            {match.category}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            <button
                                                onClick={() => handleToggleStatus(match.id, 'isLiveTracked', match.isLiveTracked)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    background: match.isLiveTracked ? '#28a745' : '#111',
                                                    color: '#fff',
                                                    border: '1px solid #444',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    flex: '1 1 40%'
                                                }}
                                            >
                                                {match.isLiveTracked ? "🔴 Tracking ON" : "⚪ Tracking OFF"}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(match.id, 'showInUpcoming', match.showInUpcoming)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    background: match.showInUpcoming ? '#ffc107' : '#111',
                                                    color: match.showInUpcoming ? '#000' : '#fff',
                                                    border: '1px solid #444',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    flex: '1 1 40%'
                                                }}
                                            >
                                                {match.showInUpcoming ? "🔔 In Upcoming" : "➕ Add Upcoming"}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(match.id, 'showInRecent', match.showInRecent)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    background: match.showInRecent ? '#6c757d' : '#111',
                                                    color: '#fff',
                                                    border: '1px solid #444',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    flex: '1 1 40%'
                                                }}
                                            >
                                                {match.showInRecent ? "🏁 In Recent" : "➕ Add Recent"}
                                            </button>
                                            <button
                                                onClick={() => setSelectedMatchId(match.id)}
                                                style={{ padding: '5px 10px', borderRadius: '4px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', flex: '1 1 40%' }}
                                            >
                                                👁️ Preview
                                            </button>
                                            <button
                                                onClick={() => handleEditMatch(match)}
                                                style={{ padding: '5px 10px', borderRadius: '4px', background: '#17a2b8', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', flex: '1 1 40%' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            {match.isManual && (
                                                <button
                                                    onClick={() => handleDeleteMatch(match.id)}
                                                    style={{ padding: '5px 10px', borderRadius: '4px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', flex: '1 1 40%' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            )}
                                        </div>

                                    </td>
                                    <td>{new Date(match.lastUpdated).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {matches.length === 0 && <p className={styles.empty}>No matches discovered yet. Try clicking "Sync Data" above.</p>}
            </div>
        </div>
    );
};

export default CricketManager;
