const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter rankings
        "X-Title": "PrimeTime Media", // Optional, for OpenRouter rankings
    }
});

const generateArticle = async (facts) => {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an SEO-focused news writer who writes in simple, clear English. Output ONLY valid JSON. Never use markdown inside the JSON values — use only HTML tags for formatting.",
                },
                {
                    role: "user",
                    content: `
You are an expert news writer. Based on the facts below, write a FULL, LONG, SEO-optimized news article in simple English.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write a clear, SEO-friendly title.
- Use simple, everyday English words — no complex vocabulary.
- Include the most important keyword of the news naturally.
- Keep it between 8 and 14 words.
- Make it interesting so people want to click and read.
- Example: "India and China Hold Peace Talks — What It Means for You"

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

<h2>What Happens Next?</h2>
<p>2-3 sentences on what to expect in the coming days or weeks.</p>

<h2>Frequently Asked Questions (FAQ)</h2>
<ul>
  <li><strong>Q: [Simple question about the topic]?</strong> A: [Short, clear answer.]</li>
  <li><strong>Q: [Another common question]?</strong> A: [Short, clear answer.]</li>
  <li><strong>Q: [Third question]?</strong> A: [Short, clear answer.]</li>
</ul>

<h2>Conclusion</h2>
<p>2-3 sentences wrapping up the story. Keep it simple and leave the reader informed.</p>

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
  "content": "<p>Opening...</p><h2>What Happened?</h2><p>...</p><h2>Key Highlights</h2><ul><li>...</li></ul><h2>Why Does This Matter?</h2><p>...</p><h2>What Are People Saying?</h2><p>...</p><h2>What Happens Next?</h2><p>...</p><h2>Frequently Asked Questions (FAQ)</h2><ul><li><strong>Q: ...?</strong> A: ...</li></ul><h2>Conclusion</h2><p>...</p>",
  "summary": "2-3 simple sentences summarizing the key news for SEO meta description.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "subCategory": "OneWordSubCategory"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTS TO PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
