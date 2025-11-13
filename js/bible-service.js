import { fetchChapter, fetchBooks } from './bolls-api.js';
import { getTranslationFromUrl } from './utils.js';

const SUPPORTED_TRANSLATIONS = [
  { code: 'UBIO', name: 'Українська (UBIO)', lang: 'uk' },
  { code: 'NRT', name: 'Новый русский перевод (NRT)', lang: 'ru' },
  { code: 'NIV', name: 'NIV (English)', lang: 'en' }
];

let currentTranslation = 'NRT';

const STORAGE_KEY = 'bible-translation';
const CACHE_PREFIX = 'bible-chapter-';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 дней

function loadTranslationFromStorage() {
  try {
    // Сначала проверяем URL-параметр
    const urlTranslation = getTranslationFromUrl();
    if (urlTranslation) {
      const exists = SUPPORTED_TRANSLATIONS.some(t => t.code === urlTranslation);
      if (exists) {
        currentTranslation = urlTranslation;
        // Сохраняем в localStorage для будущих сессий
        localStorage.setItem(STORAGE_KEY, urlTranslation);
        return;
      }
    }
    
    // Затем проверяем localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const exists = SUPPORTED_TRANSLATIONS.some(t => t.code === saved);
      if (exists) {
        currentTranslation = saved;
      }
    }
  } catch (e) {
  }
}

function getCacheKey(translation, book, chapter) {
  return `${CACHE_PREFIX}${translation}-${book}-${chapter}`;
}

function getCachedChapter(translation, book, chapter) {
  try {
    const key = getCacheKey(translation, book, chapter);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (e) {
    return null;
  }
}

function setCachedChapter(translation, book, chapter, verses) {
  try {
    const key = getCacheKey(translation, book, chapter);
    const data = {
      data: verses,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
  }
}

function clearCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
  }
}

loadTranslationFromStorage();

export function getSupportedTranslations() {
  return SUPPORTED_TRANSLATIONS.slice();
}

export function getCurrentTranslation() {
  return currentTranslation;
}

export function setCurrentTranslation(code) {
  const exists = SUPPORTED_TRANSLATIONS.some(t => t.code === code);
  if (!exists) return;
  currentTranslation = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
  }
}

export async function initBibleData() {
}

export async function getChapter(translation, book, chapter, useCache = true) {
  // Проверяем кеш сначала
  if (useCache) {
    const cached = getCachedChapter(translation, book, chapter);
    if (cached) {
      return cached;
    }
  }
  
  // Загружаем из API
  const verses = await fetchChapter(translation, book, chapter);
  
  // Сохраняем в кеш
  if (useCache && verses.length > 0) {
    setCachedChapter(translation, book, chapter, verses);
  }
  
  return verses;
}

export function clearChapterCache() {
  clearCache();
}

export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    let chapterCount = 0;
    const translationStats = {};
    
    cacheKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        totalSize += size;
        chapterCount++;
        
        // Извлекаем перевод из ключа
        const match = key.match(/bible-chapter-(\w+)-\d+-\d+/);
        if (match) {
          const translation = match[1];
          translationStats[translation] = (translationStats[translation] || 0) + 1;
        }
      }
    });
    
    return {
      chapterCount,
      totalSize: formatBytes(totalSize),
      translationStats,
      oldestEntry: getOldestEntry(),
      newestEntry: getNewestEntry()
    };
  } catch (e) {
    return {
      chapterCount: 0,
      totalSize: '0 B',
      translationStats: {},
      oldestEntry: null,
      newestEntry: null
    };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getOldestEntry() {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    let oldest = null;
    let oldestTime = Infinity;
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.timestamp) {
          if (data.timestamp < oldestTime) {
            oldestTime = data.timestamp;
            oldest = { key, timestamp: data.timestamp };
          }
        }
      } catch (e) {
      }
    });
    
    return oldest;
  } catch (e) {
    return null;
  }
}

function getNewestEntry() {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    let newest = null;
    let newestTime = 0;
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.timestamp) {
          if (data.timestamp > newestTime) {
            newestTime = data.timestamp;
            newest = { key, timestamp: data.timestamp };
          }
        }
      } catch (e) {
      }
    });
    
    return newest;
  } catch (e) {
    return null;
  }
}

export function clearExpiredCache() {
  try {
    const keys = Object.keys(localStorage);
    let removed = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.timestamp) {
            const now = Date.now();
            if (now - data.timestamp > CACHE_EXPIRY) {
              localStorage.removeItem(key);
              removed++;
            }
          }
        } catch (e) {
          localStorage.removeItem(key);
          removed++;
        }
      }
    });
    
    return removed;
  } catch (e) {
    return 0;
  }
}
