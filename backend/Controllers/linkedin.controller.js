const axios = require("axios");
const AppConfig = require("../Models/AppConfig");

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

// 1. Generate LinkedIn OAuth URL
exports.getLinkedInAuthUrl = (req, res) => {
    const scope = ["openid", "profile", "w_member_social", "email"].join(" ");
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${scope}&state=linkedin`;
    res.json({ url });
};

// 2. Handle OAuth Callback — returns token + profile info (does NOT save yet)
exports.handleLinkedInCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ success: false, msg: "Code is required" });

        const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
            params: {
                grant_type: "authorization_code",
                code,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
                redirect_uri: LINKEDIN_REDIRECT_URI,
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const accessToken = tokenResponse.data.access_token;

        const profileResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const accountId = `urn:li:person:${profileResponse.data.sub}`;
        const accountName = profileResponse.data.name;

        res.json({ success: true, accessToken, accountId, accountName, type: "person" });
    } catch (error) {
        console.error("LinkedIn Callback Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, msg: "LinkedIn authentication failed" });
    }
};

// 3. Add LinkedIn Account (supports multiple)
exports.addAccount = async (req, res) => {
    try {
        const { accessToken, accountId, accountName, type = "person" } = req.body;
        if (!accessToken || !accountId) return res.status(400).json({ success: false, msg: "Missing fields" });

        let config = await AppConfig.findOne({ key: "linkedin-multi" });
        if (!config) {
            config = new AppConfig({ key: "linkedin-multi", linkedinAccounts: [] });
        }

        // Avoid duplicate
        const exists = config.linkedinAccounts.find(a => a.accountId === accountId);
        if (exists) {
            // Update token in case it expired
            exists.accessToken = accessToken;
            exists.accountName = accountName;
        } else {
            config.linkedinAccounts.push({ accountId, accountName, accessToken, type, autoPostEnabled: true });
        }

        await config.save();
        res.json({ success: true, msg: `${accountName} connected!`, accounts: config.linkedinAccounts });
    } catch (error) {
        console.error("Add Account Error:", error);
        res.status(500).json({ success: false, msg: "Failed to save account" });
    }
};

// 4. Get All Accounts
exports.getAccounts = async (req, res) => {
    try {
        const config = await AppConfig.findOne({ key: "linkedin-multi" });
        const accounts = config?.linkedinAccounts || [];
        res.json({ success: true, accounts });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Error fetching accounts" });
    }
};

// 5. Remove an Account
exports.removeAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const config = await AppConfig.findOne({ key: "linkedin-multi" });
        if (!config) return res.json({ success: true });

        config.linkedinAccounts = config.linkedinAccounts.filter(a => a.accountId !== accountId);
        await config.save();
        res.json({ success: true, msg: "Account removed" });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to remove account" });
    }
};

// 6. Toggle Auto-Post for a specific account
exports.toggleAccountPost = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { enabled } = req.body;
        const config = await AppConfig.findOne({ key: "linkedin-multi" });
        if (!config) return res.status(404).json({ success: false, msg: "No accounts" });

        const account = config.linkedinAccounts.find(a => a.accountId === accountId);
        if (!account) return res.status(404).json({ success: false, msg: "Account not found" });

        account.autoPostEnabled = !!enabled;
        await config.save();
        res.json({ success: true, msg: `Auto-post ${enabled ? "enabled" : "disabled"} for ${account.accountName}` });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to toggle" });
    }
};

// 7. Get Admin Organizations (gracefully fails)
exports.getAdminOrganizations = async (req, res) => {
    try {
        const { accessToken } = req.query;
        if (!accessToken) return res.status(400).json({ success: false, msg: "Access token required" });

        try {
            const rolesResponse = await axios.get("https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMIN&state=APPROVED", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const orgUrns = rolesResponse.data.elements.map(el => el.organization);
            const orgs = [];
            for (const urn of orgUrns) {
                try {
                    const orgId = urn.split(':').pop();
                    const detailsResponse = await axios.get(`https://api.linkedin.com/v2/organizations/${orgId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    orgs.push({ id: urn, name: detailsResponse.data.localizedName || detailsResponse.data.vanityName });
                } catch (err) {
                    console.error(`Error fetching org ${urn}:`, err.message);
                }
            }
            res.json({ success: true, organizations: orgs });
        } catch (apiErr) {
            console.warn("LinkedIn organizationAcls failed:", apiErr.message);
            return res.json({ success: true, organizations: [] });
        }
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to fetch organizations" });
    }
};
