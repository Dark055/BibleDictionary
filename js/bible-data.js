// js/bible-data.js - Работа с данными Библии

let bibleData = null;

/**
 * Загрузить данные Библии из JSON
 */
export async function loadBibleData() {
  if (bibleData) return bibleData;
  
  try {
    const response = await fetch('data/bible.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    bibleData = await response.json();
    console.log(`Загружено ${bibleData.length} стихов`);
    return bibleData;
  } catch (error) {
    console.error('Ошибка загрузки данных Библии:', error);
    throw error;
  }
}

/**
 * Получить стихи главы
 */
export function getChapter(book, chapter) {
  if (!bibleData) {
    throw new Error('Bible data not loaded. Call loadBibleData() first.');
  }
  
  return bibleData
    .filter(v => v.book === book && v.chapter === chapter)
    .sort((a, b) => a.verse - b.verse);
}

/**
 * Получить конкретный стих
 */
export function getVerse(book, chapter, verse) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  return bibleData.find(v => 
    v.book === book && 
    v.chapter === chapter && 
    v.verse === verse
  );
}

/**
 * Получить информацию о книге
 */
export function getBookInfo(book) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  const verses = bibleData.filter(v => v.book === book);
  const chapters = [...new Set(verses.map(v => v.chapter))];
  
  return {
    totalChapters: Math.max(...chapters, 0),
    totalVerses: verses.length,
    chapters: chapters.sort((a, b) => a - b)
  };
}

/**
 * Анализ частоты слова в Библии
 */
export function analyzeWordFrequency(word) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  const normalized = word.toLowerCase();
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  
  const by_book = {};
  let OT = 0, NT = 0;
  
  bibleData.forEach(verse => {
    const matches = verse.text.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      by_book[verse.book] = (by_book[verse.book] || 0) + count;
      
      if (verse.book <= 39) {
        OT += count;
      } else {
        NT += count;
      }
    }
  });
  
  return {
    word,
    total: OT + NT,
    by_book,
    by_testament: { OT, NT }
  };
}

/**
 * Поиск стихов по тексту (локальный поиск)
 */
export function searchVerses(query, limit = 50) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  const normalized = query.toLowerCase();
  const results = [];
  
  for (const verse of bibleData) {
    if (verse.text.toLowerCase().includes(normalized)) {
      results.push(verse);
      if (results.length >= limit) break;
    }
  }
  
  return results;
}

/**
 * Получить все главы книги
 */
export function getBookChapters(book) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  const verses = bibleData.filter(v => v.book === book);
  const chapters = [...new Set(verses.map(v => v.chapter))];
  return chapters.sort((a, b) => a - b);
}

/**
 * Получить статистику по книге
 */
export function getBookStats(book) {
  if (!bibleData) {
    throw new Error('Bible data not loaded');
  }
  
  const verses = bibleData.filter(v => v.book === book);
  const chapters = [...new Set(verses.map(v => v.chapter))];
  
  const chapterStats = chapters.map(chapter => {
    const chapterVerses = verses.filter(v => v.chapter === chapter);
    return {
      chapter,
      verseCount: chapterVerses.length
    };
  });
  
  return {
    totalChapters: chapters.length,
    totalVerses: verses.length,
    chapterStats
  };
}
