const express = require('express');
const router = express.Router();
const cricketService = require('../services/cricketService');

router.get('/series/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, error: "Search query required" });
        const results = await cricketService.findSeries(q);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Regular endpoint for manual fetch/initial load
router.get('/live-matches', async (req, res) => {
    try {
        const matches = await cricketService.getLiveMatches();
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// SSE Endpoint for real-time updates
router.get('/live-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendUpdate = async () => {
        try {
            const matches = await cricketService.getLiveMatches();
            res.write(`data: ${JSON.stringify(matches)}\n\n`);
        } catch (error) {
            console.error("SSE Update Error:", error.message);
        }
    };

    // Send immediate update
    sendUpdate();

    // Poll every 10 seconds (aligned with cache TTL)
    const intervalId = setInterval(sendUpdate, 10000);

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

// Admin Route: Get all discovered matches
router.get('/all-discovered', async (req, res) => {
    try {
        const matches = await cricketService.getAllDiscoveredMatches();
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/toggle-status", async (req, res) => {
    try {
        const { id, field, value } = req.body;
        const result = await cricketService.toggleMatchStatus(id, field, value);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Admin Route: Toggle match tracking
router.patch('/toggle-tracking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isLiveTracked } = req.body;
        const updated = await cricketService.toggleMatchTracking(id, isLiveTracked);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Premium CricAPI Proxies

router.get('/scorecard/:id', async (req, res) => {
    try {
        const data = await cricketService.getMatchScorecard(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/points/:id', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const data = await cricketService.getSeriesPoints(req.params.id, lang);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/squad/:id', async (req, res) => {
    try {
        const data = await cricketService.getMatchSquad(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



router.get('/player/:id', async (req, res) => {
    try {
        const data = await cricketService.getPlayerInfo(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Settings Routes
router.get('/settings', async (req, res) => {
    try {
        const settings = await cricketService.getCricketSettings();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/settings', async (req, res) => {
    try {
        const updated = await cricketService.updateCricketSettings(req.body);
        res.status(200).json({ success: true, data: updated.cricket });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Route: Add match manually by ID
router.post('/add-match', async (req, res) => {
    try {
        const { matchId } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, error: "Match ID is required" });
        }
        const updated = await cricketService.addMatchById(matchId);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Route: Save Manual Points Table
router.post('/points/manual', async (req, res) => {
    try {
        const { seriesId, seriesName, tableData, lang } = req.body;
        if (!seriesId || !tableData) {
            return res.status(400).json({ success: false, error: "Series ID and table data required" });
        }
        const result = await cricketService.saveManualPointsTable(seriesId, seriesName, tableData, lang || 'en');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Route: Create Manual Match
router.post('/create-match', async (req, res) => {
    try {
        const result = await cricketService.createManualMatch(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Route: Trigger manual discovery sync
router.post('/sync', async (req, res) => {
    try {
        console.log("[ADMIN] Manual Sync Triggered");
        // Start sync in background
        cricketService.syncMatchesWithDB(true);
        res.status(200).json({ success: true, message: "Sync started in background" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Route: Delete Match
router.delete('/delete-match/:id', async (req, res) => {
    try {
        const result = await cricketService.deleteMatch(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
