const mongoose = require("mongoose");
const dotenv = require("dotenv");
const NewsArticle = require("../Models/NewsArticle");

dotenv.config({ path: "../.env" });

const normalize = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB successfully.");

        const articles = await NewsArticle.find({});
        console.log(`Found ${articles.length} articles to normalize.`);

        let updatedCount = 0;
        for (const article of articles) {
            let needsUpdate = false;

            if (article.category && article.category !== article.category.toLowerCase()) {
                article.category = article.category.toLowerCase();
                needsUpdate = true;
            }

            if (article.status && article.status !== article.status.toLowerCase()) {
                article.status = article.status.toLowerCase();
                needsUpdate = true;
            }

            if (needsUpdate) {
                await article.save();
                updatedCount++;
            }
        }

        console.log(`Successfully normalized ${updatedCount} articles.`);
        process.exit(0);
    } catch (error) {
        console.error("Normalization failed:", error);
        process.exit(1);
    }
};

normalize();
