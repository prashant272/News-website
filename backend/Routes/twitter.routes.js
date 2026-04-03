const express = require("express");
const router = express.Router();
const twitterController = require("../Controllers/twitter.controller");

// ── Global System-Level Twitter Routes ─────────────────────────────────────
router.get("/auth", twitterController.getTwitterAuthUrl);
router.get("/callback", twitterController.handleTwitterCallback);
router.post("/save-global", twitterController.saveGlobalConfig);
router.get("/global-status", twitterController.getGlobalStatus);
router.post("/toggle-auto-post", twitterController.toggleAutoPost);
router.delete("/disconnect", twitterController.disconnectTwitter);

module.exports = router;
