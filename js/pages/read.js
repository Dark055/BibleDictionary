// js/pages/read.js - Логика страницы чтения

import { BIBLE_BOOKS } from '../config.js';
import { getUrlParams, getBookName } from '../utils.js';
import { loadBibleData, getChapter } from '../bible-data.js';
import { Navigation } from '../components/Navigation.js';
import { MobileNavigation } from '../components/MobileNavigation.js';
import { BibleReader } from '../components/BibleReader.js';
import { Search } from '../components/Search.js';
import { WordTooltip } from '../components/WordTooltip.js';

let currentBook = null;
let currentChapter = null;
let navigation = null;
let mobileNavigation = null;
let bibleReader = null;
let currentTooltip = null;

// Инициализация страницы
async function init() {
  // Получить параметры из URL
  const params = getUrlParams();
  currentBook = params.book || 1;
  currentChapter = params.chapter || 1;
  
  // Загрузить данные Библии
  try {
    await loadBibleData();
    console.log('Данные Библии загружены');
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    showError('Не удалось загрузить данные Библии');
    return;
  }
  
  // Отобразить главу
  displayChapter(currentBook, currentChapter);
}

// Отобразить главу
function displayChapter(book, chapter) {
  try {
    const verses = getChapter(book, chapter);
    
    if (verses.length === 0) {
      showError('Глава не найдена');
      return;
    }
    
    // Обновить заголовки
    updateHeaders(book, chapter, verses.length);
    
    // Создать или обновить навигацию (desktop)
    const navContainer = document.getElementById('navigation-container');
    if (navigation) {
      navigation.update(book, chapter);
    } else {
      navigation = new Navigation(navContainer, book, chapter, handleNavigation);
    }
    
    // Создать или обновить мобильную навигацию
    const mobileNavButton = document.getElementById('mobile-nav-button');
    if (mobileNavigation) {
      mobileNavigation.update(book, chapter);
    } else if (mobileNavButton) {
      mobileNavigation = new MobileNavigation(mobileNavButton, book, chapter, handleNavigation);
    }
    
    // Создать или обновить читалку
    const readerContainer = document.getElementById('bible-reader-container');
    if (bibleReader) {
      bibleReader.updateVerses(verses, book, chapter);
    } else {
      bibleReader = new BibleReader(readerContainer, verses, book, chapter);
      bibleReader.onWordClick = handleWordClick;
    }
    
    // Обновить title страницы
    document.title = `${getBookName(book, BIBLE_BOOKS)} ${chapter} - Живая Библия`;
    
  } catch (error) {
    console.error('Ошибка отображения главы:', error);
    showError('Ошибка отображения главы');
  }
}

// Обновить заголовки страницы
function updateHeaders(book, chapter, verseCount) {
  const bookTitle = document.getElementById('book-title');
  const chapterLabel = document.getElementById('chapter-label');
  
  if (bookTitle) {
    bookTitle.textContent = getBookName(book, BIBLE_BOOKS);
  }
  
  if (chapterLabel) {
    chapterLabel.textContent = `Глава ${chapter} • ${verseCount} ${
      verseCount === 1 ? 'стих' : 
      verseCount < 5 ? 'стиха' : 'стихов'
    }`;
  }
}

// Обработка навигации
function handleNavigation(book, chapter) {
  currentBook = book;
  currentChapter = chapter;
  
  // Закрыть текущий тултип если есть
  if (currentTooltip) {
    currentTooltip.close();
    currentTooltip = null;
  }
  
  // Закрыть мобильное меню если открыто
  if (mobileNavigation && mobileNavigation.isOpen) {
    mobileNavigation.close();
  }
  
  // Отобразить новую главу
  displayChapter(book, chapter);
  
  // Прокрутить наверх
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обработка клика по слову
function handleWordClick(word, verseRef, verseContext, position) {
  // Закрыть предыдущий тултип
  if (currentTooltip) {
    currentTooltip.close();
  }
  
  // Создать новый тултип
  currentTooltip = new WordTooltip(word, verseRef, verseContext, position);
}

// Показать ошибку
function showError(message) {
  const container = document.getElementById('bible-reader-container');
  if (container) {
    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4">
        <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-red-700 mb-2">Ошибка</h3>
          <p class="text-red-600">${message}</p>
          <a href="index.html" class="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            Вернуться на главную
          </a>
        </div>
      </div>
    `;
  }
}

// Запустить инициализацию при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Обработка изменения hash для навигации к стиху
window.addEventListener('hashchange', () => {
  if (bibleReader) {
    const hash = window.location.hash;
    if (hash.startsWith('#v')) {
      const verseNum = parseInt(hash.slice(2));
      bibleReader.scrollToVerse(verseNum);
    }
  }
});
