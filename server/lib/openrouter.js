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
          content: `Ты библейский экзегет, специализирующийся на оригинальных языках Священного Писания.

Твоя задача - анализировать библейские слова в контексте стиха.

ВСЕ ОПИСАНИЯ И ОБЪЯСНЕНИЯ ДОЛЖНЫ БЫТЬ НА РУССКОМ ЯЗЫКЕ.

Отвечай СТРОГО в формате JSON (без markdown, без комментариев):
{
  "basic_meaning": "Простое объяснение для начинающего (1-2 предложения НА РУССКОМ)",
  "context_meaning": "Как это слово функционирует конкретно в данном стихе (2-3 предложения НА РУССКОМ)",
  "greek_hebrew": {
    "word": "оригинальное слово (греческое/еврейское)",
    "transliteration": "транслитерация латинскими буквами",
    "strongs_number": "H1234 или G5678",
    "root": "корень слова НА РУССКОМ",
    "literal_meaning": "буквальное значение корня НА РУССКОМ"
  },
  "theological_weight": "low/medium/high",
  "doctrinal_themes": ["спасение", "благодать"...],
  "connections": ["связанное слово 1", "связанное слово 2"...],
  "cross_references": [
    {
      "book": 1,
      "chapter": 1,
      "verse": 1,
      "relevance": "типология / цитата / параллель"
    }
  ],
  "explanations": {
    "basic": "Объяснение для начинающих НА РУССКОМ",
    "intermediate": "Объяснение для изучающих НА РУССКОМ",
    "academic": "Академическое объяснение НА РУССКОМ"
  }
}`
        },
        {
          role: 'user',
          content: `Проанализируй слово "${word}" в этом библейском контексте:\n\n"${context}"\n\nДай подробный анализ в формате JSON.`
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
