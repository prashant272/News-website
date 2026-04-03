const NewsArticle = require("../Models/NewsArticle");
const User = require("../Models/user.model");
const AppConfig = require("../Models/AppConfig");
const { triggerAllSocialMedia } = require("../services/socialTriggerService");
const { getArticleUrl } = require("../utils/articleUtils");
const { brandImageWithTitle } = require("../services/imageService");
const dotenv = require("dotenv");
// dotenv.config({ path: "./config/config.env" }); // Removed: Root server.js handles env loading
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

    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    const result = await facebookService.postToPage(pageId, pageAccessToken, message, articleUrl, newsItem.image || null);
    if (result.success) {
      console.log(`[Facebook] ✅ Auto-posted: "${newsItem.title}" → Post ID: ${result.postId}`);
    } else {
      console.error(`[Facebook] ❌ Auto-post failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[Facebook] triggerFacebookPost Error:", error);
  }
}

/**
 * Trigger LinkedIn auto-post when an article is published.
 */
async function triggerLinkedInPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    // Get all active LinkedIn accounts
    const config = await AppConfig.findOne({ key: "linkedin-multi" });
    const accounts = (config?.linkedinAccounts || []).filter(a => a.autoPostEnabled && a.accessToken);

    if (accounts.length === 0) {
      console.log("[LinkedIn] Auto-post skipped: No LinkedIn accounts connected.");
      return;
    }

    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    // Post to ALL accounts in parallel
    const results = await Promise.allSettled(
      accounts.map(account =>
        linkedinService.postToLinkedIn(account.accessToken, account.accountId, message, articleUrl, newsItem.image || null)
      )
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        console.log(`[LinkedIn] ✅ Posted to: ${accounts[i].accountName}`);
      } else {
        console.error(`[LinkedIn] ❌ Failed for ${accounts[i].accountName}:`, result.reason?.message);
      }
    });
  } catch (error) {
    console.error("[LinkedIn] triggerLinkedInPost Error:", error);
  }
}

/**
 * Trigger Twitter auto-post when an article is published.
 */
async function triggerTwitterPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    let credentials = {};

    // 1. Try global system-level config
    const globalConfig = await AppConfig.findOne({ key: "twitter" });
    if (globalConfig?.twitter?.accessToken && globalConfig?.twitter?.autoPostEnabled) {
      credentials = {
        appKey: globalConfig.twitter.appKey,
        appSecret: globalConfig.twitter.appSecret,
        accessToken: globalConfig.twitter.accessToken,
        accessSecret: globalConfig.twitter.accessSecret,
      };
      console.log(`[Twitter] Using global config for auto-post: @${globalConfig.twitter.username}`);
    }
    // 2. Fallback: per-user credentials
    else if (newsItem.authorId) {
      const user = await User.findById(newsItem.authorId);
      if (user?.twitter?.accessToken) {
        credentials = {
          appKey: user.twitter.appKey,
          appSecret: user.twitter.appSecret,
          accessToken: user.twitter.accessToken,
          accessSecret: user.twitter.accessSecret,
        };
        console.log(`[Twitter] Using per-user config for auto-post: user ${newsItem.authorId}`);
      }
    }

    if (!credentials.accessToken) {
      console.log("[Twitter] Auto-post skipped: No Twitter account connected.");
      return;
    }

    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}`;

    await twitterService.postToTwitter(credentials, message, articleUrl);
    console.log(`[Twitter] ✅ Auto-posted: "${newsItem.title}"`);
  } catch (error) {
    console.error("[Twitter] triggerTwitterPost Error:", error);
  }
}


