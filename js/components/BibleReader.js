// js/components/BibleReader.js - Компонент отображения стихов

import { escapeHtml, escapeAttr } from '../utils.js';

export class BibleReader {
  constructor(container, verses, book, chapter) {
    this.container = container;
    this.verses = verses;
    this.book = book;
    this.chapter = chapter;
    this.verseRefs = {};
    this.wordTooltip = null;
    this.onWordClick = null; // Callback для клика по слову
    
    this.render();
    this.setupScrollToVerse();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto px-3 sm:px-4">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-gray-200/50 p-4 sm:p-6 md:p-8 lg:p-12">
          <div class="space-y-4 sm:space-y-5 md:space-y-6" id="verses-container">
            ${this.verses.map(verse => this.renderVerse(verse)).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderVerse(verse) {
    const words = verse.text.split(' ');
    
    return `
      <div 
        class="group transition-all duration-500 md:hover:translate-x-1" 
        id="v${verse.verse}" 
        data-verse="${verse.verse}"
      >
        <div class="flex gap-2 sm:gap-3 md:gap-4 items-start">
          <!-- Verse number -->
          <div class="flex-shrink-0">
            <span class="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xs sm:text-sm font-bold rounded-lg border border-blue-200/50 select-none md:group-hover:from-blue-200 md:group-hover:to-indigo-200 transition-all duration-300 shadow-sm">
              ${verse.verse}
            </span>
          </div>
          
          <!-- Verse text -->
          <div class="flex-1 pt-0.5 sm:pt-1">
            <p class="text-gray-800 leading-relaxed sm:leading-relaxed md:leading-relaxed text-base sm:text-lg md:text-lg verse-text" data-verse-pk="${verse.pk}" style="line-height: 1.7;">
              ${words.map((word, idx) => `<span class="word md:hover:bg-gradient-to-r md:hover:from-blue-100 md:hover:to-indigo-100 md:hover:text-blue-900 active:bg-gradient-to-r active:from-blue-100 active:to-indigo-100 active:text-blue-900 cursor-pointer px-1 py-0.5 sm:py-1 -mx-1 transition-all duration-200 rounded-md md:hover:shadow-sm inline touch-manipulation" data-word="${escapeAttr(word)}" data-verse-text="${escapeAttr(verse.text)}" data-verse-ref="${escapeAttr(this.book + ':' + this.chapter + ':' + verse.verse)}">${escapeHtml(word)}</span>`).join(' ')}
            </p>
            
            <!-- Comment -->
            ${verse.comment ? `
              <div class="mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 border-amber-300 bg-amber-50/50 rounded-r-lg p-2 sm:p-3">
                <div class="flex items-start gap-2">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span class="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                    ${escapeHtml(verse.comment)}
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Клик по слову (поддержка mouse и touch)
    this.container.querySelectorAll('.word').forEach(wordEl => {
      // Mouse событие
      wordEl.addEventListener('click', (e) => this.handleWordClick(e));
      
      // Touch событие для лучшего отклика на мобильных
      wordEl.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleWordClick(e);
      }, { passive: false });
    });
    
    // Сохранить ссылки на стихи для навигации
    this.container.querySelectorAll('[data-verse]').forEach(verseEl => {
      const verseNum = parseInt(verseEl.dataset.verse);
      this.verseRefs[verseNum] = verseEl;
    });
  }
  
  handleWordClick(event) {
    const wordEl = event.target;
    const rawWord = wordEl.dataset.word;
    const verseText = wordEl.dataset.verseText;
    const verseRef = wordEl.dataset.verseRef;
    
    // Удалить знаки препинания
    const cleanWord = rawWord.replace(/[.,!?;:«»"']/g, '');
    
    if (cleanWord.length === 0) return;
    
    // Определить позицию (для touch событий используем center элемента)
    let position;
    if (event.touches && event.touches.length > 0) {
      // Touch событие
      const touch = event.touches[0] || event.changedTouches?.[0];
      position = {
        x: touch.clientX,
        y: touch.clientY
      };
    } else {
      // Mouse событие
      position = {
        x: event.clientX || wordEl.getBoundingClientRect().left + wordEl.offsetWidth / 2,
        y: event.clientY || wordEl.getBoundingClientRect().top
      };
    }
    
    // Вызвать callback если установлен
    if (this.onWordClick) {
      this.onWordClick(cleanWord, verseRef, verseText, position);
    }
  }
  
  setupScrollToVerse() {
    const hash = window.location.hash;
    if (hash.startsWith('#v')) {
      const verseNum = parseInt(hash.slice(2));
      const element = this.verseRefs[verseNum];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('verse-highlight');
          setTimeout(() => element.classList.remove('verse-highlight'), 2000);
        }, 100);
      }
    }
  }
  
  // Обновить стихи
  updateVerses(verses, book, chapter) {
    this.verses = verses;
    this.book = book;
    this.chapter = chapter;
    this.render();
    this.setupScrollToVerse();
  }
  
  // Прокрутить к стиху
  scrollToVerse(verseNum) {
    const element = this.verseRefs[verseNum];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('verse-highlight');
      setTimeout(() => element.classList.remove('verse-highlight'), 2000);
    }
  }
}
