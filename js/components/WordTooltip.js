// js/components/WordTooltip.js - Тултип для определения слова (упрощенная версия без графиков)

import { getWordDefinition } from '../api-client.js';
import { analyzeWordFrequency } from '../bible-data.js';
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
    
    this.create();
    this.fetchData();
  }
  
  create() {
    // Создать контейнер тултипа с простой анимацией
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'fixed z-[9999]';
    this.tooltipEl.style.left = `${this.tooltipPos.x}px`;
    this.tooltipEl.style.top = `${this.tooltipPos.y}px`;
    this.tooltipEl.style.transform = 'translate(-50%, 10px)';
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
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-[430px] border border-gray-200">
        <div class="flex items-center justify-center gap-3">
          <div class="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-600 text-base">Загрузка...</span>
        </div>
      </div>
    `;
  }
  
  renderError() {
    return `
      <div class="bg-gradient-to-br from-white via-red-50 to-orange-50 backdrop-blur-xl border-2 border-red-300 rounded-3xl shadow-2xl p-8 w-96">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-red-700 font-bold text-lg mb-2">Ошибка</p>
            <p class="text-gray-700 text-sm leading-relaxed">${this.error}</p>
          </div>
        </div>
        <button class="mt-6 w-full px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]" id="close-tooltip">
          Закрыть
        </button>
      </div>
    `;
  }
  
  renderContent() {
    const explanation = this.getExplanationForLevel();
    
    return `
      <div class="bg-white rounded-2xl shadow-2xl w-[430px] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        <!-- Header (draggable) -->
        <div id="tooltip-header" class="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-move flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">
            ${escapeHtml(this.word)}
          </h3>
          <button id="close-tooltip" class="text-white hover:text-gray-200 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Tab Selector -->
        <div class="flex gap-2 px-5 pt-4 bg-white">
          <button class="complexity-btn px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${this.complexityLevel === 'basic' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}" data-level="basic">
            Простой
          </button>
          <button class="complexity-btn px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${this.complexityLevel === 'intermediate' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}" data-level="intermediate">
            Подробный
          </button>
        </div>
        
        <!-- Content -->
        <div class="overflow-y-auto custom-scrollbar flex-1">
          <div class="p-5 space-y-4">
            <!-- Main definition -->
            <p class="text-gray-800 leading-relaxed text-sm">${escapeHtml(explanation)}</p>
            
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
        <div class="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">📜</span>
            <h4 class="text-base font-bold text-amber-900">Original Language</h4>
          </div>
          <div class="space-y-2">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-xl font-bold text-gray-900">${escapeHtml(this.definition.greek_hebrew.word)}</span>
              <span class="text-sm text-gray-600">(${escapeHtml(this.definition.greek_hebrew.transliteration || '')})</span>
              ${this.definition.greek_hebrew.strongs_number ? `
                <span class="text-sm font-semibold text-orange-700">Strong's ${escapeHtml(this.definition.greek_hebrew.strongs_number)}</span>
              ` : ''}
            </div>
            ${this.definition.greek_hebrew.root ? `
              <div class="text-sm text-gray-700">
                <span class="font-semibold italic">Root:</span> <span class="italic">${escapeHtml(this.definition.greek_hebrew.root)}${this.definition.greek_hebrew.literal_meaning ? ` (meaning "${escapeHtml(this.definition.greek_hebrew.literal_meaning)}")` : ''}</span>
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
        <div class="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">📜</span>
            <h4 class="text-base font-bold text-amber-900">Original language</h4>
          </div>
          <div class="space-y-2">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-xl font-bold text-gray-900">${escapeHtml(this.definition.greek_hebrew.word)}</span>
              <span class="text-sm text-gray-600">(${escapeHtml(this.definition.greek_hebrew.transliteration || '')})</span>
              ${this.definition.greek_hebrew.strongs_number ? `
                <span class="text-sm font-semibold text-orange-700">Strong's ${escapeHtml(this.definition.greek_hebrew.strongs_number)}</span>
              ` : ''}
            </div>
            ${this.definition.greek_hebrew.root ? `
              <div class="text-sm text-gray-700">
                <span class="font-semibold italic">Root:</span> <span class="italic">${escapeHtml(this.definition.greek_hebrew.root)}${this.definition.greek_hebrew.literal_meaning ? ` (meaning "${escapeHtml(this.definition.greek_hebrew.literal_meaning)}")` : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      <!-- Morphology -->
      ${this.definition.morphology ? `
        <div class="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🔤</span>
            <h4 class="text-base font-bold text-purple-900">Morphology</h4>
          </div>
          <div class="text-sm text-gray-700 space-y-1">
            ${this.definition.morphology.part_of_speech ? `
              <div><span class="font-semibold">part_of_speech:</span> ${escapeHtml(this.definition.morphology.part_of_speech)}</div>
            ` : ''}
            ${this.definition.morphology.case ? `
              <div><span class="font-semibold">case:</span> ${escapeHtml(this.definition.morphology.case)}</div>
            ` : ''}
            ${this.definition.morphology.number ? `
              <div><span class="font-semibold">number:</span> ${escapeHtml(this.definition.morphology.number)}</div>
            ` : ''}
            ${this.definition.morphology.gender ? `
              <div><span class="font-semibold">gender:</span> ${escapeHtml(this.definition.morphology.gender)}</div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      <!-- Semantic field -->
      ${this.definition.semantic_field && this.definition.semantic_field.length > 0 ? `
        <div class="bg-teal-50 rounded-xl p-4 border border-teal-200">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🌐</span>
            <h4 class="text-base font-bold text-teal-900">Semantic Field</h4>
          </div>
          <div class="flex flex-wrap gap-2">
            ${this.definition.semantic_field.map(field => `
              <span class="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full border border-teal-300">
                ${escapeHtml(field)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }
  
  getExplanationForLevel() {
    if (this.definition.explanations) {
      return this.definition.explanations[this.complexityLevel] || this.definition.basic_meaning;
    }
    
    // Fallback
    if (this.complexityLevel === 'basic') {
      return this.definition.basic_meaning;
    } else {
      return this.definition.context_meaning || this.definition.basic_meaning;
    }
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
    // Удалить старые обработчики перед добавлением новых
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    if (this.outsideClickHandler) {
      document.removeEventListener('mousedown', this.outsideClickHandler);
    }
    
    // Close button
    const closeBtn = this.tooltipEl.querySelector('#close-tooltip');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.close();
      };
    }
    
    // Complexity level buttons
    const complexityBtns = this.tooltipEl.querySelectorAll('.complexity-btn');
    complexityBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.complexityLevel = btn.dataset.level;
        this.render();
        this.attachEvents();
      };
    });
    
    // Dragging
    const header = this.tooltipEl.querySelector('#tooltip-header');
    if (header) {
      header.onmousedown = (e) => {
        // Не начинать перетаскивание, если клик на кнопке закрытия
        if (e.target.closest('#close-tooltip')) {
          return;
        }
        this.startDrag(e);
      };
    }
    
    // Close on Escape
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
    
    // Click outside to close
    this.outsideClickHandler = (e) => {
      if (!this.tooltipEl.contains(e.target)) {
        this.close();
      }
    };
    setTimeout(() => {
      document.addEventListener('mousedown', this.outsideClickHandler);
    }, 100);
  }
  
  startDrag(e) {
    this.isDragging = true;
    this.dragOffset = {
      x: e.clientX - this.tooltipPos.x,
      y: e.clientY - this.tooltipPos.y
    };
    
    const mouseMoveHandler = (e) => {
      if (this.isDragging) {
        this.tooltipPos = {
          x: e.clientX - this.dragOffset.x,
          y: e.clientY - this.dragOffset.y
        };
        this.tooltipEl.style.left = `${this.tooltipPos.x}px`;
        this.tooltipEl.style.top = `${this.tooltipPos.y}px`;
      }
    };
    
    const mouseUpHandler = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }
  
  adjustPosition() {
    if (!this.tooltipEl || this.isDragging) return;
    
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
  }
  
  close() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    if (this.outsideClickHandler) {
      document.removeEventListener('mousedown', this.outsideClickHandler);
    }
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
