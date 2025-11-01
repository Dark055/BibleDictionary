// server/lib/openrouter.js - OpenRouter API client
import https from 'https';
const httpsAgent = new https.Agent({ keepAlive: true });
export async function getWordDefinition(word, context) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const aiModel = process.env.AI_MODEL || 'minimax/minimax-m2:free';
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '300', 10);

  if (!apiKey) {
    throw new Error('AI_API_KEY must be set in .env file');
  }
  if (!apiUrl) {
    throw new Error('AI_API_URL must be set in .env file');
  }

  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      agent: httpsAgent,
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: aiModel,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Найди лемму для \"${word}\" в стихе: \"${context}\"

Язык оригинала:
• ВЗ — древнееврейский
• Ездра 4:8–6:18; 7:12–26; Дан 2:4b–7:28; Иер 10:11 — арамейский
• НЗ — древнегреческий (койне)

Ответь JSON (без markdown):
{
  "greek_hebrew": {
    "word": "<оригинал>",
    "transliteration": "<транслит>",
    "strongs_number": "<H/G номер>",
    "root": "<корень>",
    "literal_meaning": "<значение>"
  },
  "explanations": {
    "basic": "<1-2 предложения>",
    "intermediate": "<3-4 предложения с контекстом>"
  }
}

ВСЁ НА РУССКОМ.`,
          },
        ],
      }),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('AI API request timeout after 20 seconds');
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return {};
  }

  try {
    let sanitizedContent = content.trim();
    sanitizedContent = sanitizedContent.replace(/^```json\s*\n?/i, '');
    sanitizedContent = sanitizedContent.replace(/\n?```\s*$/i, '');
    sanitizedContent = sanitizedContent.trim();
    return JSON.parse(sanitizedContent);
  } catch (error) {
    console.error('Failed to parse AI response:', content, error);
    throw new Error('Failed to parse AI response');
  }
}
