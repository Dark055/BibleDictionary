import { parseReference, highlightText } from './shared/bible-utils.js';

let bibleDataCache = null;

async function loadBibleData(request, env) {
  if (bibleDataCache) return bibleDataCache;

  const cache = caches.default;
  const bibleUrl = new URL('/data/bible.json', request.url);
  const req = new Request(bibleUrl.toString());

  try {
    let resp = await cache.match(req);
    if (!resp) {
      if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        resp = await env.ASSETS.fetch(req);
      } else {
        resp = await fetch(req, { cf: { cacheTtl: 86400, cacheEverything: true } });
      }
      if (resp.ok) {
        await cache.put(req, resp.clone());
      }
    }

    if (!resp || !resp.ok) {
      throw new Error(`HTTP ${resp ? resp.status : 'no response'} loading bible.json`);
    }

    bibleDataCache = await resp.json();
    return bibleDataCache;
  } catch (error) {
    throw new Error(`Failed to load bible data: ${error.message}`);
  }
}

async function handleSearch(request, env) {
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

  const verses = await loadBibleData(request, env);
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
      results.push({
        ...verse,
        highlight: highlightText(verse.text, query)
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
  const apiKey = env?.GEMINI_API_KEY;
  const apiUrl = env?.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY must be set as a Worker secret');
  }

  const prompt = `Проанализируй слово "${word}" в контексте: "${context}"

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

ВСЁ НА РУССКОМ.`;

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
    greek_hebrew: aiDefinition.greek_hebrew,
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
        response = await handleSearch(request, env);
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
        if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
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
