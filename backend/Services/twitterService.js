const { TwitterApi } = require("twitter-api-v2");

/**
 * Posts a tweet with an article link.
 * @param {object} credentials - Object containing appKey, appSecret, accessToken, accessSecret.
 * @param {string} message - The text content of the tweet.
 * @param {string} articleUrl - The URL of the news article.
 */
const postToTwitter = async (credentials, message, articleUrl) => {
    try {
        if (!credentials.appKey || !credentials.appSecret || !credentials.accessToken || !credentials.accessSecret) {
            console.warn("Twitter auto-post skipped: Missing credentials.");
            return null;
        }

        const client = new TwitterApi({
            appKey: credentials.appKey,
            appSecret: credentials.appSecret,
            accessToken: credentials.accessToken,
            accessSecret: credentials.accessSecret,
        });

        const tweetText = `${message}\n\nRead more: ${articleUrl}`;
        const response = await client.v2.tweet(tweetText);

        console.log(`Successfully posted to Twitter:`, response.data.id);
        return response.data;
    } catch (error) {
        console.error("Twitter Post Error:", error.message);
        throw error;
    }
};

module.exports = { postToTwitter };
