const { applyWatermark, brandImageWithTitle } = require("../Services/imageService");
const { scrapeNews, getLatestLinks } = require("../Services/scraperService");
const { generateArticle } = require("../Services/aiService");
const NewsArticle = require("../Models/NewsArticle");
const newsSources = require("../Config/newsSources");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// --- BRANDING HELPERS ---
const BRAND_EN = "Prime Time";
const BRAND_HI = "प्राइम टाइम";

const ensureBranding = (title, slug, lang) => {
    let finalTitle = (title || "").trim();
    let finalSlug = (slug || "").trim();

    if (lang === "hi") {
        if (!finalTitle.includes(BRAND_HI)) {
            finalTitle = `${finalTitle} - ${BRAND_HI}`;
        }
    } else {
        const regexEN = new RegExp(`${BRAND_EN}$`, "i");
        if (!regexEN.test(finalTitle)) {
            finalTitle = `${finalTitle} ${BRAND_EN}`;
        }
    }

    if (finalSlug && !finalSlug.toLowerCase().endsWith("prime-time")) {
        finalSlug = `${finalSlug}-prime-time`;
    }

    return { title: finalTitle, slug: finalSlug };
};

// --- HELPERS ---

const hasHindiCharacters = (text) => {
    if (!text) return false;
    return /[\u0900-\u097F]/.test(text);
};

const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/[^\u0900-\u097Fa-z0-9\u0915-\u0939\u0941-\u094d-]+/g, "")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)+/g, "");
};

const generateUrlHash = (url) => {
    return crypto.createHash("sha256").update(url).digest("hex");
};

const uploadImage = async (imageUrl, title = "", source = "") => {
    if (!imageUrl) return null;
    try {
        console.log(`[Cloudinary] ${title ? "Branding" : "Watermarking"} and Uploading: ${imageUrl}`);

        // 1. Apply branding/watermark
        let buffer;
        if (title) {
            // New HD Master Branding with Title
            buffer = await brandImageWithTitle(imageUrl, title);
        } else {
            // Legacy anti-copyright watermark
            buffer = await applyWatermark(imageUrl, source);
        }

        if (!buffer) {
            console.log("[Cloudinary] Falling back to original image (no watermark).");
            const response = await cloudinary.uploader.upload(imageUrl, {
                folder: "auto_news",
                fetch_format: "auto",
                quality: "auto"
            });
            return response.secure_url;
        }

        // 2. Upload the watermarked buffer to Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "auto_news", fetch_format: "auto", quality: "auto" },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Stream Error:", error.message);
                        resolve(null); // Return null instead of rejecting to keep loop running
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error("Cloudinary Error:", error.message);
        return null;
    }
};

const isSemanticDuplicate = (newTitle, existingTitles) => {
    if (!newTitle || !existingTitles.length) return false;
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    const newWords = new Set(normalize(newTitle));
    if (newWords.size < 3) return false;
    for (const title of existingTitles) {
        const existingWords = normalize(title);
        let matchCount = 0;
        for (const word of existingWords) { if (newWords.has(word)) matchCount++; }
        const similarity = matchCount / Math.min(newWords.size, existingWords.size);
        if (similarity > 0.6) return true;
    }
    return false;
};

// --- CONTROLLERS ---

