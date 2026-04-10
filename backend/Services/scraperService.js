const axios = require("axios");
const cheerio = require("cheerio");
const Parser = require("rss-parser");

const parser = new Parser();

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

/**
 * Repairs malformed XML by fixing attributes without values (Common in Hindustan Times feeds).
 */
const repairXml = (xml) => {
    if (!xml) return xml;
    // Fix <tag attr> and <tag attr > by adding =""
    // Matches attributes like 'allowfullscreen' or 'async' that sometimes appear without =""
    return xml.replace(/<([a-zA-Z0-9:]+)([^>]*?)\s([a-zA-Z0-9_\-]+)(\s|>)/g, '<$1$2 $3=""$4');
};



// 1. Scrape Content from a specific Article URL
const scrapeNews = async (url) => {
    try {
        // 0. Clean URL (Remove fragments that cause 403 on some sites)
        const cleanUrl = url.split('#')[0];
        const domain = new URL(cleanUrl).hostname;

        // 1. Determine realistic headers with rotation
        const config = {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
                'Accept-Encoding': 'identity', // Bypass some compression issues
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Referer': `https://www.google.com/search?q=${domain}`
            },
            timeout: 15000
        };

        console.log(`[Scrape] Loading Content: ${cleanUrl}`);
        const { data } = await axios.get(cleanUrl, config);

        const $ = cheerio.load(data);

        // Try to find the main heading
        const title = $("h1").first().text().trim() || $("title").first().text().trim();

        // Select paragraphs - avoid nav/footer/sidebar text
        // Expanded selectors for TOI, News18, NDTV, and Mint
        let paragraphElements = $("article p, .story-body p, .article-body p, #article-body p, .content p, .story p, .story-details p, .full-details p, .article-content p, .story-text p, .description p, ._3W_un p, .article_content p, .long-description p, .story-details p");

        // Fallback if specific containers aren't found
        if (paragraphElements.length === 0) {
            paragraphElements = $("div[class*='content'] p, div[class*='story'] p, div[id*='article'] p, div[class*='description'] p, p");
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
        const { data: rawXml } = await axios.get(rssUrl, config);
        
        // Repair malformed XML before parsing
        const cleanedXml = repairXml(rawXml);
        const feed = await parser.parseString(cleanedXml);


        // --- DATE FILTER: only accept news published in the last 5 hours (User Request) ---
        const now = new Date();
        const cutoff = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

        const recentItems = feed.items.filter(item => {
            if (!item.pubDate) return true; // fallback to true if no date
            const pubDate = new Date(item.pubDate);
            return pubDate >= cutoff; 
        });

        console.log(`[${feed.title || rssUrl}] Found ${feed.items.length} items, ${recentItems.length} are within last 5 hours.`);


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
