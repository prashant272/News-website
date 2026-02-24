const axios = require("axios");

/**
 * Posts a message and link to a Facebook Page.
 * @param {string} pageId - The ID of the Facebook Page.
 * @param {string} pageAccessToken - The Page Access Token.
 * @param {string} message - The message text (e.g., article title).
 * @param {string} link - The URL to share.
 */
exports.postToPage = async (pageId, pageAccessToken, message, link) => {
    try {
        if (!pageId || !pageAccessToken) {
            console.warn("Facebook auto-post skipped: Missing credentials for page", pageId);
            return { success: false, msg: "Missing credentials" };
        }

        const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
            message,
            link,
            published: true,
            access_token: pageAccessToken
        });

        console.log(`Successfully posted to Facebook Page ${pageId}:`, response.data.id);
        return { success: true, postId: response.data.id };

    } catch (error) {
        console.error("Facebook Post Error:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};
