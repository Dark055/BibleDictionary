// js/utils.js - Вспомогательные функции

/**
 * Получить параметры из URL
 */
export function getUrlParams() {
  const params = {};
  const hash = window.location.hash.slice(1);
  const queryString = window.location.search.slice(1);
  
  // Парсим query параметры (?book=1&chapter=1)
  if (queryString) {
    const queryPairs = queryString.split('&');
    queryPairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }
  
  // Парсим hash параметры (#/read/1/1)
  if (hash) {
    const parts = hash.split('/');
    if (parts[0] === 'read' && parts[1] && parts[2]) {
      params.book = parseInt(parts[1]);
      params.chapter = parseInt(parts[2]);
    }
  }
  
  return params;
}

/**
 * Обновить URL без перезагрузки страницы
 */
export function updateUrl(book, chapter, translation = null) {
  const hash = `/read/${book}/${chapter}`;
  const params = new URLSearchParams(window.location.search);
  
  if (translation) {
    params.set('translation', translation);
  }
  
  const queryString = params.toString();
  const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}${hash}`;
  
  window.history.replaceState(null, '', newUrl);
}

export function getTranslationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('translation');
}

/**
 * Создать элемент из HTML строки
 */
export function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

/**
 * Debounce функция для оптимизации частых вызовов
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Escape regex специальных символов
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML специальных символов
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape атрибутов для защиты от XSS
 */
export function escapeAttr(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Получить имя книги по номеру
 */
export function getBookName(bookNumber, books) {
  return books[bookNumber - 1] || `Книга ${bookNumber}`;
}

/**
 * Форматировать ссылку на стих
 */
export function formatVerseRef(book, chapter, verse, books) {
  return `${getBookName(book, books)} ${chapter}:${verse}`;
}

/**
 * Показать уведомление (toast)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = createElementFromHTML(`
    <div class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-slide-in-up ${
      type === 'error' ? 'bg-red-500' : 
      type === 'success' ? 'bg-green-500' : 
      'bg-blue-500'
    }">
      ${message}
    </div>
  `);
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Скопировать текст в буфер обмена
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Скопировано в буфер обмена', 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Ошибка копирования', 'error');
  }
}
