// server/routes/search.js - Bible search API route

import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bible books configuration
const BIBLE_BOOKS = [
  "Бытие", "Исход", "Левит", "Числа", "Второзаконие",
  "Иисус Навин", "Книга Судей", "Руфь", "1 Царств", "2 Царств",
  "3 Царств", "4 Царств", "1 Паралипоменон", "2 Паралипоменон",
  "Ездра", "Неемия", "Есфирь",
  "Иов", "Псалтирь", "Притчи", "Екклесиаст", "Песнь Песней",
  "Исаия", "Иеремия", "Плач Иеремии", "Иезекииль", "Даниил",
  "Осия", "Иоиль", "Амос", "Авдий", "Иона", "Михей",
  "Наум", "Аввакум", "Софония", "Аггей", "Захария", "Малахия",
  "От Матфея", "От Марка", "От Луки", "От Иоанна",
  "Деяния",
  "Иакова", "1 Петра", "2 Петра", "1 Иоанна", "2 Иоанна", "3 Иоанна", "Иуды",
  "Римлянам", "1 Коринфянам", "2 Коринфянам", "Галатам",
  "Ефесянам", "Филиппийцам", "Колоссянам",
  "1 Фессалоникийцам", "2 Фессалоникийцам",
  "1 Тимофею", "2 Тимофею", "Титу", "Филимону",
  "Евреям",
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

let bibleData = null;

// Load Bible data
async function loadBibleData() {
  if (bibleData) return bibleData;
  
  const dataPath = path.join(__dirname, '../../data/bible.json');
  const data = await readFile(dataPath, 'utf-8');
  bibleData = JSON.parse(data);
  return bibleData;
}

// Parse Bible reference
function parseReference(query) {
  const bookNames = BIBLE_BOOKS.map((name, idx) => ({
    name: name.toLowerCase(),
    aliases: BOOK_ALIASES[name.toLowerCase()] || [],
    number: idx + 1
  }));

  // Pattern: "Бытие 1:1", "Матф 5", "Иоанна 3:16"
  const pattern = /^([а-яё\s\d]+)\s*(\d+)?(?::(\d+))?$/iu;
  const match = query.match(pattern);
  
  if (!match) return null;
  
  const bookQuery = match[1].trim().toLowerCase();
  const chapter = match[2] ? parseInt(match[2]) : undefined;
  const verse = match[3] ? parseInt(match[3]) : undefined;
  
  // Find book by name or alias
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

// Escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      
      // Check if verse contains all words from query
      const matchesAll = words.every(word => text.includes(word));
      
      if (matchesAll) {
        // Highlight matching words
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
