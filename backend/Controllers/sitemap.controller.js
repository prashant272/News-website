const NewsArticle = require("../Models/NewsArticle");
const VisualStory = require("../Models/VisualStory");

const BASE_URL = "https://www.primetimemedia.in";

const generateSitemap = async (req, res) => {
    try {
        // Fetch ALL published articles (no limit for sitemap)
        const articles = await NewsArticle.find({ status: "published" })
            .select("slug category subCategory updatedAt")
            .sort({ updatedAt: -1 });

        // Fetch all visual stories
        const stories = await VisualStory.find({})
            .select("slug category updatedAt")
            .sort({ updatedAt: -1 });

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

        // Add Static Corporate Pages
        const staticPages = [
            '/Values', '/Vision', '/WhoWeAre', '/Management', '/Contact',
            '/disclaimer', '/privacy', '/terms'
        ];
        
        staticPages.forEach(path => {
            sitemap += `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
        });

        // Helper to slugify subcategory (Frontend Matching)
        const slugify = (text) => {
            if (!text) return "general";
            return text.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') 
                .replace(/(^-|-$)+/g, ''); 
        };

        // Add Articles
        articles.forEach(article => {
            const cat = article.category || "india";
            const subCat = slugify(article.subCategory);
            const url = `${BASE_URL}/Pages/${cat}/${subCat}/${article.slug}`;
            sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Add Visual Stories
        stories.forEach(story => {
            const url = `${BASE_URL}/visual-stories/${story.slug}`;
            sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${story.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Add Categories
        const categories = [
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
        console.error("Sitemap Generation Error:", error);
        res.status(500).send("Error generating sitemap");
    }
};

module.exports = { generateSitemap };
