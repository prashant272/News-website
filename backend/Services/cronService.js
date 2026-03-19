const cron = require("node-cron");
const NewsArticle = require("../Models/NewsArticle");
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

    const articleUrl = `https://www.primetimemedia.in/Pages/${newsItem.category}/${newsItem.subCategory || newsItem.category}/${newsItem.slug}`;
    const message = `📰 ${newsItem.title}\n\n${newsItem.summary || ""}\n\nRead more 👇`;

    // Import service only when needed to avoid circular dependencies
    const facebookService = require("./facebookService"); 
    await facebookService.postToPage(pageId, pageAccessToken, message, articleUrl);
  } catch (error) {
    console.error("[Cron-Facebook] triggerFacebookPost Error:", error);
  }
}

const initCronJobs = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            // console.log(`[Cron] Checking for scheduled news at ${now.toISOString()}`);

            const articlesToPublish = await NewsArticle.find({
                status: "scheduled",
                scheduledAt: { $lte: now }
            });

            if (articlesToPublish.length > 0) {
                console.log(`[Cron] Found ${articlesToPublish.length} articles to publish.`);

                for (const article of articlesToPublish) {
                    article.status = "published";
                    article.publishedAt = now;
                    article.scheduledAt = null; // Clear scheduled time
                    article.isHidden = false;
                    
                    await article.save();
                    console.log(`[Cron] ✅ Automatically published: "${article.title}"`);

                    // Trigger Facebook post
                    triggerFacebookPost(article);
                }
            }
        } catch (error) {
            console.error("[Cron] Error in scheduled publishing job:", error);
        }
    });

    console.log("✅ Scheduled Publishing Cron Job Initialized (Every Minute)");
};

module.exports = { initCronJobs };
