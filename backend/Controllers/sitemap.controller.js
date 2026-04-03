const NewsArticle = require("../Models/NewsArticle");
const VisualStory = require("../Models/VisualStory");

/**
 * Helper to slugify subcategory (Frontend Matching)
 */
const slugify = (text) => {
    if (!text) return "general";
    return text.toString().toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/g, '-') // Support Hindi characters in slug if needed
        .replace(/(^-|-$)+/g, '');
};

/**
 * Standard Sitemap (All Content)
 */
const generateSitemap = async (req, res) => {
    try {
        const host = req.get('host') || "";
        const isHindi = host.includes("hindi");
        const BASE_URL = isHindi ? "https://hindi.primetimemedia.in" : "https://www.primetimemedia.in";
        const siteLang = isHindi ? "hi" : "en";

        const articles = await NewsArticle.find({ status: "published", lang: siteLang })
            .select("slug category subCategory updatedAt")
            .sort({ updatedAt: -1 });

        const stories = await VisualStory.find({})
            .select("slug category updatedAt")
            .sort({ updatedAt: -1 });

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

        // Static Pages
        const staticPages = isHindi ? 
            ['/Contact'] : 
            ['/Contact', '/disclaimer', '/privacy', '/terms'];

        staticPages.forEach(path => {
            sitemap += `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
        });

        // Articles (Every single published article)
        articles.forEach(article => {
            const cat = article.category || (isHindi ? "bharat" : "india");
            const subCat = slugify(article.subCategory);
            const url = `${BASE_URL}/Pages/${cat}/${subCat}/${article.slug}`;
            sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${article.updatedAt ? article.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Visual Stories
        stories.forEach(story => {
            const url = `${BASE_URL}/visual-stories/${story.slug}`;
            sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${story.updatedAt ? story.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Categories & States
        const categories = isHindi ? [
            'bharat', 'videsh', 'sports', 'business', 'entertainment', 'lifestyle',
            'health', 'technology', 'education', 'andhra-pradesh', 'arunachal-pradesh',
            'assam', 'bihar', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand',
            'madhya-pradesh', 'sikkim', 'uttar-pradesh', 'uttarakhand', 'west-bengal'
        ] : [
            'india', 'sports', 'business', 'entertainment', 'lifestyle',
            'health', 'technology', 'world', 'education', 'environment',
            'science', 'opinion', 'auto', 'travel', 'awards'
        ];

        categories.forEach(cat => {
            sitemap += `
  <url>
    <loc>${BASE_URL}/Pages/${cat}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });

        sitemap += `\n</urlset>`;

        res.set("Content-Type", "application/xml");
        res.status(200).send(sitemap);
    } catch (error) {
        console.error("Sitemap Error:", error);
        res.status(500).send("Error generating sitemap");
    }
};

/**
 * Google News Sitemap (Last 48 Hours ONLY)
 */
const generateNewsSitemap = async (req, res) => {
    try {
        const host = req.get('host') || "";
        const isHindi = host.includes("hindi");
        const BASE_URL = isHindi ? "https://hindi.primetimemedia.in" : "https://www.primetimemedia.in";
        const siteLang = isHindi ? "hi" : "en";
        const siteName = isHindi ? "Prime Time Hindi" : "Prime Time";
        const langCode = isHindi ? "hi" : "en";

        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const articles = await NewsArticle.find({
            status: "published",
            lang: siteLang,
            publishedAt: { $gte: twoDaysAgo }
        })
            .select("title slug category subCategory publishedAt")
            .limit(1000)
            .sort({ publishedAt: -1 });

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

        articles.forEach(article => {
            const cat = article.category || (isHindi ? "bharat" : "india");
            const subCat = slugify(article.subCategory);
            const url = `${BASE_URL}/Pages/${cat}/${subCat}/${article.slug}`;

            const escapedTitle = article.title
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

            sitemap += `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>${langCode}</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString()}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`;
        });

        sitemap += `\n</urlset>`;

        res.set("Content-Type", "application/xml");
        res.status(200).send(sitemap);
    } catch (error) {
        console.error("News Sitemap Error:", error);
        res.status(500).send("Error generating news sitemap");
    }
};

module.exports = { generateSitemap, generateNewsSitemap };
