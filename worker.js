import bibleDataRaw from './data/bible.json';

const BIBLE_BOOKS = [
  "Бытие", "Исход", "Левит", "Числа", "Второзаконие",
  "Иисус Навин", "Книга Судей", "Руфь", "1 Царств", "2 Царств",
  "3 Царств", "4 Царств", "1 Паралипоменон", "2 Паралипоменон",
  "Ездра", "Неемия", "Есфирь",
  "Иов", "Псалтирь", "Притчи", "Екклесиаст", "Песнь Песней",
  "Исаия", "Иеремия", "Плач Иеремия", "Иезекииль", "Даниил",
  "Осия", "Иоиль", "Амос", "Авдий", "Иона", "Михей",
  "Наум", "Аввакум", "Софония", "Аггей", "Захария", "Малахия",
  "От Матфея", "От Марка", "От Луки", "От Иоанна",
  "Деяния",
  "Римлянам", "1 Коринфянам", "2 Коринфянам", "Галатам",
  "Ефесянам", "Филиппийцам", "Колоссянам",
  "1 Фессалоникийцам", "2 Фессалоникийцам",
  "1 Тимофею", "2 Тимофею", "Титу", "Филимону",
  "Евреям",
  "Иакова", "1 Петра", "2 Петра", "1 Иоанна", "2 Иоанна", "3 Иоанна", "Иуды",
  "Откровение"
];

const BOOK_ALIASES = {
  "бытие": ["быт", "бт"],
  "исход": ["исх", "ис"],
  "левит": ["лев", "лв"],
  "числа": ["чис", "чс"],
  "второзаконие": ["втор", "вт"],
  "иисус навин": ["нав", "нв"],
  "книга судей": ["суд", "сд"],
  "руфь": ["руф", "ру"],
  "от матфея": ["матф", "мф"],
  "от марка": ["марк", "мк"],
  "от луки": ["лука", "лк"],
  "от иоанна": ["иоан", "ин"],
  "деяния": ["деян"],
  "иакова": ["иак"],
  "1 петра": ["1 пет", "1пет"],
  "2 петра": ["2 пет", "2пет"],
  "римлянам": ["рим"],
  "1 коринфянам": ["1 кор", "1кор"],
  "2 коринфянам": ["2 кор", "2кор"],
  "галатам": ["галат"],
  "ефесянам": ["еф"],
  "филиппийцам": ["фил", "флп"],
  "откровение": ["откр", "от"]
};

