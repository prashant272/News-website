const axios = require("axios");

const authHeaders = (accessToken) => ({
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
});

/**
 * Step 1: Initialize image upload on LinkedIn - gets an upload URL + image URN
 */
const initializeImageUpload = async (accessToken, authorId) => {
    const res = await axios.post(
        "https://api.linkedin.com/v2/images?action=initializeUpload",
        { initializeUploadRequest: { owner: authorId } },
        { headers: authHeaders(accessToken) }
    );
    return {
        uploadUrl: res.data.value.uploadUrl,
        imageUrn: res.data.value.image,
    };
};

/**
 * Step 2: Download image from Cloudinary URL and upload to LinkedIn
 */
const uploadImageToLinkedIn = async (uploadUrl, imageUrl) => {
    // Download image as buffer from Cloudinary
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imgRes.data);

    await axios.put(uploadUrl, imageBuffer, {
        headers: {
            "Content-Type": imgRes.headers["content-type"] || "image/jpeg",
        },
    });
};

/**
 * Posts an article with image to a LinkedIn profile or Organization Page.
 * @param {string} accessToken - OAuth 2.0 access token
 * @param {string} authorId   - URN: "urn:li:person:XXXX" or "urn:li:organization:XXXX"
 * @param {string} message    - Post text
 * @param {string} articleUrl - News article URL
 * @param {string} imageUrl   - Optional image URL (Cloudinary etc.)
 */
const postToLinkedIn = async (accessToken, authorId, message, articleUrl, imageUrl) => {
    try {
        if (!accessToken || !authorId) {
            console.warn("LinkedIn auto-post skipped: Missing credentials.");
            return null;
        }

        const headers = authHeaders(accessToken);
        let postBody;

        if (imageUrl) {
            try {
                // 1. Initialize upload
                const { uploadUrl, imageUrn } = await initializeImageUpload(accessToken, authorId);

                // 2. Upload image bytes
                await uploadImageToLinkedIn(uploadUrl, imageUrl);

                console.log("[LinkedIn] Image uploaded successfully:", imageUrn);

                // 3. Build post body with image
                postBody = {
                    author: authorId,
                    commentary: message,
                    visibility: "PUBLIC",
                    distribution: {
                        feedDistribution: "MAIN_FEED",
                        targetEntities: [],
                        thirdPartyDistributionChannels: []
                    },
                    content: {
                        media: {
                            id: imageUrn,
                            title: message.split('\n')[0] || "News Update",
                            description: (message.split('\n')[2] || "").substring(0, 200),
                        }
                    },
                    lifecycleState: "PUBLISHED"
                };
            } catch (imgErr) {
                console.warn("[LinkedIn] Image upload failed, falling back to article post:", imgErr.message);
                // Fallback: article post without image
                postBody = buildArticlePost(authorId, message, articleUrl);
            }
        } else {
            postBody = buildArticlePost(authorId, message, articleUrl);
        }

        const response = await axios.post("https://api.linkedin.com/v2/posts", postBody, { headers });

        console.log("[LinkedIn] Post success:", response.headers['x-restli-id'] || "OK");
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("LinkedIn API Error:", JSON.stringify(error.response.data, null, 2));
            console.error("Status:", error.response.status);
        } else {
            console.error("LinkedIn Post Error:", error.message);
        }
        throw error;
    }
};

const buildArticlePost = (authorId, message, articleUrl) => ({
    author: authorId,
    commentary: message,
    visibility: "PUBLIC",
    distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
    },
    content: {
        article: {
            source: articleUrl,
            title: message.split('\n')[0] || "News Update",
            description: message.substring(0, 200)
        }
    },
    lifecycleState: "PUBLISHED"
});

module.exports = { postToLinkedIn };
