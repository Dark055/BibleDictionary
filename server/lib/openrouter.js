// server/lib/openrouter.js - OpenRouter API client

export async function getWordDefinition(word, context) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const aiModel = process.env.AI_MODEL || 'minimax/minimax-m2:free';

  if (!apiKey) {
    throw new Error('AI_API_KEY must be set in .env file');
  }
  
  if (!apiUrl) {
    throw new Error('AI_API_URL must be set in .env file');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: aiModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Проанализируй слово "${word}" в контексте: "${context}"

Ответь JSON (без markdown):
{
  "greek_hebrew": {
    "word": "оригинальное слово",
    "transliteration": "транслитерация",
    "strongs_number": "H/G номер",
    "root": "корень",
    "literal_meaning": "буквальное значение"
  },
  "explanations": {
    "basic": "Простое объяснение (1-2 предложения)",
    "intermediate": "Подробное объяснение с контекстом (3-4 предложения)"
  }
}

ВСЁ НА РУССКОМ.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    return {};
  }

  try {
    // The model sometimes returns the JSON inside a markdown code block
    let sanitizedContent = content.trim();
    
    // Remove markdown code blocks
    sanitizedContent = sanitizedContent.replace(/^```json\s*\n?/i, '');
    sanitizedContent = sanitizedContent.replace(/\n?```\s*$/i, '');
    sanitizedContent = sanitizedContent.trim();
    
    return JSON.parse(sanitizedContent);
  } catch (error) {
    console.error('Failed to parse AI response:', content, error);
    throw new Error('Failed to parse AI response');
  }
}
