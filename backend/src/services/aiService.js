const Groq = require('groq-sdk');
const config = require('../config');

/**
 * Generate a professional executive sales summary using Groq (Llama 3).
 */
async function generateSummary(dataText) {
  if (!config.groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please set it in your .env file.');
  }

  const groq = new Groq({ apiKey: config.groqApiKey });

  const prompt = `You are a senior business analyst at Rabbitt AI. Analyze the following sales data and generate a professional executive summary suitable for C-level leadership.

The summary should include:
1. **Executive Overview**: A 2-3 sentence high-level summary of performance.
2. **Key Metrics**: Total revenue, total units sold, average order value.
3. **Regional Performance**: Which regions performed best/worst and why.
4. **Product Category Analysis**: Performance breakdown by product category.
5. **Trends & Insights**: Any notable patterns, month-over-month trends, or anomalies.
6. **Recommendations**: 2-3 actionable recommendations based on the data.

Keep the tone professional, data-driven, and concise. Use specific numbers from the data.
Format the output in clean, readable sections with headers.

--- SALES DATA ---
${dataText}
--- END DATA ---

Generate the executive summary now:`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'No summary generated.';
  } catch (error) {
    console.error('Groq API error:', error.message);
    throw new Error(`Failed to generate AI summary: ${error.message}`);
  }
}

module.exports = { generateSummary };
