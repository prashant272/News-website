const express = require("express");
const router = express.Router();
const onesignalController = require("../Controllers/onesignal.controller");

// ── OneSignal Configuration Routes ─────────────────────────────────────
router.post("/save-config", onesignalController.saveGlobalOneSignalConfig);
router.get("/status", onesignalController.getGlobalOneSignalStatus);
router.post("/toggle", onesignalController.toggleOneSignal);

module.exports = router;
