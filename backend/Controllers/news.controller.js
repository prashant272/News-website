const NewsConfig = require("../Models/news.model");
const dotenv = require("dotenv");
dotenv.config({ path: "./Config/config.env" });

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


exports.AddNews = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      subCategory,
      summary,
      content,
      image,
      tags = [],
      section,
      targetLink,
      nominationLink,
      author,
      status,
    } = req.body;

    if (!title || !slug || !category || !content || !section) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields: title, slug, category, content, section",
      });
    }

    let newsConfig = await NewsConfig.findOne({ isActive: true });

    if (!newsConfig) {
      newsConfig = new NewsConfig({
        india: [],
        sports: [],
        business: [],
        technology: [],
        entertainment: [],
        lifestyle: [],
        world: [],
        health: [],
        state: [],
        isActive: true,
      });
    }

    if (newsConfig[section].some((item) => item.slug.toLowerCase() === slug.toLowerCase())) {
      return res.status(409).json({
        success: false,
        msg: `Slug '${slug}' already exists in ${section} section`,
      });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newItem = {
      title,
      slug,
      category,
      subCategory: subCategory || null,
      summary: summary || null,
      content,
      image: imageUrl || null,
      tags,
      targetLink: targetLink || null,
      nominationLink: nominationLink || null,
      author: author || "Prime Time News",
      status: status || "draft",
    };

    newsConfig[section].unshift(newItem);
    newsConfig.lastUpdated = new Date();
    const savedConfig = await newsConfig.save();

    return res.status(201).json({
      success: true,
      news: newItem,
      section,
      msg: `News added to ${section} section successfully`,
      totalInSection: savedConfig[section].length,
    });
  } catch (error) {
    console.error("Add News Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error adding news",
      error: error.message,
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const { includeDrafts } = req.query;
    const news = await NewsConfig.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("-permissions -__v").lean();

    if (includeDrafts !== 'true' && news.length > 0) {
      // Filter out drafts from each section array
      const config = news[0]; // Assuming only one active config
      const sections = ['india', 'sports', 'business', 'technology', 'entertainment', 'lifestyle', 'world', 'health', 'state', 'education', 'environment', 'science', 'opinion', 'auto', 'travel', 'awards'];

      sections.forEach(sec => {
        if (config[sec]) {
          config[sec] = config[sec].filter(item => item.status === 'published');
        }
      });
    }

    res.status(200).json({
      success: true,
      news,
      msg: "All news fetched successfully",
    });
  } catch (error) {
    console.error("Get All News Error:", error);
    res.status(500).json({
      success: false,
      msg: "Error fetching news",
      error: error.message,
    });
  }
};


exports.getNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const { includeDrafts } = req.query;
    const newsConfig = await NewsConfig.findOne({ isActive: true });

    if (!newsConfig) {
      return res.status(404).json({
        success: false,
        msg: "No news configuration found",
      });
    }

    if (!newsConfig[section]) {
      return res.status(404).json({
        success: false,
        msg: `Section '${section}' not found`,
      });
    }

    const item = newsConfig[section].find((newsItem) =>
      newsItem.slug.toLowerCase().includes(slug.toLowerCase())
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        msg: `News with slug '${slug}' not found in ${section} section`,
      });
    }

    if (includeDrafts !== 'true' && item.status !== 'published') {
      return res.status(404).json({
        success: false,
        msg: `News with slug '${slug}' not found (Draft)`,
      });
    }

    res.status(200).json({
      success: true,
      news: item,
      section,
      msg: "News fetched successfully",
    });
  } catch (error) {
    console.error("Get News by Slug Error:", error);
    res.status(500).json({
      success: false,
      msg: "Error fetching news",
      error: error.message,
    });
  }
};