exports.AddNews = async (req, res) => {
  try {
    const {
      title, slug, category, subCategory, summary, content,
      image, tags = [], section, targetLink, nominationLink, moreInfoLink,
      author, status, authorId, scheduledAt, showInPopup, isFiftyWordEdit, language, state
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
      try {
        console.log(`[Admin-Upload] Applying professional branding to image for: ${title}`);
        const brandedBuffer = await brandImageWithTitle(image, title);
        
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/png;base64,${brandedBuffer.toString('base64')}`, 
          { folder: "primetime_news" }
        );
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Branding/Upload Error:", uploadError);
        // Fallback to raw image if branding fails
        if (image.startsWith("http")) {
          imageUrl = image;
        } else {
          const fallback = await cloudinary.uploader.upload(image, { folder: "primetime_news" });
          imageUrl = fallback.secure_url;
        }
      }
    }

    // Auto-detect language if not provided
    let finalLanguage = language || "en";
    const fullContent = (title || '') + (content || '') + (summary || '');
    const hasHindiChars = /[\u0900-\u097F]/.test(fullContent);

    if (!language && hasHindiChars) {
      finalLanguage = "hi";
      console.log(`[News] Auto-detected Hindi language for article: ${title}`);
    }

    const newItem = new NewsArticle({
      title, slug, category: finalCategory, subCategory: subCategory || null,
      summary: summary || null, content, image: imageUrl, tags,
      targetLink: targetLink || null, nominationLink: nominationLink || null,
      moreInfoLink: moreInfoLink || null,
      author: author || "Prime Time News",
      authorId: authorId || null,
      status: status || "draft",
      scheduledAt: status === "scheduled" ? scheduledAt : null,
      publishedAt: status === "published" ? new Date() : null,
      showInPopup: !!showInPopup,
      isFiftyWordEdit: !!isFiftyWordEdit,
      lang: finalLanguage,
      state: state || "universal"
    });

    await newItem.save();

    // Trigger All Social Media and Notifications
    if (status === "published") {
      triggerAllSocialMedia(newItem);
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
    const { includeDrafts, page = 1, limit = 10, status, lang, state } = req.query;
    const query = {};

    if (lang) {
      if (lang === 'en') {
        query.$or = [{ lang: 'en' }, { lang: { $exists: false } }, { lang: null }];
      } else {
        query.lang = lang;
      }
    }
    if (state) query.state = state;

    if (status) {
      query.status = status;
    } else if (includeDrafts !== 'true') {
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
    const { includeDrafts, section, limit = 50, lang, state, category } = req.query;
    const query = {};

    if (lang) {
      if (lang === 'hi') {
        query.$or = [{ lang: 'hi' }, { title: /[ऀ-ॿ]/ }];
      } else if (lang === 'en') {
        query.$or = [{ lang: 'en' }, { lang: { $exists: false } }, { lang: null }];
        query.title = { $not: /[ऀ-ॿ]/ };
      } else {
        query.lang = lang;
      }
    }

    if (category || section) {
      const catToUse = (category || section).toLowerCase();
      if (catToUse === 'regional' || catToUse === 'state' || catToUse === 'राज्य') {
        query.category = { $in: ['regional', 'state', 'राज्य', 'राज्य समाचार'] };
      } else if (catToUse === 'india' || catToUse === 'national' || catToUse === 'भारत') {
        query.category = { $in: ['india', 'national', 'भारत', 'देश-विदेश', 'india'] };
      } else {
        query.category = catToUse;
      }
    }
    if (state) query.state = state;

    if (includeDrafts !== 'true') query.status = 'published';

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const cursor = NewsArticle.find(query)
      .select('title slug category subCategory summary image tags isLatest isTrending isFiftyWordEdit isHidden showInPopup targetLink nominationLink moreInfoLink author publishedAt _id')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean()
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
    const { includeDrafts, page = 1, limit = 10, status, lang, state } = req.query;

    const query = {};
    if (section) {
      const lowerCat = section.toLowerCase();
      if (lowerCat === 'regional' || lowerCat === 'state' || lowerCat === 'राज्य') {
        query.category = { $in: ['regional', 'state', 'राज्य', 'राज्य समाचार'] };
      } else if (lowerCat === 'india' || lowerCat === 'national' || lowerCat === 'भारत') {
        query.category = { $in: ['india', 'national', 'भारत', 'देश-विदेश'] };
      } else {
        query.category = lowerCat;
      }
    }

    if (lang) {
      if (lang === 'en') {
        query.$or = [{ lang: 'en' }, { lang: { $exists: false } }, { lang: null }];
      } else {
        query.lang = lang;
      }
    }
    if (state) query.state = state;
    if (status) {
      query.status = status;
    } else if (includeDrafts !== 'true') {
      query.status = 'published';
    }

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
      try {
        console.log(`[Admin-Update] Applying professional branding to updated image for: ${updateData.title || item.title}`);
        const brandedBuffer = await brandImageWithTitle(updateData.image, updateData.title || item.title);
        
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/png;base64,${brandedBuffer.toString('base64')}`, 
          { folder: "primetime_news" }
        );
        imageUrl = uploadResponse.secure_url;
        updateData.image = imageUrl;
      } catch (uploadError) {
        console.error("Branding/Update Error:", uploadError);
        if (!updateData.image.startsWith("http")) {
          const uploadResponse = await cloudinary.uploader.upload(updateData.image, { folder: "primetime_news" });
          imageUrl = uploadResponse.secure_url;
          updateData.image = imageUrl;
        }
      }
    }

    // Set publishedAt if status is changing to published and it wasn't published before
    if (updateData.status === "published" && item.status !== "published" && !item.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Automatically show news when published
    if (updateData.status === "published") {
      updateData.isHidden = false;
      updateData.scheduledAt = null; // Clear if manually published
    }

    if (updateData.status === "scheduled" && updateData.scheduledAt) {
      updateData.isHidden = true; // Keep hidden until scheduled
    }

    // Normalize category if provided
    // Auto-detect language if currently 'en' or missing but has Hindi characters
    const fullContent = (updateData.title || item.title || '') + (updateData.content || item.content || '') + (updateData.summary || item.summary || '');
    const hasHindiChars = /[\u0900-\u097F]/.test(fullContent);

    if (hasHindiChars && (updateData.language === 'en' || !updateData.language)) {
      updateData.lang = 'hi';
      console.log(`[News] Auto-corrected Language to Hindi for existing article: ${item.title}`);
    }

    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    const updatedItem = await NewsArticle.findOneAndUpdate({ slug }, { ...updateData }, { new: true });

    // Trigger All Social Media and Notifications if status just changed to published
    if (updateData.status === "published" && item.status !== "published") {
      triggerAllSocialMedia(updatedItem);
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
    const { isLatest, isTrending, isHidden, showInPopup, isFiftyWordEdit } = req.body;
    const updateFields = {};
    if (typeof isLatest !== "undefined") updateFields.isLatest = !!isLatest;
    if (typeof isTrending !== "undefined") updateFields.isTrending = !!isTrending;
    if (typeof isHidden !== "undefined") updateFields.isHidden = !!isHidden;
    if (typeof showInPopup !== "undefined") updateFields.showInPopup = !!showInPopup;
    if (typeof isFiftyWordEdit !== "undefined") updateFields.isFiftyWordEdit = !!isFiftyWordEdit;

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

/**
 * Employee daily report: how many news each employee published today (or given date), by category.
 */
exports.getEmployeeReport = async (req, res) => {
  try {
    const { date } = req.query;

    // IST offset = UTC + 5:30 = 330 minutes
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    // Parse the date string (e.g. "2026-02-23") as IST midnight
    let targetDateStr;
    if (date) {
      targetDateStr = date; // e.g. "2026-02-23"
    } else {
      // Get today in IST
      const nowIST = new Date(Date.now() + IST_OFFSET_MS);
      targetDateStr = nowIST.toISOString().split('T')[0];
    }

    // Build UTC boundaries for the IST day
    // IST 00:00:00 = UTC targetDate - 5:30
    // IST 23:59:59 = UTC targetDate + 1 day - 5:30 - 1ms
    const startOfDayUTC = new Date(`${targetDateStr}T00:00:00.000+05:30`);
    const endOfDayUTC = new Date(`${targetDateStr}T23:59:59.999+05:30`);

    const results = await NewsArticle.aggregate([
      {
        $match: {
          status: 'published',
          $or: [
            { publishedAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } },
            {
              publishedAt: { $exists: false },
              createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
            },
            {
              publishedAt: null,
              createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            authorId: "$authorId",
            author: "$author",
            category: "$category"
          },
          count: { $sum: 1 },
          titles: { $push: "$title" }
        }
      },
      {
        $group: {
          _id: {
            authorId: "$_id.authorId",
            author: "$_id.author"
          },
          totalCount: { $sum: "$count" },
          categories: {
            $push: {
              category: "$_id.category",
              count: "$count",
              titles: "$titles"
            }
          }
        }
      },
      {
        $sort: { totalCount: -1 }
      }
    ]);

    // Format
    const report = results.map(emp => ({
      authorId: emp._id.authorId,
      author: emp._id.author || 'Unknown',
      total: emp.totalCount,
      categories: emp.categories.sort((a, b) => b.count - a.count)
    }));

    res.status(200).json({
      success: true,
      date: targetDateStr,
      report
    });
  } catch (error) {
    console.error("Employee Report Error:", error);
    res.status(500).json({ success: false, msg: "Error fetching employee report" });
  }
};

exports.searchNews = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, lang, state } = req.query;
    if (!q) return res.status(400).json({ success: false, msg: "Search query required" });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { $text: { $search: q }, status: 'published' };
    if (lang) {
      if (lang === 'en') {
        query.$or = [{ lang: 'en' }, { lang: { $exists: false } }, { lang: null }];
      } else {
        query.lang = lang;
      }
    }
    if (state) query.state = state;

    const results = await NewsArticle.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await NewsArticle.countDocuments(query);

    res.status(200).json({
      success: true,
      news: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      count: results.length,
      msg: "Search completed"
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};


