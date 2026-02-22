const axios = require("axios");
const cheerio = require("cheerio");
const Parser = require("rss-parser");

const parser = new Parser();

// 1. Scrape Content from a specific Article URL
const scrapeNews = async (url) => {
    try {
        // Determine user agent to avoid blocking
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const { data } = await axios.get(url, config);
        const $ = cheerio.load(data);

        // Try to find the main heading
        const title = $("h1").first().text().trim() || $("title").first().text().trim();

        // Select paragraphs - avoid nav/footer/sidebar text
        // Common content containers: article, main, .story-body, .content, #content
        let paragraphElements = $("article p, .story-body p, .article-body p, #article-body p, .content p, .story p");

        // Fallback if specific containers aren't found
        if (paragraphElements.length === 0) {
            paragraphElements = $("p");
        }

        const paragraphs = [];
        paragraphElements.each((i, el) => {
            const text = $(el).text().trim();
            // Filter out short/empty lines or common boilerplate
            if (text.length > 60 && !text.includes("Read Also") && !text.includes("Subscribe")) {
                paragraphs.push(text);
            }
        });

        // Get substantial content
        const content = paragraphs.slice(0, 15).join(" ");

        // Extract Featured Image (og:image or first img)
        let image = $('meta[property="og:image"]').attr('content');
        if (!image) {
            image = $('meta[name="twitter:image"]').attr('content');
        }
        if (!image) {
            const firstImg = $('article img, .story-body img, .content img').first();
            if (firstImg.length > 0) {
                image = firstImg.attr('src');
            }
        }

        if (!title || content.length < 200) {
            throw new Error(`Insufficient content found at ${url}`);
        }

        return {
            title,
            facts: content,
            source: url,
            image: image || ''
        };
    } catch (error) {
        console.error(`Scraping Error (${url}):`, error.message);
        throw error; // Re-throw to handle in controller
    }
};

// 2. Fetch Latest Links from RSS Feed (only last 24 hours)
const getLatestLinks = async (rssUrl) => {
    try {
        const feed = await parser.parseURL(rssUrl);

        // --- DATE FILTER: only accept news published in the last 24 hours ---
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        const recentItems = feed.items.filter(item => {
            if (!item.pubDate) return false; // skip if no date
            const pubDate = new Date(item.pubDate);
            return pubDate >= cutoff; // only items from last 24 hours
        });

        console.log(`[${feed.title}] Found ${feed.items.length} items, ${recentItems.length} are within last 24 hours.`);

        // Return top 10 recent items
        return recentItems.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: feed.title // Capture feed title as source name if available
        }));
    } catch (error) {
        console.error(`RSS Error (${rssUrl}):`, error.message);
        return [];
    }
};

module.exports = { scrapeNews, getLatestLinks };
