// js/components/Navigation.js - Компонент навигации между главами

import { BIBLE_BOOKS } from '../config.js';
import { getBookInfo } from '../bible-data.js';
import { updateUrl } from '../utils.js';

export class Navigation {
  constructor(container, currentBook, currentChapter, onNavigate) {
    this.container = container;
    this.currentBook = currentBook;
    this.currentChapter = currentChapter;
    this.onNavigate = onNavigate; // Callback для перехода к главе
    this.bookInfo = getBookInfo(currentBook);
    this._keyListenerAdded = false;
    
    this.render();
    this.attachEvents();
  }
  
  render() {
    const hasNext = this.currentChapter < this.bookInfo.totalChapters || this.currentBook < 66;
    const hasPrev = this.currentChapter > 1 || this.currentBook > 1;
    
    this.container.innerHTML = `
      <div class="inline-block bg-white/80 backdrop-blur-sm shadow-md border border-[#E5DED1] rounded-xl w-full max-w-full">
        <div class="px-2 sm:px-3 py-2">
          <!-- Single-line Navigation bar -->
          <div class="flex items-center justify-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto nav-mobile-compact">
            <!-- Home icon -->
            <a href="index.html" class="inline-flex items-center justify-center p-2 rounded-lg text-white bg-[#B35441] hover:bg-[#A04432] active:bg-[#8A3428] transition shadow-sm min-w-[44px] min-h-[44px] touch-manipulation" title="На главную" aria-label="На главную">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </a>

            <!-- Navigation controls -->
            <!-- First button - скрыт на мобильных -->
            <button
              id="nav-first-btn"
              ${this.currentBook === 1 && this.currentChapter === 1 ? 'disabled' : ''}
              class="hidden md:flex group items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation
                ${this.currentBook === 1 && this.currentChapter === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'bg-white hover:bg-[#8A9B69] active:bg-[#6d7d54] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69]'}"
              aria-label="К началу"
              title="К началу книги"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
              </svg>
            </button>
            <!-- Back button -->
            <button
              id="nav-prev-btn"
              ${!hasPrev ? 'disabled' : ''}
              class="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 min-w-[44px] min-h-[44px] touch-manipulation
                ${hasPrev 
                  ? 'bg-white hover:bg-[#8A9B69] active:bg-[#6d7d54] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69] transform hover:-translate-x-1' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}"
            >
              <svg class="w-4 h-4 transition-transform ${hasPrev ? 'group-hover:-translate-x-1' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="hidden sm:inline">Назад</span>
            </button>

            <!-- Navigation center -->
            <div class="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <div class="relative flex-1 min-w-0">
                <select 
                  id="book-select"
                  class="appearance-none w-full px-2 sm:px-3 py-2 sm:py-1.5 pr-6 sm:pr-8 bg-white border-2 border-[#8A9B69]/30 rounded-lg focus:outline-none focus:border-[#8A9B69] focus:ring-2 sm:focus:ring-4 focus:ring-[#8A9B69]/20 transition-all duration-300 font-medium text-[#2C1810] text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer touch-manipulation min-h-[44px]"
                >
                  ${BIBLE_BOOKS.map((book, idx) => `
                    <option value="${idx + 1}" ${idx + 1 === this.currentBook ? 'selected' : ''}>
                      ${book}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8A9B69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div class="relative flex-shrink-0">
                <select 
                  id="chapter-select"
                  class="appearance-none px-2 sm:px-3 py-2 sm:py-1.5 pr-6 sm:pr-8 bg-[#8A9B69] border-2 border-[#8A9B69] rounded-lg focus:outline-none focus:border-[#6d7d54] focus:ring-2 sm:focus:ring-4 focus:ring-[#8A9B69]/20 transition-all duration-300 font-semibold text-white text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer touch-manipulation min-w-[80px] sm:min-w-0 min-h-[44px]"
                >
                  ${Array.from({ length: this.bookInfo.totalChapters }, (_, i) => `
                    <option value="${i + 1}" ${i + 1 === this.currentChapter ? 'selected' : ''}>
                      ${i + 1}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Next button -->
            <button
              id="nav-next-btn"
              ${!hasNext ? 'disabled' : ''}
              class="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 min-w-[44px] min-h-[44px] touch-manipulation
                ${hasNext 
                  ? 'bg-white hover:bg-[#8A9B69] active:bg-[#6d7d54] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69] transform hover:translate-x-1' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}"
            >
              <svg class="w-4 h-4 transition-transform ${hasNext ? 'group-hover:translate-x-1' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="hidden sm:inline">Далее</span>
            </button>

            <!-- Last button - скрыт на мобильных -->
            <button
              id="nav-last-btn"
              ${(!hasNext && this.currentBook === 66) ? 'disabled' : ''}
              class="hidden md:flex group items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation
                ${(!hasNext && this.currentBook === 66) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'bg-white hover:bg-[#8A9B69] active:bg-[#6d7d54] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69]'}"
              aria-label="В конец"
              title="К концу книги"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M4 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Prev button
    const prevBtn = this.container.querySelector('#nav-prev-btn');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => this.handlePrev());
    }
    
    // Next button
    const nextBtn = this.container.querySelector('#nav-next-btn');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => this.handleNext());
    }
    
    // Book select
    const bookSelect = this.container.querySelector('#book-select');
    bookSelect.addEventListener('change', (e) => {
      const newBook = parseInt(e.target.value);
      this.goToChapter(newBook, 1);
    });
    
    // Chapter select
    const chapterSelect = this.container.querySelector('#chapter-select');
    chapterSelect.addEventListener('change', (e) => {
      const newChapter = parseInt(e.target.value);
      this.goToChapter(this.currentBook, newChapter);
    });

    // First button
    const firstBtn = this.container.querySelector('#nav-first-btn');
    if (firstBtn && !firstBtn.disabled) {
      firstBtn.addEventListener('click', () => this.goToChapter(this.currentBook, 1));
    }

    // Last button
    const lastBtn = this.container.querySelector('#nav-last-btn');
    if (lastBtn && !lastBtn.disabled) {
      lastBtn.addEventListener('click', () => this.goToChapter(this.currentBook, this.bookInfo.totalChapters));
    }

    // Verse jump
    const verseInput = this.container.querySelector('#verse-input');
    const verseGoBtn = this.container.querySelector('#verse-go-btn');
    const goToVerse = () => {
      const v = parseInt(verseInput?.value, 10);
      if (Number.isFinite(v) && v > 0) {
        window.location.hash = `#v${v}`;
      }
    };
    if (verseGoBtn) verseGoBtn.addEventListener('click', goToVerse);
    if (verseInput) verseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') goToVerse();
    });

    // Keyboard arrows (Left/Right)
    if (!this._keyListenerAdded) {
      this._keyHandler = (e) => {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
        if (e.key === 'ArrowRight') this.handleNext();
        if (e.key === 'ArrowLeft') this.handlePrev();
      };
      document.addEventListener('keydown', this._keyHandler);
      this._keyListenerAdded = true;
    }
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
  
  // Обновить состояние навигации
  update(book, chapter) {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.bookInfo = getBookInfo(book);
    this.render();
    this.attachEvents();
  }
}
