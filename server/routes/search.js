// server/routes/search.js - Bible search API route

import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseReference, highlightText } from '../../shared/bible-utils.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bibleData = null;

// Load Bible data
async function loadBibleData() {
  if (bibleData) return bibleData;
  
  const dataPath = path.join(__dirname, '../../data/bible.json');
  const data = await readFile(dataPath, 'utf-8');
  bibleData = JSON.parse(data);
  return bibleData;
}

router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();

    if (query.length < 2) {
      return res.json({ 
        results: [], 
        message: 'Enter at least 2 characters' 
      });
    }

    // Load Bible data
    const verses = await loadBibleData();
    const results = [];

    // Check if it's a reference search
    const referenceMatch = parseReference(query);
    
    if (referenceMatch) {
      // Search by reference
      const filtered = verses.filter(v => 
        v.book === referenceMatch.book && 
        (!referenceMatch.chapter || v.chapter === referenceMatch.chapter) && 
        (!referenceMatch.verse || v.verse === referenceMatch.verse)
      );
      
      return res.json({ 
        results: filtered.slice(0, 50), 
        type: 'reference', 
        total: filtered.length 
      });
    }

    // Full-text search
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

    return res.json({ 
      results, 
      type: 'text', 
      total: results.length 
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
