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

        console.log(`[Scrape] Loading Content: ${url || 'unknown'}`);
        const { data } = await axios.get(url, config);
        const $ = cheerio.load(data);

        // Try to find the main heading
        const title = $("h1").first().text().trim() || $("title").first().text().trim();

        // Select paragraphs - avoid nav/footer/sidebar text
        // Common content containers: article, main, .story-body, .content, #content
        let paragraphElements = $("article p, .story-body p, .article-body p, #article-body p, .content p, .story p, .story-details p, .full-details p, .article-content p, .story-text p, .description p");

        // Fallback if specific containers aren't found
        if (paragraphElements.length === 0) {
            paragraphElements = $("div[class*='content'] p, div[class*='story'] p, div[id*='article'] p, p");
        }

        const paragraphs = [];
        paragraphElements.each((i, el) => {
            const text = $(el).text().trim();
            // Filter out short/empty lines or common boilerplate
            const boilerplateWords = ["Read Also", "Subscribe", "Read More", "Click here", "Follow us", "Advertisement"];
            const isBoilerplate = boilerplateWords.some(word => text.includes(word));
            
            if (text.length > 50 && !isBoilerplate) {
                paragraphs.push(text);
            }
        });

        // Get substantial content (up to 20 paragraphs)
        const content = paragraphs.slice(0, 20).join(" ");

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
        // Fetch XML with axios to include headers (bypass 403)
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            },
            timeout: 10000
        };

        console.log(`[RSS] Fetching Feed: ${rssUrl}`);
        const { data: xmlData } = await axios.get(rssUrl, config);
        const feed = await parser.parseString(xmlData);

        // --- DATE FILTER: only accept news published in the last 6 hours (User Request) ---
        const now = new Date();
        const cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

        const recentItems = feed.items.filter(item => {
            if (!item.pubDate) return true; // fallback to true if no date
            const pubDate = new Date(item.pubDate);
            return pubDate >= cutoff; 
        });

        console.log(`[${feed.title || rssUrl}] Found ${feed.items.length} items, ${recentItems.length} are within last 6 hours.`);

        // Return top 10 recent items
        return recentItems.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link || item.guid,
            pubDate: item.pubDate,
            source: feed.title || rssUrl
        }));
    } catch (error) {
        console.error(`RSS Error (${rssUrl}):`, error.message);
        return [];
    }
};

module.exports = { scrapeNews, getLatestLinks };
