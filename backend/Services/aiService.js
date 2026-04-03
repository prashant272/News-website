const { GoogleGenAI } = require("@google/genai");

// Initialize the Gemini SDK
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateArticle = async (facts, lang = 'en') => {
    try {
        const isHindi = lang === 'hi';
        const languageName = isHindi ? 'Hindi' : 'English';
        
        const prompt = `
You are an expert news writer. Based on the facts below, write a FULL, LONG, SEO-optimized news article in ${languageName}.
Output ONLY valid JSON. NEVER use markdown formatting like \`\`\`json or \`\`\` in your response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write a clear, SEO-friendly title in ${languageName}.
- ${isHindi 
    ? 'Use professional yet easy-to-understand Hindi vocabulary (Aam-aadmi wali bhasha).' 
    : 'Use simple, professional English. Avoid overly complex vocabulary.'}
- Include the most important keyword of the news naturally.
- Keep it between 8 and 14 words.
- Make it interesting so people want to click and read.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE CONTENT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write a LONG article (500-700 words) with the following HTML structure in ${languageName}:

<p>Start with a strong 3-4 sentence introduction. Explain what happened, who was involved, where and when. Make it engaging. (DO NOT use labels like 'Opening Paragraph' or 'Introduction').</p>

<h2>${isHindi ? 'क्या हुआ?' : 'What Happened?'}</h2>
<p>2-3 paragraphs going deeper into the story. Use simple sentences. Give context and background so even a new reader understands.</p>

<h2>${isHindi ? 'मुख्य अंश' : 'Key Highlights'}</h2>
<ul>
  <li>5-7 important bullet points from the story.</li>
  <li>Each point should be a full sentence, easy to understand.</li>
</ul>

<h2>${isHindi ? 'यह क्यों महत्वपूर्ण है?' : 'Why Does This Matter?'}</h2>
<p>2 paragraphs explaining why this news is important for common people. Use relatable language.</p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT LANGUAGE RULES (${languageName.toUpperCase()}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isHindi ? `
- Write in very simple, conversational Hindi (Aam-aadmi wali bhasha).
- Use words that people use in daily life (e.g., "मोबाइल", "कोर्ट", "डिसीजन", "अपडेट", "पॉलिसी").
- Avoid overly complex Sanskritized words (use "नोटिस" instead of "अधिसूचना").
- STRICT SUB-CATEGORY LIST (Pick ONE based on context):
  - For Entertainment: "मुख्य खबरें", "बॉलीवुड", "हॉलीवुड"
  - For Sports: "मुख्य खेल", "IPL", "फुटबॉल"
  - For Lifestyle: "फैशन", "संस्कृति", "रोचक"
  - For Specialized: "अर्थव्यवस्था", "शासन", "पर्यावरण", "शिक्षा", "करियर", "विज्ञान"
  - Default: Any 1-2 word relevant Hindi term.` 
: `
- Write in simple, clear, and professional English.
- Use short sentences. Avoid jargon or technical terms.
- Sub-category should be a standard English news category (e.g., "India", "Sports", "Politics").`}

- Everything (Title, Content, Summary, Sub-category) MUST be in the requested language script.
- Article must be at least 500 words long.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT (strictly follow this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "String - The title of the article",
  "content": "String - The full HTML content of the article",
  "summary": "String - A short 2-3 sentence summary of the news",
  "tags": ["Array of 5 relevant tags"],
  "subCategory": "String - A 1-2 word category name"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTS TO PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${facts}
        `;

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
            }
        });
        let text = result.text;

        // More robust JSON extraction (matches from first { to last })
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini AI News Error:", error.message);
        return {
            title: "Article Generation in Progress",
            content: `<p>The AI service is currently busy. Error: ${error.message}</p>`,
            summary: "Content generation failed due to API error.",
            tags: ["Draft"],
            subCategory: "Queue"
        };
    }
};

const generateHoroscope = async (facts) => {
    try {
        const prompt = `
You are a professional astrologer. Based on the scraped horoscope facts/data below, write a detailed, engaging Daily Rashifal (Horoscope) in simple Hindi.
Output ONLY valid JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT RULES (ENIRELY IN HINDI):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write for ALL 12 Zodiac Signs (Mesh, Vrishabh, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh, Meen).
- Use a friendly, encouraging, and mystical tone in Hindi.
- Each sign should have its own <h2> heading.
- Include a 1-2 sentence "Aaj ka Mantra" (Tip of the Day) for each sign.
- Ensure the Hindi is simple and relatable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "आज का राशिफल: जानिए कैसा रहेगा आपका दिन",
  "content": "<h2>मेष</h2><p>...</p><h2>वृषभ</h2><p>...</p> (and so on for all 12 signs)",
  "summary": "सभी 12 राशियों के लिए आज का दैनिक राशिफल और मार्गदर्शन।",
  "tags": ["Rashifal", "Astrology", "DailyGuidance", "Zodiac", "Horoscope"],
  "subCategory": "Rashifal"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA TO PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${facts}
        `;

        const result = await client.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
            }
        });
        let text = result.text;

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini AI Horoscope Error:", error.message);
        return {
            title: "Daily Rashifal - Coming Soon",
            content: `<p>We are currently aligning with the stars. Error: ${error.message}</p>`,
            summary: "Daily horoscope generation in progress.",
            tags: ["Astrology"],
            subCategory: "Rashifal"
        };
    }
};

module.exports = { generateArticle, generateHoroscope };