const autoGenerateNews = async (req, res) => {
    try {
        const { url, category } = req.body;
        if (!url || !category) return res.status(400).json({ success: false, msg: "URL and Category are required." });

        const scraped = await scrapeNews(url);
        const aiDataHi = await generateArticle(scraped.facts, 'hi');

        if (!hasHindiCharacters(aiDataHi.title)) {
            return res.status(422).json({ success: false, msg: "AI failed to generate a Hindi title." });
        }

        // APPLY BRANDING
        const branded = ensureBranding(aiDataHi.title, createSlug(aiDataHi.title), "hi");
        const finalTitle = branded.title;
        const finalSlug = branded.slug;

        const urlHash = generateUrlHash(url);

        const existing = await NewsArticle.findOne({ $or: [{ slug: finalSlug }, { urlHash: `${urlHash}-hi` }] });
        if (existing) return res.status(409).json({ success: false, msg: "Article already exists.", slug: finalSlug });

        // BRANDING: Process image with AI generated title
        const finalImage = scraped.image ? await uploadImage(scraped.image, finalTitle, scraped.source) : null;

        const newPostHi = new NewsArticle({
            title: finalTitle,
            slug: finalSlug,
            category: category.toLowerCase(),
            subCategory: aiDataHi.subCategory || "General",
            summary: aiDataHi.summary,
            content: aiDataHi.content,
            image: finalImage,
            tags: aiDataHi.tags || [],
            source: scraped.source,
            urlHash: `${urlHash}-hi`,
            autoGenerated: true,
            status: "draft",
            author: "AI Writer",
            isHidden: true,
            lang: "hi"
        });

        await newPostHi.save();
        res.json({ success: true, msg: "News auto-generated and watermarked.", post: newPostHi });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const fetchAndProcessNews = async (req, res) => {
    try {
        console.log("-----------------------------------------");
        const targetCategory = req.query.category; // e.g. 'sports' or 'business'
        const limitParam = parseInt(req.query.limit) || 10;
        
        console.log(`[Trigger] Scraping Process Started Manually... ${targetCategory ? `(Category: ${targetCategory})` : '(General)'}`);
        console.log("-----------------------------------------");
 
        let stats = { processed: 0, duplicates: 0, errors: 0, skipped_limit: 0, articles: [] };
        const GLOBAL_LIMIT = limitParam;
        const STATE_LIMIT = targetCategory ? limitParam : 5; // Relax state limit if category is specific
        const stateCounters = {};
 
        const recentArticles = await NewsArticle.find().sort({ createdAt: -1 }).limit(500).select("title");
        const existingTitles = recentArticles.map(a => a.title);
 
        let allPotentialItems = [];
        
        // Filter sources by category if provided
        let sourcesToProcess = newsSources;
        if (targetCategory) {
            const categoriesToMatch = targetCategory === 'business' ? ['business', 'economy'] : [targetCategory];
            sourcesToProcess = newsSources.filter(s => categoriesToMatch.includes(s.category.toLowerCase()));
            console.log(`[Batch] Filtered to ${sourcesToProcess.length} sources for category: ${targetCategory}`);
        }

        for (const source of sourcesToProcess) {
            try {
                const items = await getLatestLinks(source.url);
                allPotentialItems.push(...items.map(i => ({ ...i, sourceInfo: source })));
            } catch (err) { }
        }
        allPotentialItems = allPotentialItems.sort(() => Math.random() - 0.5);


        const CONCURRENCY = 2; // Reduced for heavy image processing stability
        const processArticle = async (item) => {
            if (stats.processed >= GLOBAL_LIMIT) return;

            const source = item.sourceInfo;
            const state = source.state || source.name.split(" - ")[1]?.toLowerCase() || "general";

            if (stateCounters[state] >= STATE_LIMIT) {
                stats.skipped_limit++;
                return;
            }

            // --- STRICT DUPLICATE PREVENTION (PRE-SCRAPE) ---
            const urlHash = generateUrlHash(item.link);
            const alreadyExists = await NewsArticle.findOne({ 
                $or: [
                    { urlHash: `${urlHash}-hi` }, 
                    { urlHash: `${urlHash}-en` },
                    { urlHash: urlHash }
                ] 
            });

            if (alreadyExists) {
                console.log(`[Skip] URL Already Processed: ${item.title}`);
                stats.duplicates++;
                return;
            }

            if (isSemanticDuplicate(item.title, existingTitles)) {
                console.log(`[Skip] Semantic Duplicate Found: "${item.title}"`);
                stats.duplicates++;
                return;
            }

            const slug = createSlug(item.title);


            try {
                console.log(`[Batch] Scraping & AI Drafting: ${item.title}`);
                const scraped = await scrapeNews(item.link);

                // --- HINDI ---
                const aiDataHi = await generateArticle(scraped.facts, 'hi');
                if (hasHindiCharacters(aiDataHi.title)) {
                    // APPLY BRANDING
                    const brandedHi = ensureBranding(aiDataHi.title, createSlug(aiDataHi.title), "hi");
                    const finalTitleHi = brandedHi.title;
                    const finalSlugHi = brandedHi.slug;

                    // Unique branded image for Hindi
                    const brandedImageHi = scraped.image ? await uploadImage(scraped.image, finalTitleHi, source.name) : null;

                    const articleHi = new NewsArticle({
                        title: finalTitleHi,
                        slug: finalSlugHi,
                        category: source.category.toLowerCase(),
                        subCategory: aiDataHi.subCategory || "General",
                        summary: aiDataHi.summary,
                        content: aiDataHi.content,
                        image: brandedImageHi,
                        tags: aiDataHi.tags || [],
                        source: source.name,
                        urlHash: `${urlHash}-hi`,
                        autoGenerated: true,
                        status: "draft",
                        author: "AI News Bot",
                        lang: "hi",
                        isHidden: true
                    });
                    await articleHi.save();
                    console.log(`[SAVED-HI] ✅ ${articleHi.title}`);
                }

                // --- ENGLISH ---
                const aiDataEn = await generateArticle(scraped.facts, 'en');
                // APPLY BRANDING
                const brandedEn = ensureBranding(aiDataEn.title, createSlug(aiDataEn.title), "en");
                const finalTitleEn = brandedEn.title;
                const finalSlugEn = brandedEn.slug;

                // Unique branded image for English
                const brandedImageEn = scraped.image ? await uploadImage(scraped.image, finalTitleEn, source.name) : null;

                const articleEn = new NewsArticle({
                    title: finalTitleEn,
                    slug: finalSlugEn,
                    category: source.category.toLowerCase(),
                    subCategory: aiDataEn.subCategory || "General",
                    summary: aiDataEn.summary,
                    content: aiDataEn.content,
                    image: brandedImageEn,
                    tags: aiDataEn.tags || [],
                    source: source.name,
                    urlHash: `${urlHash}-en`,
                    autoGenerated: true,
                    status: "draft",
                    author: "AI News Bot",
                    lang: "en",
                    isHidden: true
                });
                await articleEn.save();
                console.log(`[SAVED-EN] ✅ ${articleEn.title}`);

                existingTitles.push(item.title);
                stats.processed++;
                stateCounters[state] = (stateCounters[state] || 0) + 1;
                stats.articles.push(item.title);
            } catch (err) {
                console.error(`[PROCESS ERROR] ❌ Failed to save "${item.title}":`, err.message);
                stats.errors++;
            }
        };

        for (let i = 0; i < allPotentialItems.length; i += CONCURRENCY) {
            if (stats.processed >= GLOBAL_LIMIT) break;
            await Promise.allSettled(allPotentialItems.slice(i, i + CONCURRENCY).map(processArticle));
        }

        res.json({ success: true, msg: "Manual batch completed with logo watermarking.", stats });
    } catch (error) {
        res.status(500).json({ error: "Batch processing failed." });
    }
};

const getAutoGeneratedDrafts = async (req, res) => {
    try {
        const drafts = await NewsArticle.find({ autoGenerated: true, status: "draft" })
            .sort({ createdAt: -1 })
            .limit(100);
        // Removed .select("-content") to allow editing drafts directly from the list
        res.json({ success: true, count: drafts.length, drafts });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch drafts." });
    }
};

const cleanupDuplicates = async (req, res) => {
    try {
        const duplicates = await NewsArticle.aggregate([
            { $group: { _id: { slug: "$slug" }, regexCount: { $sum: 1 }, ids: { $push: "$_id" } } },
            { $match: { regexCount: { $gt: 1 } } }
        ]);
        let totalRemoved = 0;
        for (const doc of duplicates) {
            const idsToDelete = doc.ids.slice(1);
            const result = await NewsArticle.deleteMany({ _id: { $in: idsToDelete } });
            totalRemoved += result.deletedCount;
        }
        res.json({ success: true, msg: `Removed ${totalRemoved} duplicates.`, removed: totalRemoved });
    } catch (error) {
        res.status(500).json({ error: "Cleanup failed." });
    }
};

const fixLanguageTags = async (req, res) => {
    try {
        const hindiArticles = await NewsArticle.find({ lang: "hi" });
        let fixedCount = 0;
        for (const article of hindiArticles) {
            if (!hasHindiCharacters(article.title)) {
                article.lang = "en";
                await article.save();
                fixedCount++;
            }
        }
        res.json({ success: true, msg: `Fixed ${fixedCount} language tags.`, fixed: fixedCount });
    } catch (error) {
        res.status(500).json({ error: "Language cleanup failed." });
    }
};

module.exports = { autoGenerateNews, fetchAndProcessNews, getAutoGeneratedDrafts, cleanupDuplicates, fixLanguageTags };
