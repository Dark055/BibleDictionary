// js/utils.js - Вспомогательные функции

/**
 * Получить параметры из URL
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    book: params.get('book') ? parseInt(params.get('book')) : null,
    chapter: params.get('chapter') ? parseInt(params.get('chapter')) : null,
    verse: params.get('verse') ? parseInt(params.get('verse')) : null,
  };
}

/**
 * Обновить URL без перезагрузки страницы
 */
export function updateUrl(book, chapter, verse = null) {
  const url = new URL(window.location);
  url.searchParams.set('book', book);
  url.searchParams.set('chapter', chapter);
  if (verse) {
    url.searchParams.set('verse', verse);
  } else {
    url.searchParams.delete('verse');
  }
  window.history.pushState({}, '', url);
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