function parseReference(query) {
  const bookNames = BIBLE_BOOKS.map((name, idx) => ({
    name: name.toLowerCase(),
    aliases: BOOK_ALIASES[name.toLowerCase()] || [],
    number: idx + 1
  }));

  const pattern = /^([а-яё\s\d]+)\s*(\d+)?(?::(\d+))?$/iu;
  const match = query.match(pattern);
  
  if (!match) return null;
  
  const bookQuery = match[1].trim().toLowerCase();
  const chapter = match[2] ? parseInt(match[2]) : undefined;
  const verse = match[3] ? parseInt(match[3]) : undefined;
  
  const foundBook = bookNames.find(b => 
    b.name === bookQuery || 
    b.aliases.some(a => a === bookQuery)
  );
  
  if (!foundBook) return null;
  
  return { 
    book: foundBook.number, 
    chapter, 
    verse 
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function handleSearch(request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').toLowerCase();

  if (query.length < 2) {
    return new Response(JSON.stringify({ 
      results: [], 
      message: 'Enter at least 2 characters' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const verses = bibleDataRaw;
  const results = [];

  const referenceMatch = parseReference(query);
  
  if (referenceMatch) {
    const filtered = verses.filter(v => 
      v.book === referenceMatch.book && 
      (!referenceMatch.chapter || v.chapter === referenceMatch.chapter) && 
      (!referenceMatch.verse || v.verse === referenceMatch.verse)
    );
    
    return new Response(JSON.stringify({ 
      results: filtered.slice(0, 50), 
      type: 'reference', 
      total: filtered.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const words = query.split(' ').filter(w => w.length > 0);
  
  for (const verse of verses) {
    const text = verse.text.toLowerCase();
    
    const matchesAll = words.every(word => text.includes(word));
    
    if (matchesAll) {
      let highlighted = verse.text;
      words.forEach(word => {
        const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      });
      
      results.push({
        ...verse,
        highlight: highlighted
      });
      
      if (results.length >= 100) break;
    }
  }

  return new Response(JSON.stringify({ 
    results, 
    type: 'text', 
    total: results.length 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getWordDefinition(word, context, env) {
  const apiKey = 'AIzaSyCQsebDKxGtgO1KS5rj_kUaaqxtmD_FUxA';
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const prompt = `Ты библейский экзегет, специализирующийся на оригинальных языках Священного Писания.

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
}

Проанализируй слово "${word}" в этом библейском контексте:\n\n"${context}"\n\nДай подробный анализ в формате JSON.`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        
        if ((response.status === 503 || response.status === 429) && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Gemini overloaded (${attempt + 1}/${maxRetries}), retry in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Gemini API error ${response.status}: ${text.slice(0, 500)}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) return {};

      let sanitizedContent = content.trim();
      sanitizedContent = sanitizedContent.replace(/^```json\s*\n?/i, '');
      sanitizedContent = sanitizedContent.replace(/\n?```\s*$/i, '');
      
      return JSON.parse(sanitizedContent.trim());
      
    } catch (error) {
      lastError = error;
      if ((error.message.includes('503') || error.message.includes('429')) && attempt < maxRetries - 1) {
        continue;
      }
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

async function handleWord(request, env) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { word, verseRef, verseContext } = await request.json();
  
  if (!word || !verseRef) {
    return new Response(JSON.stringify({
      error: 'Missing required fields: word, verseRef'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const cacheKey = `word:${word.toLowerCase()}:${verseRef}`;
  
  // KV кэш доступен только в продакшене
  if (env?.WORDS_KV) {
    const cached = await env.WORDS_KV.get(cacheKey, 'json');
    if (cached) {
      console.log(`Cache hit for word: ${word} in ${verseRef}`);
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  console.log(`Cache miss - generating definition for: ${word} in ${verseRef}`);
  
  const aiDefinition = await getWordDefinition(word, verseContext || '', env);
  
  if (!aiDefinition) {
    return new Response(JSON.stringify({
      error: 'Failed to generate definition'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const newDefinition = {
    word: word.toLowerCase(),
    verse_ref: verseRef,
    basic_meaning: aiDefinition.basic_meaning || '',
    context_meaning: aiDefinition.context_meaning || '',
    greek_hebrew: aiDefinition.greek_hebrew,
    theological_weight: aiDefinition.theological_weight,
    doctrinal_themes: Array.isArray(aiDefinition.doctrinal_themes) ? aiDefinition.doctrinal_themes : undefined,
    connections: Array.isArray(aiDefinition.connections) ? aiDefinition.connections : [],
    cross_references: Array.isArray(aiDefinition.cross_references) ? aiDefinition.cross_references : undefined,
    explanations: aiDefinition.explanations,
    ai_generated: true,
    verified: false,
    created_at: new Date().toISOString()
  };
  
  // Сохранить в KV, если доступен
  if (env?.WORDS_KV) {
    await env.WORDS_KV.put(cacheKey, JSON.stringify(newDefinition));
    console.log(`Definition saved for: ${word}`);
  } else {
    console.log(`Definition generated for: ${word} (not cached - KV not available)`);
  }
  
    return new Response(JSON.stringify(newDefinition), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('handleWord Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      if (path === '/api/search') {
        response = await handleSearch(request);
      } else if (path === '/api/word') {
        response = await handleWord(request, env);
      } else if (path === '/health') {
        response = new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString() 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (path === '/api') {
        response = new Response(JSON.stringify({
          name: 'Bible App API',
          version: '1.0.0',
          endpoints: {
            '/api/word': 'POST - Get word definition',
            '/api/search': 'GET - Search Bible verses',
            '/health': 'GET - Health check'
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response('Not Found', { 
          status: 404,
          headers: corsHeaders 
        });
      }

      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
