// js/components/WordTooltip.js - Тултип для определения слова (упрощенная версия без графиков)

import { getWordDefinition } from '../api-client.js';
import { BIBLE_BOOKS } from '../config.js';
import { escapeHtml } from '../utils.js';

export class WordTooltip {
  constructor(word, verseRef, verseContext, position) {
    this.word = word;
    this.verseRef = verseRef;
    this.verseContext = verseContext;
    this.position = position;
    this.definition = null;
    this.frequencyData = null;
    this.loading = true;
    this.error = null;
    this.complexityLevel = 'basic';
    this.tooltipEl = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.tooltipPos = { x: position.x, y: position.y };
    this.escapeHandler = null;
    this.outsideClickHandler = null;
    this.outsideTouchHandler = null;
    this.closeHandler = null;
    this.complexityHandlers = [];
    this.headerMouseDownHandler = null;
    this.headerTouchStartHandler = null;
    
    this.create();
    this.fetchData();
  }
  
  create() {
    // Создать backdrop на мобильных
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      this.backdropEl = document.createElement('div');
      this.backdropEl.className = 'fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm';
      this.backdropEl.style.opacity = '0';
      this.backdropEl.style.transition = 'opacity 0.2s ease-out';
      document.body.appendChild(this.backdropEl);
      
      // Закрытие по клику на backdrop
      this.backdropEl.addEventListener('click', () => this.close());
      
      requestAnimationFrame(() => {
        if (this.backdropEl) this.backdropEl.style.opacity = '1';
      });
    }
    
    // Создать контейнер тултипа с простой анимацией
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'fixed z-[9999]';
    
    if (isMobile) {
      // На мобильных: позиционирование по центру экрана, снизу
      this.tooltipPos.x = window.innerWidth / 2;
      this.tooltipPos.y = window.innerHeight * 0.7;
      this.tooltipEl.style.left = '50%';
      this.tooltipEl.style.top = 'auto';
      this.tooltipEl.style.bottom = '1rem';
      this.tooltipEl.style.transform = 'translateX(-50%)';
    } else {
      // На десктопе: позиционирование рядом с кликом
      this.tooltipEl.style.left = `${this.tooltipPos.x}px`;
      this.tooltipEl.style.top = `${this.tooltipPos.y}px`;
      this.tooltipEl.style.transform = 'translate(-50%, 10px)';
    }
    
    this.tooltipEl.style.opacity = '0';
    this.tooltipEl.style.transition = 'opacity 0.2s ease-out';
    
    document.body.appendChild(this.tooltipEl);
    this.render();
    this.adjustPosition();
    this.attachEvents();
    
