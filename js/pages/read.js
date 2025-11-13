// js/pages/read.js - Логика страницы чтения

import { BIBLE_BOOKS } from '../config.js';
import { getUrlParams, getBookName, updateUrl } from '../utils.js';
import { initBibleData, getChapter as getBibleChapter, getCurrentTranslation, setCurrentTranslation, clearChapterCache } from '../bible-service.js';
import { Navigation } from '../components/Navigation.js';
import { MobileNavigation } from '../components/MobileNavigation.js';
import { BibleReader } from '../components/BibleReader.js';
import { WordTooltip } from '../components/WordTooltip.js';
import { TranslationSelector } from '../components/TranslationSelector.js';

let currentBook = null;
let currentChapter = null;
let navigation = null;
let mobileNavigation = null;
let bibleReader = null;
let currentTooltip = null;
let translationSelector = null;

// Инициализация страницы
async function init() {
  // Получить параметры из URL
  const params = getUrlParams();
  currentBook = Number(params.book) || 1;
  currentChapter = Number(params.chapter) || 1;
  
  // Загрузить данные Библии
  try {
    await initBibleData();
    console.log('Данные Библии загружены');
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    showError('Не удалось загрузить данные Библии');
    return;
  }
  
  // Отобразить главу
  displayChapter(currentBook, currentChapter);
  
  // Инициализировать десктопный селектор перевода
  const translationContainer = document.getElementById('translation-selector');
  if (translationContainer) {
    translationSelector = new TranslationSelector(translationContainer, handleTranslationChange, false);
  }
  
  // Инициализировать мобильный селектор перевода (показываем только на мобильных)
  const mobileTranslationContainer = document.getElementById('mobile-translation-selector');
  if (mobileTranslationContainer && window.innerWidth < 768) {
    mobileTranslationContainer.classList.remove('hidden');
    const mobileSelector = new TranslationSelector(mobileTranslationContainer, handleTranslationChange, true);
  }
  
  // Обработка изменения размера окна
  window.addEventListener('resize', () => {
    if (mobileTranslationContainer) {
      if (window.innerWidth < 768) {
        mobileTranslationContainer.classList.remove('hidden');
        if (!mobileTranslationContainer.firstChild) {
          const mobileSelector = new TranslationSelector(mobileTranslationContainer, handleTranslationChange, true);
        }
      } else {
        mobileTranslationContainer.classList.add('hidden');
      }
    }
  });
}

// Отобразить главу
async function displayChapter(book, chapter, forceRefresh = false) {
  try {
    const translation = getCurrentTranslation();
    const verses = await getBibleChapter(translation, book, chapter, !forceRefresh);
    
    if (verses.length === 0) {
      showError('Глава не найдена');
      return;
    }
    
    // Обновить URL с переводом
    updateUrl(book, chapter, translation);
    
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
    
    if (error.message.includes('Bolls API error') || !navigator.onLine) {
      // Пробуем загрузить из кеша даже если useCache=false
      try {
        const translation = getCurrentTranslation();
        const cachedVerses = await getBibleChapter(translation, book, chapter, true);
        
        if (cachedVerses.length > 0) {
          // Показываем кешированные данные с предупреждением
          showOfflineWarning(book, chapter, cachedVerses);
          return;
        }
      } catch (cacheError) {
        console.error('Не удалось загрузить из кеша:', cacheError);
      }
      
      showError('Нет подключения к интернету и нет сохранённой главы. Проверьте подключение и попробуйте снова.');
    } else {
      showError('Ошибка отображения главы');
    }
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
async function handleNavigation(book, chapter) {
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
  await displayChapter(book, chapter);
  
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

// Обработка смены перевода
async function handleTranslationChange(newTranslation) {
  // Закрыть текущий тултип если есть
  if (currentTooltip) {
    currentTooltip.close();
    currentTooltip = null;
  }
  
  // Очищаем кеш при смене перевода
  clearChapterCache();
  
  // Перезагружаем главу с новым переводом
  await displayChapter(currentBook, currentChapter);
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

// Показать предупреждение офлайн-режима с кешированными данными
function showOfflineWarning(book, chapter, verses) {
  const container = document.getElementById('bible-reader-container');
  if (!container) return;
  
  updateHeaders(book, chapter, verses.length);
  
  const warningHtml = `
    <div class="max-w-5xl mx-auto px-4 mb-6">
      <div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-amber-800">Офлайн-режим</h3>
            <p class="text-xs text-amber-700">Показана сохранённая версия главы. Подключение к интернету отсутствует.</p>
          </div>
        </div>
        <button onclick="location.reload()" class="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
          Обновить
        </button>
      </div>
    </div>
  `;
  
  container.innerHTML = warningHtml;
  
  const readerWrapper = document.createElement('div');
  container.appendChild(readerWrapper);
  
  bibleReader = new BibleReader(readerWrapper, verses, book, chapter);
  bibleReader.onWordClick = handleWordClick;
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

// Обработка онлайн/офлайн событий
window.addEventListener('online', () => {
  if (currentBook && currentChapter) {
    displayChapter(currentBook, currentChapter, true);
  }
});

window.addEventListener('offline', () => {
  console.log('Приложение работает в офлайн-режиме');
});
