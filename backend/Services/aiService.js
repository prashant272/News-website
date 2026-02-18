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
                    content: "You are a professional journalist for a major news outlet.",
                },
                {
                    role: "user",
                    content: `
Write a completely original, engaging, and SEO-friendly news article 
based ONLY on the following facts.

Requirements:
- Professional journalistic tone.
- Engaging headline (but do not output it separately, just the body).
- No new information not present in the facts.
- Do not mention that this is AI-generated or based on provided facts.
- Structure with clear paragraphs.

Facts:
${facts}
          `,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to generate article from AI.");
    }
};

module.exports = generateArticle;
