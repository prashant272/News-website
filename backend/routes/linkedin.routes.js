const express = require("express");
const router = express.Router();
const linkedinController = require("../Controllers/linkedin.controller");

// OAuth
router.get("/auth", linkedinController.getLinkedInAuthUrl);
router.get("/callback", linkedinController.handleLinkedInCallback);

// Multi-account management
router.post("/add-account", linkedinController.addAccount);
router.get("/accounts", linkedinController.getAccounts);
router.delete("/accounts/:accountId", linkedinController.removeAccount);
router.patch("/accounts/:accountId/toggle", linkedinController.toggleAccountPost);

// Page/Org lookup
router.get("/admin-orgs", linkedinController.getAdminOrganizations);

module.exports = router;
