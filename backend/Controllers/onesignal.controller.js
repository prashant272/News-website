const AppConfig = require("../Models/AppConfig");

/**
 * OneSignal Controller to handle configuration.
 */

// 1. Save Global OneSignal Config
exports.saveGlobalOneSignalConfig = async (req, res) => {
    try {
        const { appId, restApiKey, enabled } = req.body;

        if (!appId || !restApiKey) {
            return res.status(400).json({ success: false, msg: "appId and restApiKey are required" });
        }

        // Upsert — create or update the single 'onesignal' config document
        await AppConfig.findOneAndUpdate(
            { key: "onesignal" },
            {
                key: "onesignal",
                onesignal: {
                    appId,
                    restApiKey,
                    enabled: typeof enabled !== "undefined" ? enabled : true,
                }
            },
            { upsert: true, new: true }
        );

        console.log(`[OneSignal] Global config saved: ${appId}`);
        res.json({ success: true, msg: "OneSignal configuration saved successfully." });

    } catch (error) {
        console.error("Save Global OneSignal Config Error:", error);
        res.status(500).json({ success: false, msg: "Failed to save configuration" });
    }
};

// 2. Get Global OneSignal Status
exports.getGlobalOneSignalStatus = async (req, res) => {
    try {
        const config = await AppConfig.findOne({ key: "onesignal" });

        if (!config || !config.onesignal?.appId) {
            return res.json({ success: true, configured: false, onesignal: null });
        }

        res.json({
            success: true,
            configured: true,
            onesignal: {
                appId: config.onesignal.appId,
                enabled: config.onesignal.enabled,
                // Do not return restApiKey for security reasons
            }
        });
    } catch (error) {
        console.error("Get OneSignal Status Error:", error);
        res.status(500).json({ success: false, msg: "Error fetching OneSignal status" });
    }
};

// 3. Toggle OneSignal on/off
exports.toggleOneSignal = async (req, res) => {
    try {
        const { enabled } = req.body;
        const config = await AppConfig.findOne({ key: "onesignal" });

        if (!config) {
            return res.status(404).json({ success: false, msg: "OneSignal not configured yet" });
        }

        config.onesignal.enabled = !!enabled;
        await config.save();

        res.json({ success: true, msg: `OneSignal notifications ${enabled ? "enabled" : "disabled"}.`, enabled: config.onesignal.enabled });
    } catch (error) {
        res.status(500).json({ success: false, msg: "Failed to toggle OneSignal" });
    }
};
