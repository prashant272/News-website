const mongoose = require("mongoose");
const dotenv = require("dotenv");
const NewsArticle = require("../models/NewsArticle");

dotenv.config({ path: "../.env" });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const count = await NewsArticle.countDocuments();
        console.log(`Total NewsArticle documents: ${count}`);

        const sample = await NewsArticle.findOne().sort({ createdAt: -1 });
        console.log("Sample Article:", JSON.stringify(sample, null, 2));

        const categories = await NewsArticle.distinct("category");
        console.log("Distinct Categories:", categories);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
