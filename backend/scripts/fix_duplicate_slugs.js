const mongoose = require("mongoose");
const dotenv = require("dotenv");
const NewsArticle = require("../models/NewsArticle");

dotenv.config({ path: ".env" });

const fixDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const articles = await NewsArticle.find({}, "slug _id").lean();
        const slugCounts = {};
        const duplicates = [];

        articles.forEach(art => {
            if (!art.slug) return;
            slugCounts[art.slug] = (slugCounts[art.slug] || 0) + 1;
            if (slugCounts[art.slug] > 1) {
                duplicates.push(art);
            }
        });

        console.log(`Found ${duplicates.length} duplicate slugs.`);

        for (const dup of duplicates) {
            const newSlug = `${dup.slug}-${Math.random().toString(36).substring(2, 7)}`;
            console.log(`Updating duplicate slug: ${dup.slug} -> ${newSlug}`);
            await NewsArticle.findByIdAndUpdate(dup._id, { $set: { slug: newSlug } });
        }

        console.log("Cleanup complete.");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixDuplicates();
