const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Ad = require('../backend/models/advertisement.model');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const ads = await Ad.find();
        console.log(`Found ${ads.length} ads to migrate`);

        for (const ad of ads) {
            if (!ad.headerImageUrl && !ad.sidebarImageUrl && ad.imageUrl) {
                if (ad.placement === 'sidebar') {
                    ad.sidebarImageUrl = ad.imageUrl;
                } else {
                    ad.headerImageUrl = ad.imageUrl;
                }
                await ad.save();
                console.log(`Migrated ad: ${ad.title}`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
