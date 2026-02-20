const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const NewsArticle = require('../Models/NewsArticle');
const NewsConfig = require('../Models/news.model');

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const aCount = await NewsArticle.countDocuments();
    const cCount = await NewsConfig.countDocuments();
    process.stdout.write(`NewsArticle Count: ${aCount}\n`);
    process.stdout.write(`NewsConfig Count: ${cCount}\n`);
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
