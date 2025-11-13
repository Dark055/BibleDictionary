// js/components/MobileNavigation.js - Мобильная навигация в виде модального окна

import { BIBLE_BOOKS } from '../config.js';
import { getBookInfo } from '../../shared/bible-books-info.js';
import { updateUrl } from '../utils.js';

export class MobileNavigation {
  constructor(button, currentBook, currentChapter, onNavigate) {
    this.button = button;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;
    this.onNavigate = onNavigate;
    this.bookInfo = getBookInfo(currentBook);
    this.isOpen = false;
    this.modalEl = null;
    this.overlayEl = null;
    
    this.init();
  }
  
  init() {
    this.createModal();
    this.attachEvents();
  }
  
  createModal() {
    // Overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'fixed inset-0 bg-black/60 z-[100] md:hidden backdrop-blur-sm';
    this.overlayEl.style.opacity = '0';
    this.overlayEl.style.pointerEvents = 'none';
    this.overlayEl.style.transition = 'opacity 0.3s ease-in-out';
    
    // Modal
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'fixed inset-x-4 top-20 md:hidden z-[101] transition-transform duration-300 ease-out';
    this.modalEl.style.transform = 'translateY(-120%)';
    
    this.render();
    
    // Добавить в body
    document.body.appendChild(this.overlayEl);
    document.body.appendChild(this.modalEl);
    
    // Закрытие по клику на overlay
    this.overlayEl.addEventListener('click', () => this.close());
    
    // Предотвратить закрытие при клике внутри модала
    this.modalEl.addEventListener('click', (e) => e.stopPropagation());
  }
  
