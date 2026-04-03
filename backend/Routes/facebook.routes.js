const express = require("express");
const router = express.Router();
const facebookController = require("../Controllers/facebook.controller");

// ── Global System-Level Facebook Routes ─────────────────────────────────────
router.get("/auth", facebookController.getFacebookAuthUrl);
router.get("/callback", facebookController.handleFacebookCallback);
router.post("/save-global-page", facebookController.saveGlobalPageConfig);
router.get("/global-status", facebookController.getGlobalFacebookStatus);
router.post("/toggle-auto-post", facebookController.toggleAutoPost);
router.delete("/disconnect", facebookController.disconnectFacebook);
router.post("/test-post", facebookController.testPost);

// ── Legacy Per-User Routes (backward compatibility) ──────────────────────────
router.post("/save-page", facebookController.saveFacebookPageConfig);
router.get("/status/:userId", facebookController.getFacebookStatus);

module.exports = router;
