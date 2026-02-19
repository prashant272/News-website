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
Write a professional news article based ONLY on the following facts.
Output must be a valid JSON object with the following fields:
- "title": Engaging headline.
- "content": HTML formatted body (paragraphs <p>...</p>). High quality, engaging journalism.
- "summary": A short 2-3 sentence summary.
- "tags": Array of 5-8 relevant tags (strings).
- "subCategory": A one-word sub-category classification (e.g., "Politics", "Cricket", "Gadgets").

Facts:
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
