const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateArticle = async (facts) => {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional journalist. Output ONLY valid JSON.",
                },
                {
                    role: "user",
                    content: `
You are an expert Senior Editor and SEO Strategist for a major news network. 
Your task is to write a high-potential, viral news article based on the provided facts.

**CRITICAL RULES:**
1. **Title**: MUST include the **current date/year** (e.g., "20 Feb 2026") and specific numbers or action words (e.g., "5 Key Highlights", "Explained", "Live Updates", "Big Announcement").
   - *Bad*: "PM Modi Gives Speech"
   - *Good*: "PM Modi Speech (20 Feb 2026) – Key Highlights, 5 Big Announcements & Full Video"

2. **Structure**: The 'content' HTML MUST follow this exact structure:
   - **Introduction**: 2-3 lines strong hook summary.
   - **Key Highlights**: A bulleted list (<ul><li>...</li></ul>) of the most important points.
   - **Detailed Analysis**: "What This Means" or "Deep Dive" section.
   - **Conclusion**: A brief wrap-up or "What's Next".

3. **Tone**: Professional, engaging, and authoritative.

**Output JSON Format:**
{
  "title": "Your viral, SEO-optimized title",
  "content": "<p>Intro...</p><h3>Key Highlights</h3><ul><li>Point 1...</li></ul><h3>Detailed Analysis</h3><p>...</p>",
  "summary": "2-3 sentence meta description style summary.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "subCategory": "OneWordSubCategory"
}

**Facts to Process:**
${facts}
          `,
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        // Fallback for non-JSON response or error
        return {
            title: "Error Generating Title",
            content: "<p>Content generation failed.</p>",
            summary: "Summary unavailable.",
            tags: [],
            subCategory: "General"
        };
    }
};

module.exports = generateArticle;
