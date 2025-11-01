import { BIBLE_BOOKS, BOOK_ALIASES } from './bible-constants.js';

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseReference(query) {
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

export function highlightText(text, query) {
  const words = query.toLowerCase().split(' ').filter(w => w.length > 0);
  let highlighted = text;
  
  words.forEach(word => {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
}