  render() {
    const hasNext = this.currentChapter < this.bookInfo.totalChapters || this.currentBook < 66;
    const hasPrev = this.currentChapter > 1 || this.currentBook > 1;
    
    this.modalEl.innerHTML = `
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#8A9B69]/30 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#4A3041] to-[#B35441] px-5 py-4 flex items-center justify-between">
          <h3 class="text-white font-serif font-bold text-xl flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Навигация
          </h3>
          <button id="mobile-nav-close" class="text-white hover:text-amber-200 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" aria-label="Закрыть">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="p-5 space-y-5">
          <!-- Quick Actions -->
          <div class="flex gap-2">
            <a href="index.html" class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-[#B35441] hover:bg-[#A04432] active:bg-[#8A3428] transition shadow-lg min-h-[44px] touch-manipulation font-medium">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Главная
            </a>
            <button
              id="mobile-nav-first"
              ${this.currentBook === 1 && this.currentChapter === 1 ? 'disabled' : ''}
              class="px-4 py-3 rounded-xl min-h-[44px] touch-manipulation font-medium transition shadow-lg ${
                this.currentBook === 1 && this.currentChapter === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#2C1810] border-2 border-[#8A9B69] hover:bg-[#8A9B69] hover:text-white active:bg-[#6d7d54]'
              }"
              title="К началу книги"
            >
              <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <!-- Book Selection -->
          <div>
            <label class="block text-sm font-semibold text-[#4A3041] mb-2">📚 Книга</label>
            <div class="relative">
              <select 
                id="mobile-book-select"
                class="appearance-none w-full px-4 py-3 pr-10 bg-white border-2 border-[#8A9B69]/50 rounded-xl focus:outline-none focus:border-[#8A9B69] focus:ring-4 focus:ring-[#8A9B69]/20 transition-all font-medium text-[#2C1810] shadow-sm cursor-pointer touch-manipulation min-h-[44px]"
              >
                ${BIBLE_BOOKS.map((book, idx) => `
                  <option value="${idx + 1}" ${idx + 1 === this.currentBook ? 'selected' : ''}>
                    ${book}
                  </option>
                `).join('')}
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-[#8A9B69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Chapter Selection -->
          <div>
            <label class="block text-sm font-semibold text-[#4A3041] mb-2">📖 Глава</label>
            <div class="relative">
              <select 
                id="mobile-chapter-select"
                class="appearance-none w-full px-4 py-3 pr-10 bg-[#8A9B69] border-2 border-[#8A9B69] rounded-xl focus:outline-none focus:border-[#6d7d54] focus:ring-4 focus:ring-[#8A9B69]/30 transition-all font-bold text-white shadow-lg cursor-pointer touch-manipulation min-h-[44px]"
              >
                ${Array.from({ length: this.bookInfo.totalChapters }, (_, i) => `
                  <option value="${i + 1}" ${i + 1 === this.currentChapter ? 'selected' : ''}>
                    Глава ${i + 1}
                  </option>
                `).join('')}
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              id="mobile-nav-prev"
              ${!hasPrev ? 'disabled' : ''}
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold min-h-[44px] touch-manipulation transition shadow-lg ${
                hasPrev
                  ? 'bg-white text-[#2C1810] border-2 border-[#8A9B69] hover:bg-[#8A9B69] hover:text-white active:bg-[#6d7d54]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
              }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <button
              id="mobile-nav-next"
              ${!hasNext ? 'disabled' : ''}
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold min-h-[44px] touch-manipulation transition shadow-lg ${
                hasNext
                  ? 'bg-[#8A9B69] text-white border-2 border-[#8A9B69] hover:bg-[#6d7d54] active:bg-[#5a6444]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
              }"
            >
              Далее
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.attachModalEvents();
  }
  
  attachModalEvents() {
    // Close button
    const closeBtn = this.modalEl.querySelector('#mobile-nav-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // First button
    const firstBtn = this.modalEl.querySelector('#mobile-nav-first');
    if (firstBtn && !firstBtn.disabled) {
      firstBtn.addEventListener('click', () => {
        this.goToChapter(this.currentBook, 1);
        this.close();
      });
    }
    
    // Prev button
    const prevBtn = this.modalEl.querySelector('#mobile-nav-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        this.handlePrev();
        this.close();
      });
    }
    
    // Next button
    const nextBtn = this.modalEl.querySelector('#mobile-nav-next');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => {
        this.handleNext();
        this.close();
      });
    }
    
    // Book select
    const bookSelect = this.modalEl.querySelector('#mobile-book-select');
    if (bookSelect) {
      bookSelect.addEventListener('change', (e) => {
        const newBook = parseInt(e.target.value);
        this.goToChapter(newBook, 1);
        this.close();
      });
    }
    
    // Chapter select
    const chapterSelect = this.modalEl.querySelector('#mobile-chapter-select');
    if (chapterSelect) {
      chapterSelect.addEventListener('change', (e) => {
        const newChapter = parseInt(e.target.value);
        this.goToChapter(this.currentBook, newChapter);
        this.close();
      });
    }
  }
  
  attachEvents() {
    if (this.button) {
      this.button.addEventListener('click', () => {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      });
    }
    
    // Закрытие при изменении размера окна (если стал больше md)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && this.isOpen) {
        this.close();
      }
    });
    
    // Закрытие при нажатии Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  handleNext() {
    if (this.currentChapter < this.bookInfo.totalChapters) {
      this.goToChapter(this.currentBook, this.currentChapter + 1);
    } else if (this.currentBook < 66) {
      this.goToChapter(this.currentBook + 1, 1);
    }
  }
  
  handlePrev() {
    if (this.currentChapter > 1) {
      this.goToChapter(this.currentBook, this.currentChapter - 1);
    } else if (this.currentBook > 1) {
      const prevBookInfo = getBookInfo(this.currentBook - 1);
      this.goToChapter(this.currentBook - 1, prevBookInfo.totalChapters);
    }
  }
  
  goToChapter(book, chapter) {
    updateUrl(book, chapter);
    if (this.onNavigate) {
      this.onNavigate(book, chapter);
    }
  }
  
  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Показать overlay
    this.overlayEl.style.pointerEvents = 'auto';
    requestAnimationFrame(() => {
      this.overlayEl.style.opacity = '1';
    });
    
    // Показать модал
    requestAnimationFrame(() => {
      this.modalEl.style.transform = 'translateY(0)';
    });
  }
  
  close() {
    this.isOpen = false;
    document.body.style.overflow = '';
    
    // Скрыть overlay
    this.overlayEl.style.opacity = '0';
    setTimeout(() => {
      this.overlayEl.style.pointerEvents = 'none';
    }, 300);
    
    // Скрыть модал
    this.modalEl.style.transform = 'translateY(-120%)';
  }
  
  update(book, chapter) {
    this.currentBook = Number(book) || 1;
    this.currentChapter = Number(chapter) || 1;
    this.bookInfo = getBookInfo(this.currentBook);
    this.render();
  }
  
  destroy() {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.remove();
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.remove();
    }
    document.body.style.overflow = '';
  }
}
