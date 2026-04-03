const mongoose = require('mongoose');
const MONGO_URL = "mongodb+srv://primetimemediaresearch_db_user:K9xtyBYGgdxCo9CC@cluster0.xvkqhrz.mongodb.net/";

const InternationalProgramSchema = new mongoose.Schema({
    title: String,
    link: String,
    isActive: Boolean
}, { timestamps: true });

const InternationalProgram = mongoose.model('InternationalProgram', InternationalProgramSchema);

async function seedData() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        // Clear existing test data if any (optional)
        // await InternationalProgram.deleteMany({ title: /^Test/ });

        const programs = [
            { title: "Global Summit 2026", link: "https://example.com/summit", isActive: true },
            { title: "International Medical Forum", link: "https://example.com/forum", isActive: true },
        ];

        for (const p of programs) {
            const exists = await InternationalProgram.findOne({ title: p.title });
            if (!exists) {
                await InternationalProgram.create(p);
                console.log(`Created: ${p.title}`);
            } else {
                console.log(`Skipped (already exists): ${p.title}`);
            }
        }

        console.log("Seeding complete");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding:", err);
        process.exit(1);
    }
}

seedData();
