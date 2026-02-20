const mongoose = require("mongoose");
const dotenv = require("dotenv");
const NewsArticle = require("../Models/NewsArticle");

dotenv.config({ path: "../.env" });

const fix = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB successfully.");

        const articles = await NewsArticle.find({ status: "published", publishedAt: null });
        console.log(`Found ${articles.length} published articles without publishedAt date.`);

        let updatedCount = 0;
        for (const article of articles) {
            article.publishedAt = article.createdAt || new Date();
            await article.save();
            updatedCount++;
        }

        console.log(`Successfully fixed ${updatedCount} articles.`);
        process.exit(0);
    } catch (error) {
        console.error("Fix failed:", error);
        process.exit(1);
    }
};

fix();
