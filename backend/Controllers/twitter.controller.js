const { TwitterApi } = require("twitter-api-v2");
const User = require("../Models/user.model");
const AppConfig = require("../Models/AppConfig");

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI;

// 1. Generate Twitter OAuth URL (OAuth 2.0)
exports.getTwitterAuthUrl = (req, res) => {
    const client = new TwitterApi({ clientId: TWITTER_CLIENT_ID, clientSecret: TWITTER_CLIENT_SECRET });
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(TWITTER_REDIRECT_URI, { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] });
    
    // In a real app, you'd store codeVerifier and state in session or DB
    // For simplicity, we'll return them (though not ideal for production security without sessions)
    res.json({ url, codeVerifier, state });
};

// 2. Handle OAuth Callback
exports.handleTwitterCallback = async (req, res) => {
    try {
        const { code, codeVerifier } = req.query;
        if (!code || !codeVerifier) return res.status(400).json({ success: false, msg: "Code and codeVerifier are required" });

        const client = new TwitterApi({ clientId: TWITTER_CLIENT_ID, clientSecret: TWITTER_CLIENT_SECRET });
        const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: TWITTER_REDIRECT_URI,
        });

        // Get user info
        const userClient = new TwitterApi(accessToken);
        const { data: user } = await userClient.v2.me();

        res.json({
            success: true,
            accessToken,
            refreshToken,
            expiresIn,
            username: user.username,
        });
    } catch (error) {
        console.error("Twitter Callback Error:", error);
        res.status(500).json({ success: false, msg: "Twitter authentication failed" });
    }
};

// 3. Save Global Twitter Config
// Note: For Twitter v2 with OAuth2, we usually need appKey/appSecret if using OAuth 1.0a
// But for automation, sometimes App-only or User-context with persistent secrets is easier.
// The user asked for it to be like Facebook, so I'll support saving the full set.
exports.saveGlobalConfig = async (req, res) => {
    try {
        const { appKey, appSecret, accessToken, accessSecret, username } = req.body;

        await AppConfig.findOneAndUpdate(
            { key: "twitter" },
            {
                key: "twitter",
                twitter: { appKey, appSecret, accessToken, accessSecret, username, connectedAt: new Date(), autoPostEnabled: true }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, msg: "Twitter global config saved." });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to save config" });
    }
};

// 4. Get Global Status
exports.getGlobalStatus = async (req, res) => {
    try {
        const config = await AppConfig.findOne({ key: "twitter" });
        if (!config || !config.twitter?.accessToken) {
            return res.json({ success: true, connected: false });
        }
        res.json({ success: true, connected: true, twitter: config.twitter });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Error fetching status" });
    }
};

// 5. Toggle Auto-Post
exports.toggleAutoPost = async (req, res) => {
    try {
        const { enabled } = req.body;
        const config = await AppConfig.findOne({ key: "twitter" });
        if (!config) return res.status(404).json({ success: false, msg: "Not connected" });

        config.twitter.autoPostEnabled = !!enabled;
        await config.save();
        res.json({ success: true, msg: `Auto-post ${enabled ? "enabled" : "disabled"}` });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to toggle" });
    }
};

// 6. Disconnect
exports.disconnectTwitter = async (req, res) => {
    try {
        await AppConfig.findOneAndDelete({ key: "twitter" });
        res.json({ success: true, msg: "Twitter disconnected." });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to disconnect" });
    }
};
