import { getCacheStats, clearChapterCache, clearExpiredCache } from '../bible-service.js';

export class CacheManager {
  constructor(container) {
    this.container = container;
    this.stats = null;
    
    this.render();
    this.attachEvents();
    this.updateStats();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Управление кешем
          </h3>
          <button id="refresh-stats" class="text-blue-600 hover:text-blue-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div id="cache-stats" class="space-y-3 mb-4">
          <div class="text-sm text-gray-600">Загрузка статистики...</div>
        </div>
        
        <div class="flex gap-2 pt-4 border-t border-gray-200">
          <button id="clear-expired" class="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium">
            Очистить устаревшие
          </button>
          <button id="clear-all" class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
            Очистить всё
          </button>
        </div>
      </div>
    `;
  }

  updateStats() {
    this.stats = getCacheStats();
    this.renderStats();
  }

  renderStats() {
    const statsContainer = this.container.querySelector('#cache-stats');
    if (!statsContainer || !this.stats) return;

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Нет данных';
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getTranslationName = (code) => {
      const names = {
        'UBIO': 'Украинский',
        'NRT': 'Русский',
        'NIV': 'Английский'
      };
      return names[code] || code;
    };

    statsContainer.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-3">
          <div class="text-2xl font-bold text-blue-700">${this.stats.chapterCount}</div>
          <div class="text-xs text-blue-600">Глав в кеше</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3">
          <div class="text-2xl font-bold text-green-700">${this.stats.totalSize}</div>
          <div class="text-xs text-green-600">Размер кеша</div>
        </div>
      </div>
      
      ${Object.keys(this.stats.translationStats).length > 0 ? `
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-sm font-medium text-gray-700 mb-2">По переводам:</div>
          <div class="space-y-1">
            ${Object.entries(this.stats.translationStats).map(([code, count]) => `
              <div class="flex justify-between text-xs">
                <span class="text-gray-600">${getTranslationName(code)}:</span>
                <span class="font-medium">${count} глав</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-gray-500">Самая старая:</span>
          <div class="font-medium text-gray-700">${formatDate(this.stats.oldestEntry?.timestamp)}</div>
        </div>
        <div>
          <span class="text-gray-500">Самая новая:</span>
          <div class="font-medium text-gray-700">${formatDate(this.stats.newestEntry?.timestamp)}</div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const refreshBtn = this.container.querySelector('#refresh-stats');
    const clearExpiredBtn = this.container.querySelector('#clear-expired');
    const clearAllBtn = this.container.querySelector('#clear-all');

    refreshBtn?.addEventListener('click', () => {
      this.updateStats();
    });

    clearExpiredBtn?.addEventListener('click', async () => {
      const removed = clearExpiredCache();
      this.showNotification(`Удалено ${removed} устаревших глав`, 'success');
      this.updateStats();
    });

    clearAllBtn?.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите очистить весь кеш? Это удалит все сохранённые главы.')) {
        clearChapterCache();
        this.showNotification('Кеш полностью очищен', 'success');
        this.updateStats();
      }
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 animate-slide-in-up ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
