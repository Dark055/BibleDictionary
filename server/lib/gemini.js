// server/lib/gemini.js - Google Gemini API client
import https from 'https';

const httpsAgent = new https.Agent({ keepAlive: true });

export async function getWordDefinitionGemini(word, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = process.env.GEMINI_API_URL;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY must be set in .env file');
  }
  if (!apiUrl) {
    throw new Error('GEMINI_API_URL must be set in .env file');
  }

  const systemPrompt = `Найди лемму для "${word}" в стихе: "${context}"

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

ВСЁ НА РУССКОМ.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
      topP: 0.95,
      topK: 40
    }
  };

  let response;
  try {
    const urlWithKey = `${apiUrl}?key=${apiKey}`;
    response = await fetch(urlWithKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      agent: httpsAgent,
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('Gemini API request timeout after 20 seconds');
    }
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
    console.error('Failed to parse Gemini response:', content, error);
    throw new Error('Failed to parse Gemini response');
  }
}