    // Запуск простой анимации появления
    requestAnimationFrame(() => {
      this.tooltipEl.style.opacity = '1';
    });
  }
  
  render() {
    // Простое обновление контента
    if (this.loading) {
      this.tooltipEl.innerHTML = this.renderLoading();
    } else if (this.error) {
      this.tooltipEl.innerHTML = this.renderError();
    } else if (this.definition) {
      this.tooltipEl.innerHTML = this.renderContent();
    }
  }
  
  renderLoading() {
    return `
      <div class="bg-white rounded-2xl shadow-minimal-lg p-8 md:p-10 w-[95vw] max-w-[430px] border border-light-gray">
        <div class="flex items-center justify-center gap-3">
          <div class="w-6 h-6 border-2 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
          <span class="text-text-primary text-sm md:text-base">Загрузка...</span>
        </div>
      </div>
    `;
  }
  
  renderError() {
    return `
      <div class="bg-white border border-red-200 rounded-2xl shadow-minimal-lg p-8 md:p-10 w-[95vw] max-w-[430px]">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-red-600 font-semibold text-base md:text-lg mb-2">Ошибка</p>
            <p class="text-text-secondary text-sm leading-relaxed">${this.error}</p>
          </div>
        </div>
        <button class="mt-6 w-full px-5 py-3 bg-text-primary hover:bg-accent-warm text-white font-medium rounded-xl transition-all duration-200 shadow-minimal hover:shadow-minimal-md touch-manipulation min-h-[44px]" id="close-tooltip">
          Закрыть
        </button>
      </div>
    `;
  }
  
  renderContent() {
    const explanation = this.getExplanationForLevel();

    return `
      <div class="bg-white rounded-2xl shadow-minimal-lg w-[95vw] max-w-[430px] max-h-[90vh] overflow-hidden flex flex-col border border-light-gray">
        <!-- Header (draggable) - минималистичный светлый -->
        <div id="tooltip-header" class="px-5 md:px-6 py-4 md:py-5 bg-warm-white border-b border-light-gray cursor-move md:cursor-move touch-manipulation flex items-center justify-between">
          <h3 class="text-xl md:text-2xl font-serif font-semibold text-text-primary">
            ${escapeHtml(this.word)}
          </h3>
          <button id="close-tooltip" class="text-text-secondary hover:text-accent-warm transition-colors p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center touch-manipulation rounded-lg hover:bg-white" aria-label="Закрыть">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tab Selector - минималистичный -->
        <div class="flex gap-2 px-5 md:px-6 pt-4 md:pt-5 bg-white">
          <button class="complexity-btn flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all touch-manipulation min-h-[44px] md:min-h-0 ${this.complexityLevel === 'basic' ? 'bg-accent-warm text-white shadow-minimal' : 'bg-warm-white text-text-primary hover:bg-light-gray'}" data-level="basic">
            Простой
          </button>
          <button class="complexity-btn flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all touch-manipulation min-h-[44px] md:min-h-0 ${this.complexityLevel === 'intermediate' ? 'bg-accent-warm text-white shadow-minimal' : 'bg-warm-white text-text-primary hover:bg-light-gray'}" data-level="intermediate">
            Подробный
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto custom-scrollbar flex-1">
          <div class="p-5 md:p-6 space-y-4 md:space-y-5">
            <!-- Main definition -->
            <p class="text-text-primary leading-relaxed text-base md:text-lg">${escapeHtml(explanation)}</p>

            ${this.complexityLevel === 'basic' ? this.renderBasicContent() : this.renderDetailedContent()}
          </div>
        </div>
      </div>
    `;
  }
  
  renderBasicContent() {
    return `
      <!-- Original language info -->
      ${this.definition.greek_hebrew ? `
        <div class="bg-warm-white rounded-xl p-4 md:p-5 border border-light-gray">
          <div class="flex items-center gap-2 mb-3 md:mb-4">
            <span class="text-xl md:text-2xl">📜</span>
            <h4 class="text-sm md:text-base font-serif font-semibold text-text-primary">Оригинальный язык</h4>
          </div>
          <div class="space-y-3">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-xl md:text-2xl font-serif font-semibold text-text-primary">${escapeHtml(this.definition.greek_hebrew.word)}</span>
              <span class="text-sm md:text-base text-text-secondary">(${escapeHtml(this.definition.greek_hebrew.transliteration || '')})</span>
              ${this.definition.greek_hebrew.strongs_number ? `
                <span class="text-xs md:text-sm font-medium text-accent-warm px-2 py-0.5 bg-white rounded-md border border-light-gray">Strong's ${escapeHtml(this.definition.greek_hebrew.strongs_number)}</span>
              ` : ''}
            </div>
            ${this.definition.greek_hebrew.root ? `
              <div class="text-sm md:text-base text-text-secondary">
                <span class="font-semibold">Корень:</span> <span class="italic">${escapeHtml(this.definition.greek_hebrew.root)}${this.definition.greek_hebrew.literal_meaning ? ` (значение: "${escapeHtml(this.definition.greek_hebrew.literal_meaning)}")` : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
  
  renderDetailedContent() {
    return `
      <!-- Original language info -->
      ${this.definition.greek_hebrew ? `
        <div class="bg-warm-white rounded-xl p-5 md:p-6 border border-light-gray">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">📜</span>
            <h4 class="text-base md:text-lg font-serif font-semibold text-text-primary">Оригинальный язык</h4>
          </div>
          <div class="space-y-3">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-2xl md:text-3xl font-serif font-semibold text-text-primary">${escapeHtml(this.definition.greek_hebrew.word)}</span>
              <span class="text-base md:text-lg text-text-secondary">(${escapeHtml(this.definition.greek_hebrew.transliteration || '')})</span>
              ${this.definition.greek_hebrew.strongs_number ? `
                <span class="text-sm md:text-base font-medium text-accent-warm px-2.5 py-1 bg-white rounded-md border border-light-gray">Strong's ${escapeHtml(this.definition.greek_hebrew.strongs_number)}</span>
              ` : ''}
            </div>
            ${this.definition.greek_hebrew.root ? `
              <div class="text-base md:text-lg text-text-secondary leading-relaxed">
                <span class="font-semibold">Корень:</span> <span class="italic">${escapeHtml(this.definition.greek_hebrew.root)}${this.definition.greek_hebrew.literal_meaning ? ` (значение: "${escapeHtml(this.definition.greek_hebrew.literal_meaning)}")` : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
  
  getExplanationForLevel() {
    if (this.definition.explanations) {
      return this.definition.explanations[this.complexityLevel] || this.definition.explanations.basic || 'Нет описания';
    }
    return 'Нет описания';
  }
  
  async fetchData() {
    try {
      this.loading = true;
      this.render();
      
      // Fetch definition from API
      const data = await getWordDefinition(this.word, this.verseRef, this.verseContext);
      this.definition = data;
      
      // Skip frequency analysis as it's no longer needed
      this.frequencyData = null;
      
      this.loading = false;
      this.render();
      this.adjustPosition();
      this.attachEvents();
    } catch (err) {
      console.error('Error fetching word definition:', err);
      this.error = 'Не удалось загрузить определение';
      this.loading = false;
      this.render();
      this.attachEvents();
    }
  }
  
  attachEvents() {
    this.removeEventListeners();
    
    const closeBtn = this.tooltipEl.querySelector('#close-tooltip');
    if (closeBtn) {
      this.closeHandler = (e) => {
        e.stopPropagation();
        this.close();
      };
      closeBtn.addEventListener('click', this.closeHandler);
    }
    
    const complexityBtns = this.tooltipEl.querySelectorAll('.complexity-btn');
    this.complexityHandlers = [];
    complexityBtns.forEach((btn, index) => {
      const handler = (e) => {
        e.stopPropagation();
        this.complexityLevel = btn.dataset.level;
        this.render();
        this.attachEvents();
      };
      this.complexityHandlers.push({ btn, handler });
      btn.addEventListener('click', handler);
    });
    
    const header = this.tooltipEl.querySelector('#tooltip-header');
    if (header) {
      this.headerMouseDownHandler = (e) => {
        if (e.target.closest('#close-tooltip')) {
          return;
        }
        this.startDrag(e);
      };
      header.addEventListener('mousedown', this.headerMouseDownHandler);
      
      this.headerTouchStartHandler = (e) => {
        if (e.target.closest('#close-tooltip')) {
          return;
        }
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrag({
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => e.preventDefault()
        });
      };
      header.addEventListener('touchstart', this.headerTouchStartHandler, { passive: false });
    }
    
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
    
    this.outsideClickHandler = (e) => {
      if (!this.tooltipEl.contains(e.target)) {
        this.close();
      }
    };
    this.outsideTouchHandler = (e) => {
      if (!this.tooltipEl.contains(e.target)) {
        this.close();
      }
    };
    setTimeout(() => {
      document.addEventListener('mousedown', this.outsideClickHandler);
      document.addEventListener('touchstart', this.outsideTouchHandler);
    }, 100);
  }
  
  removeEventListeners() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
    if (this.outsideClickHandler) {
      document.removeEventListener('mousedown', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
    if (this.outsideTouchHandler) {
      document.removeEventListener('touchstart', this.outsideTouchHandler);
      this.outsideTouchHandler = null;
    }
    
    const closeBtn = this.tooltipEl?.querySelector('#close-tooltip');
    if (closeBtn && this.closeHandler) {
      closeBtn.removeEventListener('click', this.closeHandler);
      this.closeHandler = null;
    }
    
    this.complexityHandlers.forEach(({ btn, handler }) => {
      btn.removeEventListener('click', handler);
    });
    this.complexityHandlers = [];
    
    const header = this.tooltipEl?.querySelector('#tooltip-header');
    if (header) {
      if (this.headerMouseDownHandler) {
        header.removeEventListener('mousedown', this.headerMouseDownHandler);
        this.headerMouseDownHandler = null;
      }
      if (this.headerTouchStartHandler) {
        header.removeEventListener('touchstart', this.headerTouchStartHandler);
        this.headerTouchStartHandler = null;
      }
    }
  }
  
  startDrag(e) {
    if (e.preventDefault) e.preventDefault();
    this.isDragging = true;
    
    const isMobile = window.innerWidth < 768;
    const startX = e.clientX || e.touches?.[0]?.clientX || 0;
    const startY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    const rect = this.tooltipEl.getBoundingClientRect();
    this.dragOffset = {
      x: startX - (isMobile ? rect.left + rect.width / 2 : rect.left),
      y: startY - (isMobile ? rect.top : rect.top)
    };
    
    const moveHandler = (e) => {
      if (!this.isDragging) return;
      if (e.preventDefault) e.preventDefault();
      
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      
      if (isMobile) {
        // На мобильных: перемещение по горизонтали, вертикально фиксировано снизу
        const newX = clientX - this.dragOffset.x;
        const maxX = window.innerWidth - rect.width;
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        this.tooltipEl.style.left = `${constrainedX}px`;
        this.tooltipEl.style.transform = 'none';
        this.tooltipEl.style.bottom = '10px';
      } else {
        // На десктопе: свободное перемещение
        this.tooltipPos = {
          x: clientX - this.dragOffset.x,
          y: clientY - this.dragOffset.y
        };
        this.tooltipEl.style.left = `${this.tooltipPos.x}px`;
        this.tooltipEl.style.top = `${this.tooltipPos.y}px`;
        this.tooltipEl.style.transform = 'none';
      }
    };
    
    const endHandler = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
      document.removeEventListener('touchmove', moveHandler, { passive: false });
      document.removeEventListener('touchend', endHandler);
    };
    
    // Mouse события
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    
    // Touch события
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
  }
  
  adjustPosition() {
    if (!this.tooltipEl || this.isDragging) return;
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // На мобильных: центрировать горизонтально, позиция снизу
      this.tooltipEl.style.left = '50%';
      this.tooltipEl.style.transform = 'translateX(-50%)';
      this.tooltipEl.style.top = 'auto';
      this.tooltipEl.style.bottom = '10px';
    } else {
      // На десктопе: корректировать позицию относительно клика
      const rect = this.tooltipEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let newX = this.tooltipPos.x;
      let newY = this.tooltipPos.y;
      
      // Adjust horizontal position
      if (rect.right > viewportWidth - 20) {
        newX = viewportWidth - rect.width / 2 - 20;
      }
      if (rect.left < 20) {
        newX = rect.width / 2 + 20;
      }
      
      // Adjust vertical position
      if (rect.bottom > viewportHeight - 20) {
        newY = this.position.y - rect.height - 20;
      }
      if (rect.top < 20) {
        newY = 20;
      }
      
      this.tooltipPos = { x: newX, y: newY };
      this.tooltipEl.style.left = `${newX}px`;
      this.tooltipEl.style.top = `${newY}px`;
      this.tooltipEl.style.transform = 'translate(-50%, 10px)';
    }
  }
  
  close() {
    this.removeEventListeners();
    
    // Скрыть backdrop на мобильных
    if (this.backdropEl) {
      this.backdropEl.style.opacity = '0';
      setTimeout(() => {
        if (this.backdropEl && this.backdropEl.parentNode) {
          this.backdropEl.remove();
        }
      }, 200);
    }
    
    // Скрыть tooltip
    if (this.tooltipEl) {
      this.tooltipEl.style.opacity = '0';
      this.tooltipEl.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => {
        if (this.tooltipEl && this.tooltipEl.parentNode) {
          this.tooltipEl.remove();
        }
      }, 200);
    }
  }
}
