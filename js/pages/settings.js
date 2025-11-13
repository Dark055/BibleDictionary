// js/pages/settings.js - Логика страницы настроек

import { CacheManager } from '../components/CacheManager.js';

// Инициализация страницы
async function init() {
  // Инициализировать менеджер кеша
  const cacheContainer = document.getElementById('cache-manager-container');
  if (cacheContainer) {
    new CacheManager(cacheContainer);
  }
}

// Запустить инициализацию при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
