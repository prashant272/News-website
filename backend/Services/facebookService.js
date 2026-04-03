const axios = require("axios");
const FormData = require("form-data");

/**
 * Posts a message and branded image to a Facebook Page.
 * @param {string} pageId - The ID of the Facebook Page.
 * @param {string} pageAccessToken - The Page Access Token.
 * @param {string} message - The message text (e.g., article title).
 * @param {string} link - The URL to share.
 * @param {Buffer|string} imageData - The image Buffer or URL.
 */
exports.postToPage = async (pageId, pageAccessToken, message, link, imageData) => {
    try {
        if (!pageId || !pageAccessToken) {
            console.warn("Facebook auto-post skipped: Missing credentials for page", pageId);
            return { success: false, msg: "Missing credentials" };
        }

        const formData = new FormData();
        formData.append("caption", `${message}\n\nRead more: ${link}`);
        formData.append("access_token", pageAccessToken);
        formData.append("published", "true");

        if (Buffer.isBuffer(imageData)) {
            formData.append("source", imageData, { filename: "news-post.png" });
        } else if (typeof imageData === "string" && imageData.startsWith("http")) {
            formData.append("url", imageData);
        } else {
            console.warn("Facebook Post: No valid image data provided.");
            // Fallback to text-only post if no image
            return await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
                message: `${message}\n\nRead more: ${link}`,
                access_token: pageAccessToken
            });
        }

        const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, formData, {
            headers: formData.getHeaders()
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
