const BreakingNews = require("../Models/BreakingNews");

// Get all active breaking news
exports.getBreakingNews = async (req, res) => {
    try {
        const { all } = req.query;
        let query = { isActive: true };

        // If all=true, show both active and inactive (for admin)
        if (all === 'true') {
            query = {};
        }

        const news = await BreakingNews.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: news.length, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new breaking news
exports.addBreakingNews = async (req, res) => {
    try {
        const { title, link, priority } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, msg: "Title is required" });
        }

        const news = await BreakingNews.create({ title, link, priority });
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
