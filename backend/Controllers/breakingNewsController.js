const BreakingNews = require("../Models/BreakingNews");
const { getLatestLinks } = require("../services/scraperService");

// Get all active breaking news
exports.scrapeBreakingNews = async (req, res) => {
    try {
        // Immediate Cleanup: Delete news older than 2 days before scraping new ones
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        await BreakingNews.deleteMany({ createdAt: { $lt: twoDaysAgo } });

        const sources = [
            { name: "Aaj Tak", url: "https://www.aajtak.in/rssfeeds/?id=home" },
            { name: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-india-news" },
            { name: "India TV", url: "https://www.indiatvnews.com/rssnews/topstory.xml" },
            { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
            { name: "Zee News", url: "https://zeenews.india.com/rss/india-national-news.xml" },
            { name: "ABP News", url: "https://news.abplive.com/news/india/feed" },
            { name: "Republic World", url: "https://www.republicworld.com/feeds/india-news.xml" },
            { name: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml" },
            { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms" },
        ];

        let allNewItems = [];
        for (const source of sources) {
            try {
                const items = await getLatestLinks(source.url);
                const itemsWithSource = items.map(item => ({ ...item, sourceName: source.name }));
                allNewItems = [...allNewItems, ...itemsWithSource];
            } catch (err) {
                console.error(`Error scraping ${source.name}:`, err.message);
            }
        }

        // Shuffle to mix sources
        allNewItems.sort(() => Math.random() - 0.5);

        // Filter and map to model
        const samples = [];
        const existingTitles = await BreakingNews.find().select('title').lean();
        const existingSet = new Set(existingTitles.map(t => t.title));

        let staggerTime = new Date();
        const INTERVAL_MINUTES = 10; // Release every 20 minutes

        for (const item of allNewItems) {
            if (!existingSet.has(item.title)) {
                samples.push({
                    title: item.title,
                    link: item.link,
                    source: item.sourceName || "Global",
                    priority: 0,
                    isActive: true,
                    scheduledAt: new Date(staggerTime)
                });
                // Increment stagger time for next item
                staggerTime.setMinutes(staggerTime.getMinutes() + INTERVAL_MINUTES);
                if (samples.length >= 50) break; // Limit to 50
            }
        }

        if (samples.length === 0) {
            return res.status(200).json({ success: true, message: "No new breaking news found." });
        }

        const result = await BreakingNews.insertMany(samples);
        res.status(201).json({
            success: true,
            message: `${result.length} real news items added. They will appear one by one every ${INTERVAL_MINUTES} minutes.`,
            count: result.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBreakingNews = async (req, res) => {
    try {
        const { all, showAll, lang, state } = req.query;
        let query = { isActive: true };

        if (lang) {
            if (lang === 'en') {
                query.$or = [{ lang: 'en' }, { lang: { $exists: false } }, { lang: null }];
            } else {
                query.lang = lang;
            }
        }
        if (state) query.state = state;

        // Start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (showAll === 'true') {
            // Admin explicitly wants to see all history (still limited below)
            query = {}; 
        } else {
            // Default: Only show today's news
            query.scheduledAt = {
                $lte: new Date(), // Already released
                $gte: today // From today onwards
            };
        }

        // Overwrite if only 'all' is passed (legacy admin call)
        // If 'all' is true but 'showAll' is not provided, we still filter for today to keep it fast
        if (all === 'true' && showAll !== 'true') {
            query = {
                scheduledAt: { $gte: today }
            };
        }

        const news = await BreakingNews.find(query)
            .sort({ scheduledAt: -1, createdAt: -1 })
            .limit(100); // Sanity limit for performance

        res.status(200).json({ success: true, count: news.length, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new breaking news
exports.addBreakingNews = async (req, res) => {
    try {
        const { title, link, priority, language, state } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, msg: "Title is required" });
        }

        const news = await BreakingNews.create({ 
            title, 
            link, 
            priority,
            lang: language || "en",
            state: state || "universal"
        });
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update breaking news
exports.updateBreakingNews = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await BreakingNews.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, msg: "Not found" });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete breaking news
exports.deleteBreakingNews = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BreakingNews.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, msg: "Not found" });
        }
        res.status(200).json({ success: true, msg: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// Bulk add 50 sample breaking news news
exports.bulkAddBreakingNews = async (req, res) => {
    try {
        const samples = [];
        for (let i = 1; i <= 50; i++) {
            samples.push({
                title: `Breaking News Item #${i}: This is a sample professional breaking news headline for testing and layout verification.`,
                link: null,
                priority: i,
                isActive: true
            });
        }

        // Optional: clear existing if user wants? (User didn't ask, so just append)
        const result = await BreakingNews.insertMany(samples);
        res.status(201).json({
            success: true,
            message: "50 breaking news items added successfully",
            count: result.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
