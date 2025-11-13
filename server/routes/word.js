// server/routes/word.js - Word definition API route

import express from 'express';
import getClientPromise from '../lib/mongodb.js';
import { getWordDefinition } from '../lib/openrouter.js';
import { getWordDefinitionGemini } from '../lib/gemini.js';

const router = express.Router();

const memCache = new Map();
const MAX_CACHE_SIZE = 500;

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  return input.replace(/[{}\[\]$]/g, '').trim();
}

function validateWordInput(word) {
  const sanitized = sanitizeInput(word);
  if (sanitized.length === 0 || sanitized.length > 100) {
    throw new Error('Word must be 1-100 characters');
  }
  return sanitized;
}

function validateVerseRef(verseRef) {
  const sanitized = sanitizeInput(verseRef);
  if (!/^[A-Za-zА-Яа-я0-9\s:.-]+$/.test(sanitized)) {
    throw new Error('Invalid verse reference format');
  }
  if (sanitized.length > 50) {
    throw new Error('Verse reference too long');
  }
  return sanitized;
}

function getFromMemCache(key) {
  if (memCache.has(key)) {
    const value = memCache.get(key);
    memCache.delete(key);
    memCache.set(key, value);
    return value;
  }
  return null;
}

function setToMemCache(key, value) {
  if (memCache.size >= MAX_CACHE_SIZE) {
    const firstKey = memCache.keys().next().value;
    memCache.delete(firstKey);
  }
  memCache.set(key, value);
}

router.post('/', async (req, res) => {
  try {
    const { word, verseRef, verseContext } = req.body;
    
    if (!word || !verseRef) {
      return res.status(400).json({
        error: 'Missing required fields: word, verseRef'
      });
    }
    
    const sanitizedWord = validateWordInput(word);
    const sanitizedVerseRef = validateVerseRef(verseRef);
    const sanitizedContext = verseContext ? sanitizeInput(verseContext).slice(0, 500) : '';
    
    const cacheKey = `${sanitizedWord.toLowerCase()}:${sanitizedVerseRef}`;
    
    const memCached = getFromMemCache(cacheKey);
    if (memCached) {
      console.log(`Memory cache hit: ${sanitizedWord} in ${sanitizedVerseRef}`);
      return res.json(memCached);
    }
    
    const client = await getClientPromise();
    const db = client.db('bible-app');
    const collection = db.collection('words');
    
    const existing = await collection.findOne({
      word: sanitizedWord.toLowerCase(),
      verse_ref: sanitizedVerseRef
    });
    
    if (existing) {
      console.log(`DB cache hit: ${sanitizedWord} in ${sanitizedVerseRef}`);
      setToMemCache(cacheKey, existing);
      return res.json(existing);
    }
    
    console.log(`Cache miss - generating definition for: ${sanitizedWord} in ${sanitizedVerseRef}`);
    
    // Choose API provider based on environment variable
    const useGemini = process.env.USE_GEMINI === 'true' || process.env.GEMINI_API_KEY;
    let aiDefinition;
    
    if (useGemini && process.env.GEMINI_API_KEY) {
      console.log('Using Gemini API for word definition');
      aiDefinition = await getWordDefinitionGemini(sanitizedWord, sanitizedContext);
    } else {
      console.log('Using OpenRouter API for word definition');
      aiDefinition = await getWordDefinition(sanitizedWord, sanitizedContext);
    }
    
    if (!aiDefinition) {
      return res.status(500).json({
        error: 'Failed to generate definition'
      });
    }
    
    const newDefinition = {
      word: sanitizedWord.toLowerCase(),
      verse_ref: sanitizedVerseRef,
      greek_hebrew: aiDefinition.greek_hebrew,
      explanations: aiDefinition.explanations,
      ai_generated: true,
      verified: false,
      created_at: new Date()
    };
    
    await collection.insertOne(newDefinition);
    setToMemCache(cacheKey, newDefinition);
    
    console.log(`Definition saved for: ${sanitizedWord}`);
    
    return res.json(newDefinition);
  } catch (error) {
    console.error('Word API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
