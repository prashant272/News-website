const axios = require("axios");
const AppConfig = require("../Models/AppConfig");

/**
 * OneSignal Service to handle push notifications.
 */
const onesignalService = {
    /**
     * Send a push notification for a news article.
     * @param {Object} newsItem - The news article object.
     */
    sendNotification: async (newsItem) => {
        try {
            // Fetch OneSignal config from AppConfig
            const config = await AppConfig.findOne({ key: "onesignal" });
            
            if (!config || !config.onesignal || !config.onesignal.enabled || !config.onesignal.appId || !config.onesignal.restApiKey) {
                console.log("[OneSignal] Skipping notification: OneSignal not configured or disabled.");
                return { success: false, error: "Not configured" };
            }

            const { appId, restApiKey } = config.onesignal;
            
            // Construct notification payload
            const articleUrl = `https://www.primetimemedia.in/Pages/${newsItem.category}/${newsItem.subCategory || newsItem.category}/${newsItem.slug}`;
            
            const payload = {
                app_id: appId,
                headings: { en: newsItem.title },
                contents: { en: newsItem.summary || "Read the latest news on Prime Time News" },
                url: articleUrl,
                chrome_web_image: newsItem.image || null,
                included_segments: ["All"], // Send to all subscribed users
            };

            const response = await axios.post("https://onesignal.com/api/v1/notifications", payload, {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Basic ${restApiKey}`,
                },
            });

            if (response.data && response.data.id) {
                console.log(`[OneSignal] ✅ Notification sent: "${newsItem.title}" → ID: ${response.data.id}`);
                return { success: true, notificationId: response.data.id };
            } else {
                console.error("[OneSignal] ❌ Failed to send notification:", response.data);
                return { success: false, error: response.data };
            }
        } catch (error) {
            console.error("[OneSignal] sendNotification Error:", error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    },
};

module.exports = onesignalService;
