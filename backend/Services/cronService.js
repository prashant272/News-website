const cron = require("node-cron");
const NewsArticle = require("../Models/NewsArticle");
const BreakingNews = require("../Models/BreakingNews");
const AppConfig = require("../Models/AppConfig");
const User = require("../Models/user.model");

// Re-using the logic from news.controller.js for consistency
async function triggerFacebookPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    let pageId, pageAccessToken;

    const globalConfig = await AppConfig.findOne({ key: "facebook" });
    if (globalConfig?.facebook?.pageId && globalConfig?.facebook?.autoPostEnabled) {
      pageId = globalConfig.facebook.pageId;
      pageAccessToken = globalConfig.facebook.pageAccessToken;
    }
    else if (newsItem.authorId) {
      const user = await User.findById(newsItem.authorId);
      if (user?.facebook?.pageId) {
        pageId = user.facebook.pageId;
        pageAccessToken = user.facebook.pageAccessToken;
      }
    }

    if (!pageId || !pageAccessToken) return;

    const { getArticleUrl } = require("../Utils/articleUtils");
    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    // Import service only when needed to avoid circular dependencies
    const facebookService = require("./facebookService");
    await facebookService.postToPage(pageId, pageAccessToken, message, articleUrl, newsItem.image || null);
  } catch (error) {
    console.error("[Cron-Facebook] triggerFacebookPost Error:", error);
  }
}

/**
 * Trigger LinkedIn auto-post to ALL connected accounts when an article is published.
 */
async function triggerLinkedInPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    const config = await AppConfig.findOne({ key: "linkedin-multi" });
    const accounts = (config?.linkedinAccounts || []).filter(a => a.autoPostEnabled && a.accessToken);
    if (accounts.length === 0) return;

    const { getArticleUrl } = require("../Utils/articleUtils");
    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    const linkedinService = require("./linkedinService");
    const results = await Promise.allSettled(
      accounts.map(a => linkedinService.postToLinkedIn(a.accessToken, a.accountId, message, articleUrl, newsItem.image || null))
    );
    results.forEach((r, i) => {
      if (r.status === "fulfilled") console.log(`[Cron-LinkedIn] ✅ Posted to: ${accounts[i].accountName}`);
      else console.error(`[Cron-LinkedIn] ❌ Failed for ${accounts[i].accountName}:`, r.reason?.message);
    });
  } catch (error) {
    console.error("[Cron-LinkedIn] triggerLinkedInPost Error:", error);
  }
}

/**
 * Trigger Twitter auto-post when an article is published.
 */
async function triggerTwitterPost(newsItem) {
  if (newsItem.status !== "published") return;

  try {
    let credentials = {};

    const globalConfig = await AppConfig.findOne({ key: "twitter" });
    if (globalConfig?.twitter?.accessToken && globalConfig?.twitter?.autoPostEnabled) {
      credentials = {
        appKey: globalConfig.twitter.appKey,
        appSecret: globalConfig.twitter.appSecret,
        accessToken: globalConfig.twitter.accessToken,
        accessSecret: globalConfig.twitter.accessSecret,
      };
    }
    else if (newsItem.authorId) {
      const user = await User.findById(newsItem.authorId);
      if (user?.twitter?.accessToken) {
        credentials = {
          appKey: user.twitter.appKey,
          appSecret: user.twitter.appSecret,
          accessToken: user.twitter.accessToken,
          accessSecret: user.twitter.accessSecret,
        };
      }
    }

    if (!credentials.accessToken) return;

    const { getArticleUrl } = require("../Utils/articleUtils");
    const articleUrl = getArticleUrl(newsItem);
    const message = `📰 ${newsItem.title}`;

    const twitterService = require("./twitterService");
    await twitterService.postToTwitter(credentials, message, articleUrl);
  } catch (error) {
    console.error("[Cron-Twitter] triggerTwitterPost Error:", error);
  }
}

const { publishPendingDrafts } = require("./autoNewsService");

const initCronJobs = () => {
  // --- 1. Immediate Run on Startup (DEACTIVATED) ---
  // console.log("[AutoPost] ⚡ System Startup: Triggering initial publishing cycle...");
  // publishPendingDrafts().catch(err => console.error("[AutoPost] ❌ Initial Cycle Failed:", err.message));

  // --- 2. NIGHTLY HOURLY AUTO-POST (7 PM - 5 AM): Every 1 Hour (DEACTIVATED) ---
  // cron.schedule("0 19-23,0-5 * * *", async () => {
  //   try {
  //     console.log(`[AutoPost] 🌑 Nightly Hourly Cycle triggered at ${new Date().toISOString()}`);
  //     const stats = await publishPendingDrafts();
  //     if (stats.processed > 0) {
  //       console.log(`[AutoPost] ✅ Done: ${stats.processed} articles now live.`);
  //     }
  //   } catch (err) {
  //     console.error("[AutoPost] ❌ Nightly Cycle Failed:", err.message);
  //   }
  // });

  // console.log("✅ Nightly Hourly Auto-Posting Job (7PM-5AM) Initialized.");

  // 3. Scheduled Publishing (Every Minute)
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const articlesToPublish = await NewsArticle.find({
        status: "scheduled",
        scheduledAt: { $lte: now }
      });

      if (articlesToPublish.length > 0) {
        console.log(`[Cron] Found ${articlesToPublish.length} articles to publish.`);

        for (const article of articlesToPublish) {
          article.status = "published";
          article.publishedAt = now;
          article.scheduledAt = null;
          article.isHidden = false;

          await article.save();
          console.log(`[Cron] ✅ Automatically published: "${article.title}"`);

          triggerFacebookPost(article);
          triggerLinkedInPost(article);
          triggerTwitterPost(article);
        }
      }
    } catch (error) {
      console.error("[Cron] Error in scheduled publishing job:", error);
    }
  });

  console.log("✅ AI News Auto-Pilot (5 Min) and Publishing (1 Min) Jobs Initialized.");

  // 3. Clean up Breaking News (Daily at 2 AM)
  cron.schedule("0 2 * * *", async () => {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const result = await BreakingNews.deleteMany({
        createdAt: { $lt: twoDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`[Cron] 🧹 Cleaned up ${result.deletedCount} old breaking news items.`);
      }
    } catch (error) {
      console.error("[Cron] Error in breaking news cleanup job:", error);
    }
  });

  console.log("✅ Breaking News Cleanup Job Initialized (Daily at 2 AM)");
};

module.exports = { initCronJobs };
