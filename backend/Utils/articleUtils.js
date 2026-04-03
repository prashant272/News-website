// Category mapping to ensure consistent URLs between Hindi names and English slugs
const CATEGORY_MAP = {
    "भारत": "india", "india": "india",
    "world": "world", "विदेश": "world",
    "sports": "sports", "खेल": "sports",
    "entertainment": "entertainment", "मनोरंजन": "entertainment",
    "business": "business", "बिजनेस": "business",
    "lifestyle": "lifestyle", "लाइफस्टाइल": "lifestyle",
    "technology": "technology", "tech": "technology",
    "awards": "awards", "अवॉर्ड्स": "awards",
    "regional": "regional", "state": "regional", "राज्य": "regional", "राज्य समाचार": "regional",
    "health": "health", "स्वास्थ्य": "health",
};
// hello

/**
 * Helper to slugify category/subCategory names for URL construction.
 */
function getEnglishSlug(name) {
    if (!name) return "";
    const lowerName = name.toString().toLowerCase().trim();
    if (CATEGORY_MAP[lowerName]) return CATEGORY_MAP[lowerName];
    return lowerName.replace(/[^\u0900-\u097Fa-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Helper to get the correct absolute article URL based on language.
 */
function getArticleUrl(newsItem) {
    // Robust check for Hindi language
    const title = newsItem.title || "";
    const isHindi = newsItem.lang === "hi" || /[\u0900-\u097F]/.test(title);
    
    const baseUrl = isHindi ? "https://hindi.primetimemedia.in" : "https://www.primetimemedia.in";
    const cat = getEnglishSlug(newsItem.category);
    const subCat = getEnglishSlug(newsItem.subCategory || newsItem.category);
    return `${baseUrl}/Pages/${cat}/${subCat}/${newsItem.slug}`;
}

module.exports = { getArticleUrl, getEnglishSlug };
