const axios = require("axios");
const User = require("../models/user.model");
const AppConfig = require("../Models/AppConfig");

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

// 1. Generate Facebook OAuth URL
exports.getFacebookAuthUrl = (req, res) => {
    const scope = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"].join(",");
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}&scope=${scope}&response_type=code`;
    res.json({ url });
};

// 2. Handle OAuth Callback — exchange code for long-lived token + return page list  
exports.handleFacebookCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ success: false, msg: "Authorization code is required" });
        }

        // Step A: Exchange code for Short-lived User Access Token
        const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
            params: {
                client_id: FB_APP_ID,
                client_secret: FB_APP_SECRET,
                redirect_uri: FB_REDIRECT_URI,
                code
            }
        });

        const shortLivedToken = tokenResponse.data.access_token;

        // Step B: Exchange for Long-lived User Access Token (valid ~60 days)
        const longLivedResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
            params: {
                grant_type: "fb_exchange_token",
                client_id: FB_APP_ID,
                client_secret: FB_APP_SECRET,
                fb_exchange_token: shortLivedToken
            }
        });

        const longLivedToken = longLivedResponse.data.access_token;

        // Step C: Fetch the list of Facebook Pages managed by this user
        const pagesResponse = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
            params: { access_token: longLivedToken }
        });

        const pages = pagesResponse.data.data;

        // Return pages and the long-lived token to the admin so they can choose the page
        res.json({
            success: true,
            pages,       // Admin picks which page to use
            longLivedToken  // Needed to get the Page Access Token
        });

    } catch (error) {
        console.error("Facebook Callback Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, msg: "Facebook authentication failed", error: error.response?.data });
    }
};

// 3. Save Global Facebook Page Config (system-level, not per-user)
exports.saveGlobalPageConfig = async (req, res) => {
    try {
        const { pageId, pageName, pageAccessToken } = req.body;

        if (!pageId || !pageAccessToken) {
            return res.status(400).json({ success: false, msg: "pageId and pageAccessToken are required" });
        }

        // Upsert — create or update the single 'facebook' config document
        await AppConfig.findOneAndUpdate(
            { key: "facebook" },
            {
                key: "facebook",
                facebook: {
                    pageId,
                    pageName: pageName || "",
                    pageAccessToken,
                    connectedAt: new Date(),
                    autoPostEnabled: true,
                }
            },
            { upsert: true, new: true }
        );

        console.log(`[Facebook] Global Page config saved: ${pageName} (${pageId})`);
        res.json({ success: true, msg: `Facebook Page "${pageName}" connected successfully for auto-posting.` });

    } catch (error) {
        console.error("Save Global FB Config Error:", error);
        res.status(500).json({ success: false, msg: "Failed to save configuration" });
    }
};

// 4. Get Global Facebook Connection Status
exports.getGlobalFacebookStatus = async (req, res) => {
    try {
        const config = await AppConfig.findOne({ key: "facebook" });

        if (!config || !config.facebook?.pageId) {
            return res.json({ success: true, connected: false, facebook: null });
        }

        res.json({
            success: true,
            connected: true,
            facebook: {
                pageId: config.facebook.pageId,
                pageName: config.facebook.pageName,
                connectedAt: config.facebook.connectedAt,
                autoPostEnabled: config.facebook.autoPostEnabled,
            }
        });
    } catch (error) {
        console.error("Get FB Status Error:", error);
        res.status(500).json({ success: false, msg: "Error fetching Facebook status" });
    }
};

// 5. Toggle auto-post on/off globally
exports.toggleAutoPost = async (req, res) => {
    try {
        const { enabled } = req.body;
        const config = await AppConfig.findOne({ key: "facebook" });

        if (!config) {
            return res.status(404).json({ success: false, msg: "Facebook not connected yet" });
        }

        config.facebook.autoPostEnabled = !!enabled;
        await config.save();

        res.json({ success: true, msg: `Auto-post ${enabled ? "enabled" : "disabled"}.`, autoPostEnabled: config.facebook.autoPostEnabled });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to toggle auto-post" });
    }
};

// 6. Disconnect Facebook (remove global config)
exports.disconnectFacebook = async (req, res) => {
    try {
        await AppConfig.findOneAndDelete({ key: "facebook" });
        res.json({ success: true, msg: "Facebook Page disconnected." });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to disconnect" });
    }
};

// ── LEGACY: Per-user endpoints (kept for backward compatibility) ──────────────

exports.testPost = async (req, res) => {
    try {
        const facebookService = require("../Services/facebookService");

        // First try global config
        const globalConfig = await AppConfig.findOne({ key: "facebook" });
        if (globalConfig?.facebook?.pageId) {
            const result = await facebookService.postToPage(
                globalConfig.facebook.pageId,
                globalConfig.facebook.pageAccessToken,
                "✅ Test post from PrimeTime Media — Auto-Post is working!",
                "https://www.primetimemedia.in"
            );
            return res.json(result.success
                ? { success: true, msg: "Test post successful!", postId: result.postId }
                : { success: false, msg: result.error }
            );
        }

        // Fallback to user-level config
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user || !user.facebook?.pageId) {
            return res.status(400).json({ success: false, msg: "Facebook not connected" });
        }

        const result = await facebookService.postToPage(
            user.facebook.pageId,
            user.facebook.pageAccessToken,
            "✅ Test post from PrimeTime Media — Auto-Post is working!",
            "https://www.primetimemedia.in"
        );

        res.json(result.success
            ? { success: true, msg: "Test post successful!", postId: result.postId }
            : { success: false, msg: result.error }
        );
    } catch (error) {
        res.status(500).json({ success: false, msg: "Internal Error" });
    }
};

exports.saveFacebookPageConfig = async (req, res) => {
    try {
        const { userId, pageId, pageName, pageAccessToken } = req.body;

        if (!userId || !pageId || !pageAccessToken) {
            return res.status(400).json({ success: false, msg: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        user.facebook = { pageId, pageName, pageAccessToken, connectedAt: new Date() };
        await user.save();

        res.json({ success: true, msg: "Facebook Page connected for this user." });
    } catch (error) {
        console.error("Save FB Config Error:", error);
        res.status(500).json({ success: false, msg: "Failed to save configuration" });
    }
};

exports.getFacebookStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("facebook");
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        res.json({
            success: true,
            connected: !!user.facebook?.pageId,
            facebook: user.facebook
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Error fetching status" });
    }
};
