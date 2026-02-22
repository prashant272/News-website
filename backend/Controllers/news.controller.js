const NewsArticle = require("../models/NewsArticle");
const User = require("../models/user.model");
const AppConfig = require("../Models/AppConfig");
const facebookService = require("../Services/facebookService");
const dotenv = require("dotenv");
dotenv.config({ path: "./Config/config.env" });
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Trigger Facebook auto-post when an article is published.
 * Priority: 1) Global AppConfig  2) Per-user facebook config
 */
async function triggerFacebookPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    let pageId, pageAccessToken;

    // 1. Try global system-level config first (works for ALL articles including AI Bot)
    const globalConfig = await AppConfig.findOne({ key: "facebook" });
    if (globalConfig?.facebook?.pageId && globalConfig?.facebook?.autoPostEnabled) {
      pageId = globalConfig.facebook.pageId;
      pageAccessToken = globalConfig.facebook.pageAccessToken;
      console.log(`[Facebook] Using global config for auto-post: ${globalConfig.facebook.pageName}`);
    }
    // 2. Fallback: per-user credentials (manual articles with authorId)
    else if (newsItem.authorId) {
      const user = await User.findById(newsItem.authorId);
      if (user?.facebook?.pageId) {
        pageId = user.facebook.pageId;
        pageAccessToken = user.facebook.pageAccessToken;
        console.log(`[Facebook] Using per-user config for auto-post: user ${newsItem.authorId}`);
      }
    }

    if (!pageId || !pageAccessToken) {
      console.log("[Facebook] Auto-post skipped: No Facebook Page connected.");
      return;
    }

    const articleUrl = `https://www.primetimemedia.in/Pages/${newsItem.category}/${newsItem.subCategory || newsItem.category}/${newsItem.slug}`;
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    const result = await facebookService.postToPage(pageId, pageAccessToken, message, articleUrl);
    if (result.success) {
      console.log(`[Facebook] ✅ Auto-posted: "${newsItem.title}" → Post ID: ${result.postId}`);
    } else {
      console.error(`[Facebook] ❌ Auto-post failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[Facebook] triggerFacebookPost Error:", error);
  }
}


exports.AddNews = async (req, res) => {
  try {
    const {
      title, slug, category, subCategory, summary, content,
      image, tags = [], section, targetLink, nominationLink,
      author, status, authorId
    } = req.body;

    const finalCategory = (category || section)?.toLowerCase();

    if (!title || !slug || !finalCategory || !content) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields: title, slug, category, content",
      });
    }

    const existing = await NewsArticle.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        msg: `Slug '${slug}' already exists.`,
      });
    }

    let imageUrl = null;
    if (image) {
      if (image.startsWith("http")) {
        imageUrl = image;
      } else {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "primetime_news"
          });
          imageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary Upload Error:", uploadError);
        }
      }
    }

    const newItem = new NewsArticle({
      title, slug, category: finalCategory, subCategory: subCategory || null,
      summary: summary || null, content, image: imageUrl, tags,
      targetLink: targetLink || null, nominationLink: nominationLink || null,
      author: author || "Prime Time News",
      authorId: authorId || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null
    });

    await newItem.save();

    // Trigger Facebook auto-post
    if (status === "published") {
      triggerFacebookPost(newItem);
    }

    return res.status(201).json({
      success: true,
      news: newItem,
      section: finalCategory,
      msg: `News added to ${finalCategory} successfully`,
    });
  } catch (error) {
    console.error("Add News Error:", error);
    res.status(500).json({ success: false, msg: "Server error adding news", error: error.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const { includeDrafts, page = 1, limit = 10 } = req.query;
    const query = {};

    if (includeDrafts !== 'true') {
      query.status = 'published';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const news = await NewsArticle.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await NewsArticle.countDocuments(query);

    res.status(200).json({
      success: true,
      news,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      count: news.length,
      msg: "All news fetched successfully",
    });
  } catch (error) {
    console.error("Get All News Error:", error);
    res.status(500).json({ success: false, msg: "Error fetching news", error: error.message });
  }
};

/**
 * Streams news articles as NDJSON for progressive loading.
 */
exports.streamNews = async (req, res) => {
  try {
    const { includeDrafts, section, limit = 500 } = req.query;
    const query = {};

    if (includeDrafts !== 'true') query.status = 'published';
    if (section) query.category = section;

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    const cursor = NewsArticle.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .cursor();

    cursor.on('data', (doc) => {
      res.write(JSON.stringify(doc) + '\n');
    });

    cursor.on('end', () => {
      res.end();
    });

    cursor.on('error', (err) => {
      console.error("Stream Error:", err);
      res.status(500).end();
    });

  } catch (error) {
    console.error("Stream News Init Error:", error);
    res.status(500).json({ success: false, msg: "Error starting stream" });
  }
};

exports.getNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const { includeDrafts } = req.query;

    // Search by slug first (since slugs are unique)
    let item = await NewsArticle.findOne({ slug }).populate("authorId", "name ProfilePicture designation");

    if (!item) {
      return res.status(404).json({ success: false, msg: `News not found` });
    }

    // Check if it belongs to the section if provided, but don't strictly fail if it's the right slug
    // This handles cases where URLs might have slightly different category names
    if (section && item.category !== section && !["all", "news", "Pages"].includes(section)) {
      console.log(`Note: Article found by slug '${slug}' but category mismatch: expected '${section}', found '${item.category}'`);
    }

    if (includeDrafts !== 'true' && item.status !== 'published') {
      return res.status(404).json({ success: false, msg: `News is in Draft` });
    }

    res.status(200).json({ success: true, news: item, section: item.category, msg: "News fetched" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching news" });
  }
};

exports.getSectionNews = async (req, res) => {
  try {
    const { section } = req.params;
    const { includeDrafts, page = 1, limit = 10 } = req.query;

    const query = { category: section };
    if (includeDrafts !== 'true') query.status = 'published';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sectionNews = await NewsArticle.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await NewsArticle.countDocuments(query);

    res.status(200).json({
      success: true,
      news: sectionNews,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      count: sectionNews.length,
      totalNews: total,
      msg: `${section.toUpperCase()} news fetched`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const result = await NewsArticle.findOneAndDelete({ slug });
    if (!result) return res.status(404).json({ success: false, msg: `No news found` });
    res.status(200).json({ success: true, deletedCount: 1, section, msg: `Deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error deleting news" });
  }
};

