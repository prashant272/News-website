const { GoogleGenAI } = require("@google/genai");

// Initialize the Gemini SDK
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateArticle = async (facts, lang = 'en') => {
    try {
        const isHindi = lang === 'hi';
        const prompt = `
You are an expert news writer. Based on the facts below, write a FULL, LONG, SEO-optimized news article in ${isHindi ? 'Hindi' : 'simple English'}.
Output ONLY valid JSON. NEVER use markdown formatting like \`\`\`json or \`\`\` in your response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write a clear, SEO-friendly title ${isHindi ? 'in Hindi' : 'in simple English'}.
- ${isHindi ? 'Use professional yet easy-to-understand Hindi vocabulary.' : 'Use simple, everyday English words — no complex vocabulary.'}
- Include the most important keyword of the news naturally.
- Keep it between 8 and 14 words.
- Make it interesting so people want to click and read.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE CONTENT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write a LONG article (600-900 words) with the following HTML structure ${isHindi ? 'entirely in Hindi' : ''}:

<p><strong>Opening paragraph</strong>: 3-4 sentences. Explain what happened, who was involved, where and when. Make it engaging.</p>

<h2>${isHindi ? 'क्या हुआ?' : 'What Happened?'}</h2>
<p>2-3 paragraphs going deeper into the story. Use simple sentences. Give context and background so even a new reader understands.</p>

<h2>${isHindi ? 'मुख्य अंश' : 'Key Highlights'}</h2>
<ul>
  <li>5-7 important bullet points from the story.</li>
  <li>Each point should be a full sentence, easy to understand.</li>
</ul>

<h2>${isHindi ? 'यह क्यों महत्वपूर्ण है?' : 'Why Does This Matter?'}</h2>
<p>2 paragraphs explaining why this news is important for common people. Use relatable language.</p>

<h2>${isHindi ? 'लोग क्या कह रहे हैं?' : 'What Are People Saying?'}</h2>
<p>1-2 paragraphs on reactions — from officials, experts, or the public if mentioned in the facts.</p>

<h2>${isHindi ? 'निष्कर्ष' : 'Conclusion'}</h2>
<p>...</p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT LANGUAGE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ${isHindi ? 'Write in very simple, conversational Hindi (Aam-aadmi wali bhasha).' : 'Write in simple English. Short sentences. Easy words.'}
- ${isHindi ? 'Use words that people use in daily life. It is OKAY to use common English terms in Hindi script (e.g., "मोबाइल", "कोर्ट", "डिसीजन", "अपडेट", "पॉलिसी", "सरकार").' : 'NO jargon, NO complex vocabulary, NO technical terms.'}
- ${isHindi ? 'Avoid overly complex Sanskritized words. For example, instead of "अधिसूचना", use "नोटिस" or "सूचना". Instead of "परामर्श", use "सलाह".' : ''}
- Write like you are explaining the news to a friend over tea.
- Article must be at least 600 words long.

STRICT LANGUAGE RULES (HINDI ONLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Articles, Titles, Summaries, and Sub-categories MUST be in Hindi.
- Sub-category should be a 1-2 word Hindi name (e.g., "राजनीति", "खेल", "मनोरंजन").
- Content should be in simple, relatable Hindi (Aam-aadmi wali bhasha).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT (strictly follow this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "${isHindi ? 'लेख का शीर्षक' : 'Your SEO-friendly title here'}",
  "content": "${isHindi ? 'HTML युक्त लेख सामग्री' : '<p>Opening...</p><h2>What Happened?</h2>...'}",
  "summary": "${isHindi ? 'लेख का संक्षिप्त विवरण' : '2-3 simple sentences summarizing the key news'}",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "subCategory": "OneWordSubCategory"
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
            model: "gemini-2.5-flash",
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