exports.getSectionNews = async (req, res) => {
  try {
    const { section } = req.params;
    const { includeDrafts } = req.query;

    const newsConfig = await NewsConfig.findOne({ isActive: true });

    if (!newsConfig || !newsConfig[section]) {
      return res.status(404).json({
        success: false,
        news: [],
        msg: `No ${section} news found`,
      });
    }

    let sectionNews = newsConfig[section];
    if (includeDrafts !== 'true') {
      sectionNews = sectionNews.filter(item => item.status === 'published');
    }

    res.status(200).json({
      success: true,
      news: sectionNews,
      total: sectionNews.length,
      msg: `${section.toUpperCase()} news fetched`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;

    const newsConfig = await NewsConfig.findOne({ isActive: true });

    if (!newsConfig) {
      return res.status(404).json({
        success: false,
        msg: "No news configuration found",
      });
    }

    if (!newsConfig[section]) {
      return res.status(404).json({
        success: false,
        msg: `Section '${section}' not found`,
      });
    }

    const initialLength = newsConfig[section].length;
    newsConfig[section] = newsConfig[section].filter(
      (item) => !item.slug.toLowerCase().includes(slug.toLowerCase())
    );

    const deletedCount = initialLength - newsConfig[section].length;

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        msg: `No news found with slug '${slug}' in ${section}`,
      });
    }

    newsConfig.lastUpdated = new Date();
    await newsConfig.save();

    res.status(200).json({
      success: true,
      deletedCount,
      section,
      msg: `${deletedCount} item(s) deleted from ${section} section`,
    });
  } catch (error) {
    console.error("Delete News Error:", error);
    res.status(500).json({
      success: false,
      msg: "Error deleting news",
      error: error.message,
    });
  }
};

exports.updateNewsBySlug = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const updateData = req.body;
    const newsConfig = await NewsConfig.findOne({ isActive: true });

    if (!newsConfig) {
      return res.status(404).json({
        success: false,
        msg: "No news configuration found",
      });
    }

    if (!newsConfig[section]) {
      return res.status(404).json({
        success: false,
        msg: `Section '${section}' not found`,
      });
    }

    const itemIndex = newsConfig[section].findIndex((item) =>
      item.slug.toLowerCase().includes(slug.toLowerCase())
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: `News with slug '${slug}' not found in ${section}`,
      });
    }

    let imageUrl = newsConfig[section][itemIndex].image;
    if (updateData.image && updateData.image !== imageUrl) {
      const uploadResponse = await cloudinary.uploader.upload(updateData.image);
      imageUrl = uploadResponse.secure_url;
      updateData.image = imageUrl;
    }

    newsConfig[section][itemIndex] = {
      ...newsConfig[section][itemIndex],
      ...updateData,
    };

    newsConfig.lastUpdated = new Date();
    await newsConfig.save();

    res.status(200).json({
      success: true,
      news: newsConfig[section][itemIndex],
      section,
      msg: "News updated successfully",
    });
  } catch (error) {
    console.error("Update News Error:", error);
    res.status(500).json({
      success: false,
      msg: "Error updating news",
      error: error.message,
    });
  }
};

exports.setNewsFlags = async (req, res) => {
  try {
    const { section, slug } = req.params;
    const { isLatest, isTrending, isHidden } = req.body;

    if (
      typeof isLatest === "undefined" &&
      typeof isTrending === "undefined" &&
      typeof isHidden === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        msg: "Provide at least one of: isLatest, isTrending, or isHidden",
      });
    }

    const newsConfig = await NewsConfig.findOne({ isActive: true });
    if (!newsConfig || !newsConfig[section]) {
      return res.status(404).json({
        success: false,
        msg: "Section not found",
      });
    }

    const itemIndex = newsConfig[section].findIndex(
      (item) => item.slug.toLowerCase() === slug.toLowerCase()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: "News item not found",
      });
    }

    if (typeof isLatest !== "undefined") {
      newsConfig[section][itemIndex].isLatest = !!isLatest;
    }
    if (typeof isTrending !== "undefined") {
      newsConfig[section][itemIndex].isTrending = !!isTrending;
    }
    if (typeof isHidden !== "undefined") {
      newsConfig[section][itemIndex].isHidden = !!isHidden;
    }

    newsConfig.lastUpdated = new Date();
    await newsConfig.save();

    res.json({
      success: true,
      msg: "Flags updated successfully",
      news: newsConfig[section][itemIndex],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

exports.GetAnalytics = async (req, res) => {
  try {
    const newsConfig = await NewsConfig.findOne({ isActive: true });
    if (!newsConfig) {
      return res.status(404).json({ success: false, msg: "No news config found" });
    }

    const sections = ['india', 'sports', 'business', 'technology', 'entertainment', 'lifestyle', 'world', 'health', 'state'];
    let totalNews = 0;
    const analyticsByAuthor = {};
    const analyticsByCategory = {};

    sections.forEach(section => {
      if (newsConfig[section]) {
        newsConfig[section].forEach(item => {
          totalNews++;

          // Analytics by Author
          const author = item.author || 'Unknown';
          analyticsByAuthor[author] = (analyticsByAuthor[author] || 0) + 1;

          // Analytics by Category/Section
          analyticsByCategory[section] = (analyticsByCategory[section] || 0) + 1;
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalNews,
        analyticsByAuthor,
        analyticsByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching analytics" });
  }
};

