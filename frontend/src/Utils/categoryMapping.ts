
/**
 * Slugifies a string for consistent comparison (removes spaces, special chars, handles Hindi)
 */
export const slugify = (text: string): string => {
  if (!text) return "";
  return decodeURIComponent(text)
    .toLowerCase()
    .trim()
    .replace(/[^\u0900-\u097Fa-z0-9]+/g, '-') // Preserve Hindi & Alpha-numeric, replace rest with dash
    .replace(/-+/g, '-')                   // Remove multiple dashes
    .replace(/^-|-$/g, '');                // Trim dashes from ends
};

export const CATEGORY_MAP: { [key: string]: string } = {
  "india": "भारत",
  "world": "विदेश",
  "sports": "खेल",
  "entertainment": "मनोरंजन",
  "business": "बिजनेस",
  "lifestyle": "लाइफस्टाइल",
  "technology": "टेक",
  "tech": "टेक",
  "awards": "अवॉर्ड्स",
  "regional": "राज्य समाचार",
  "state": "राज्य समाचार",
  "राज्य": "राज्य समाचार",
  "health": "स्वास्थ्य",
  "uttar-pradesh": "उत्तर प्रदेश",
  "bihar": "बिहार",
  "delhi": "दिल्ली",
  "uttarakhand": "उत्तराखंड",
  "haryana": "हरियाणा",
  "rajasthan": "राजस्थान",
  "madhya-pradesh": "मध्य प्रदेश",
  "jharkhand": "झारखंड",
  "maharashtra": "महाराष्ट्र",
  "chhattisgarh": "छत्तीसगढ़",
  "punjab": "पंजाब",
  "gujarat": "गुजरात",
  "himachal": "हिमाचल प्रदेश",
  "andhra-pradesh": "आंध्र प्रदेश",
  "arunachal-pradesh": "अरुणाचल प्रदेश",
  "assam": "असम",
  "sikkim": "सिक्किम",
  "west-bengal": "पश्चिम बंगाल"
};

/**
 * Get Hindi name for an English category key
 */
export const getHindiCategory = (enKey: string): string => {
  const normalized = slugify(enKey);
  return CATEGORY_MAP[normalized] || enKey;
};

/**
 * Get English key for a Hindi display name (for API calls)
 * ALWAYS returns in slug-format (e.g., 'uttar-pradesh')
 */
export const getEnglishCategory = (name: string): string => {
  if (!name) return '';
  
  const targetSlug = slugify(name);
  
  // Special case for regional aliases
  if (targetSlug === 'राज्य-समाचार' || targetSlug === 'राज्य' || targetSlug === 'regional') return 'regional';

  // 1. Try to find by matching Hindi Value
  const entry = Object.entries(CATEGORY_MAP).find(([key, value]) => {
    return slugify(value) === targetSlug;
  });
  
  if (entry) return entry[0];

  // 2. If no Hindi match, it might already be an English slug or name
  return targetSlug;
};
