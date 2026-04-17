const BreakingNews = require("../Models/BreakingNews");
const { getLatestLinks, scrapeLiveBlog, hasHindiCharacters } = require("../Services/scraperService");

// Get all active breaking news
exports.scrapeBreakingNews = async (req, res) => {
    try {
        // Immediate Cleanup: Delete news older than 2 days before scraping new ones
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        await BreakingNews.deleteMany({ createdAt: { $lt: twoDaysAgo } });

        const sources = [
            // --- NATIONAL / INDIA ---
            { name: "Aaj Tak India", url: "https://www.aajtak.in/rssfeeds/?id=india", cat: 'india' },
            { name: "Zee News Hindi", url: "https://zeenews.india.com/hindi/india.xml", cat: 'india' },
            { name: "News18 Hindi", url: "https://hindi.news18.com/commonfeeds/v1/hindi/rss/india.xml", cat: 'india' },
            { name: "Amar Ujala India", url: "https://www.amarujala.com/rss/india-news.xml", cat: 'india' },
            { name: "NDTV India", url: "https://feeds.feedburner.com/ndtvnews-india-news", cat: 'india' },
            { name: "India TV", url: "https://www.indiatvnews.com/rssnews/topstory.xml", cat: 'india' },
            { name: "ABP News India", url: "https://news.abplive.com/news/india/feed", cat: 'india' },
            
            // --- WORLD ---
            { name: "BBC News World", url: "http://feeds.bbci.co.uk/news/world/rss.xml", cat: 'world' },
            { name: "CNN World", url: "https://rss.cnn.com/rss/edition_world.rss", cat: 'world' },

            // --- STATES / REGIONAL ---
            { name: "Live Hindustan Bihar", url: "https://www.livehindustan.com/bihar/rss/", cat: 'state', state: 'bihar' },
            { name: "Bihar Tak", url: "https://bihartak.tak.live/rss", cat: 'state', state: 'bihar' },
            { name: "Live Hindustan UP", url: "https://www.livehindustan.com/uttar-pradesh/rss/", cat: 'state', state: 'uttar-pradesh' },
            
            // --- GENERAL / TOP STORIES ---
            { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss", cat: 'india' },
            { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", cat: 'india' },
            
            // --- LIVE BLOGS / REAL-TIME ---
            { name: "Aaj Tak Live", url: "https://www.aajtak.in/breakingnews/story/latest-breaking-news-in-hindi-17-april-2026-ntc-rmxk-2525688-2026-04-17", cat: 'india', type: 'liveblog' },
        ];

        let allNewItems = [];
        for (const source of sources) {
            try {
                let items = [];
                if (source.type === 'liveblog') {
                    items = await scrapeLiveBlog(source.url);
                } else {
                    items = await getLatestLinks(source.url);
                }
                const itemsWithSource = items.map(item => ({ 
                    ...item, 
                    sourceName: source.name, 
                    cat: source.cat,
                    state: source.state || 'universal'
                }));
                allNewItems = [...allNewItems, ...itemsWithSource];
            } catch (err) {
                console.error(`Error scraping ${source.name}:`, err.message);
            }
        }

        // Shuffling to mix initially
        allNewItems.sort(() => Math.random() - 0.5);

        // --- CATEGORICAL BALANCING ---
        const finalSelection = [];
        const existingTitles = await BreakingNews.find().select('title').lean();
        const existingSet = new Set(existingTitles.map(t => t.title));

        // Group by category
        const categories = { india: [], state: [], world: [], other: [] };
        for (const item of allNewItems) {
            if (!existingSet.has(item.title)) {
                const c = item.cat || 'other';
                if (categories[c]) categories[c].push(item);
                else categories.other.push(item);
            }
        }

        // Picking logic: 5 India, 5 State, 5 World/Other
        const pickFrom = (catName, limit) => {
            const picked = categories[catName].slice(0, limit);
            finalSelection.push(...picked);
            // Remove picked from main pool to avoid duplicates if we fallback
            const pickedTitles = new Set(picked.map(p => p.title));
            categories[catName] = categories[catName].filter(p => !pickedTitles.has(p.title));
        };

        pickFrom('india', 6);
        pickFrom('state', 6);
        pickFrom('world', 3);

        // Fallback: If we didn't reach 15, fill with whatever is left
        if (finalSelection.length < 15) {
            const leftovers = [...categories.india, ...categories.state, ...categories.world, ...categories.other];
            finalSelection.push(...leftovers.slice(0, 15 - finalSelection.length));
        }

        let staggerTime = new Date();
        const INTERVAL_MINUTES = 4; // Slightly faster release (every 4 mins)

        const samples = finalSelection.slice(0, 15).map(item => {
            const scheduled = new Date(staggerTime);
            staggerTime.setMinutes(staggerTime.getMinutes() + INTERVAL_MINUTES);
            return {
                title: item.title,
                link: item.link,
                source: item.sourceName || "Global",
                priority: 0,
                isActive: true,
                lang: hasHindiCharacters(item.title) ? "hi" : "en",
                state: item.state || "universal",
                scheduledAt: scheduled
            };
        });

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
            // STRICT ISOLATION: No leaking news from other languages
            query.lang = lang;
        }
        if (state) query.state = state;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        if (showAll === 'true') {
            // Admin explicitly wants to see all history (still limited below)
            // No date filter
        } else if (all === 'true') {
            // Visitors seeing "Full Story" for today
            query.scheduledAt = {
                $gte: today,
                $lt: tomorrow
            };
        } else {
            // Default Ticker: Only show released news for today
            query.scheduledAt = {
                $lte: new Date(),
                $gte: today
            };
        }

        const news = await BreakingNews.find(query)
            .sort({ scheduledAt: -1, createdAt: -1 })
            .limit(100);

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

        // Automatic Language Detection if not provided
        const detectedLang = language || (hasHindiCharacters(title) ? "hi" : "en");

        const news = await BreakingNews.create({ 
            title, 
            link, 
            priority,
            lang: detectedLang,
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
