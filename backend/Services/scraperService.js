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

        if (!title || content.length < 200) {
            throw new Error(`Insufficient content found at ${url}`);
        }

        return {
            title,
            facts: content,
            source: url,
        };
    } catch (error) {
        console.error(`Scraping Error (${url}):`, error.message);
        throw error; // Re-throw to handle in controller
    }
};

// 2. Fetch Latest Links from RSS Feed
const getLatestLinks = async (rssUrl) => {
    try {
        const feed = await parser.parseURL(rssUrl);
        // Return top 2 items to avoid overwhelming processing
        return feed.items.slice(0, 2).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
    } catch (error) {
        console.error(`RSS Error (${rssUrl}):`, error.message);
        return [];
    }
};

module.exports = { scrapeNews, getLatestLinks };
