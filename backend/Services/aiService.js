const { GoogleGenAI } = require("@google/genai");

// Initialize the Gemini SDK (new @google/genai package)
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateArticle = async (facts) => {
    try {
        const prompt = `
You are an expert news writer. Based on the facts below, write a FULL, LONG, SEO-optimized news article in simple English.
Output ONLY valid JSON. NEVER use markdown formatting like \`\`\`json or \`\`\` in your response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write a clear, SEO-friendly title.
- Use simple, everyday English words — no complex vocabulary.
- Include the most important keyword of the news naturally.
- Keep it between 8 and 14 words.
- Make it interesting so people want to click and read.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE CONTENT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write a LONG article (600-900 words) with the following HTML structure:

<p><strong>Opening paragraph</strong>: 3-4 sentences. Explain what happened, who was involved, where and when. Make it engaging.</p>

<h2>What Happened?</h2>
<p>2-3 paragraphs going deeper into the story. Use simple sentences. Give context and background so even a new reader understands.</p>

<h2>Key Highlights</h2>
<ul>
  <li>5-7 important bullet points from the story.</li>
  <li>Each point should be a full sentence, easy to understand.</li>
</ul>

<h2>Why Does This Matter?</h2>
<p>2 paragraphs explaining why this news is important for common people. Use relatable language.</p>

<h2>What Are People Saying?</h2>
<p>1-2 paragraphs on reactions — from officials, experts, or the public if mentioned in the facts.</p>

<h2>Conclusion</h2>
<p>...</p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT LANGUAGE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write in simple English. Short sentences. Easy words.
- NO jargon, NO complex vocabulary, NO technical terms.
- Write like you are explaining the news to a friend over tea.
- Article must be at least 600 words long.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT (strictly follow this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "Your SEO-friendly, simple English title here",
  "content": "<p>Opening...</p><h2>What Happened?</h2><p>...</p><h2>Key Highlights</h2><ul><li>...</li></ul><h2>Why Does This Matter?</h2><p>...</p><h2>What Are People Saying?</h2><p>...</p><h2>Conclusion</h2><p>...</p>",
  "summary": "2-3 simple sentences summarizing the key news for SEO meta description.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "subCategory": "OneWordSubCategory"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTS TO PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${facts}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let text = response.text;

        // Remove potential markdown code blocks if AI ignores the instruction
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
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
You are a professional astrologer. Based on the scraped horoscope facts/data below, write a detailed, engaging Daily Rashifal (Horoscope) in simple English.
Output ONLY valid JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write for ALL 12 Zodiac Signs (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces).
- If the facts only mention some signs, use your astrological knowledge to provide a general positive guidance for the missing signs.
- Use a friendly, encouraging, and mystical tone.
- Each sign should have its own <h2> heading.
- Include a 1-2 sentence "Tip of the Day" for each sign.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "Daily Horoscope: Guidance for All Zodiac Signs",
  "content": "<h2>Aries</h2><p>...</p><h2>Taurus</h2><p>...</p> (and so on for all 12 signs)",
  "summary": "Get your daily guidance for all 12 zodiac signs. Find out what the stars have in store for you today.",
  "tags": ["Horoscope", "Astrology", "Rashifal", "DailyGuidance", "Zodiac"],
  "subCategory": "Rashifal"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA TO PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${facts}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

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
