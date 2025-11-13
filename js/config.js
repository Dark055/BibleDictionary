// js/config.js - Константы и конфигурация

import { BIBLE_BOOKS, BOOK_ALIASES } from '../shared/bible-constants.js';
export { BIBLE_BOOKS, BOOK_ALIASES };

export const BIBLE_STRUCTURE = {
  OT_START: 1,
  OT_END: 39,
  NT_START: 40,
  NT_END: 66,
  
  SECTIONS: [
    { name: "Пятикнижие", start: 1, end: 5 },
    { name: "Исторические книги", start: 6, end: 17 },
    { name: "Учительные книги", start: 18, end: 22 },
    { name: "Большие пророки", start: 23, end: 27 },
    { name: "Малые пророки", start: 28, end: 39 },
    { name: "Евангелия", start: 40, end: 43 },
    { name: "История церкви", start: 44, end: 44 },
    { name: "Послания Павла", start: 45, end: 58 },
    { name: "Соборные послания", start: 59, end: 65 },
    { name: "Пророчество", start: 66, end: 66 }
  ]
};

export const API_BASE_URL = 'http://127.0.0.1:8788';
// export const API_BASE_URL = null;