exports.updateNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const updateData = req.body;
    const item = await NewsArticle.findOne({ slug });
    if (!item) return res.status(404).json({ success: false, msg: `News not found` });

    let imageUrl = item.image;
    if (updateData.image && updateData.image !== imageUrl) {
      if (!updateData.image.startsWith("http")) {
        const uploadResponse = await cloudinary.uploader.upload(updateData.image, { folder: "primetime_news" });
        imageUrl = uploadResponse.secure_url;
      }
      updateData.image = imageUrl;
    }

    // Set publishedAt if status is changing to published and it wasn't published before
    if (updateData.status === "published" && item.status !== "published" && !item.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Automatically show news when published
    if (updateData.status === "published") {
      updateData.isHidden = false;
    }

    // Normalize category if provided
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    const updatedItem = await NewsArticle.findOneAndUpdate({ slug }, { ...updateData }, { new: true });

    // Trigger Facebook auto-post if status just changed to published
    if (updateData.status === "published" && item.status !== "published") {
      triggerFacebookPost(updatedItem);
    }

    return res.status(200).json({ success: true, news: updatedItem, section: updatedItem.category, msg: "Updated successfully" });
  } catch (error) {
    console.error("Update News Error:", error);
    res.status(500).json({ success: false, msg: "Error updating news" });
  }
};

exports.setNewsFlags = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const { isLatest, isTrending, isHidden } = req.body;
    const updateFields = {};
    if (typeof isLatest !== "undefined") updateFields.isLatest = !!isLatest;
    if (typeof isTrending !== "undefined") updateFields.isTrending = !!isTrending;
    if (typeof isHidden !== "undefined") updateFields.isHidden = !!isHidden;

    const updatedItem = await NewsArticle.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true });
    if (!updatedItem) return res.status(404).json({ success: false, msg: "Not found" });
    res.json({ success: true, msg: "Flags updated", news: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.GetAnalytics = async (req, res) => {
  try {
    const stats = await NewsArticle.aggregate([{ $group: { _id: null, totalNews: { $sum: 1 }, authors: { $push: "$author" }, categories: { $push: "$category" } } }]);
    if (!stats.length) return res.status(200).json({ success: true, data: { totalNews: 0, analyticsByAuthor: {}, analyticsByCategory: {} } });

    const analyticsByAuthor = stats[0].authors.reduce((acc, curr) => { acc[curr || 'Unknown'] = (acc[curr || 'Unknown'] || 0) + 1; return acc; }, {});
    const analyticsByCategory = stats[0].categories.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});

    res.status(200).json({ success: true, data: { totalNews: stats[0].totalNews, analyticsByAuthor, analyticsByCategory } });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error" });
  }
};
