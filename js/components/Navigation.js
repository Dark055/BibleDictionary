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
    
    this.render();
    this.attachEvents();
  }
  
  render() {
    const hasNext = this.currentChapter < this.bookInfo.totalChapters || this.currentBook < 66;
    const hasPrev = this.currentChapter > 1 || this.currentBook > 1;
    
    this.container.innerHTML = `
      <div class="bg-[#F5F1E8]/95 backdrop-blur-sm shadow-md border-b border-[#8A9B69]/20">
        <div class="px-4 py-4">
          <!-- Search bar -->
          <div class="flex items-center justify-center gap-4 mb-4 flex-wrap">
            <a 
              href="index.html" 
              class="inline-flex items-center gap-2 px-4 py-2 bg-[#B35441] text-white hover:bg-[#A04432] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              На главную
            </a>
            <div id="nav-search-container"></div>
          </div>

          <!-- Navigation controls -->
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <!-- Back button -->
            <button
              id="nav-prev-btn"
              ${!hasPrev ? 'disabled' : ''}
              class="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 
                ${hasPrev 
                  ? 'bg-white hover:bg-[#8A9B69] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69] transform hover:-translate-x-1' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}"
            >
              <svg class="w-4 h-4 transition-transform ${hasPrev ? 'group-hover:-translate-x-1' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>

            <!-- Navigation center -->
            <div class="flex items-center gap-3">
              <div class="relative">
                <select 
                  id="book-select"
                  class="appearance-none px-4 py-2.5 pr-10 bg-white border-2 border-[#8A9B69]/30 rounded-xl focus:outline-none focus:border-[#8A9B69] focus:ring-4 focus:ring-[#8A9B69]/20 transition-all duration-300 font-medium text-[#2C1810] shadow-sm hover:shadow-md cursor-pointer"
                >
                  ${BIBLE_BOOKS.map((book, idx) => `
                    <option value="${idx + 1}" ${idx + 1 === this.currentBook ? 'selected' : ''}>
                      ${book}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-[#8A9B69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div class="relative">
                <select 
                  id="chapter-select"
                  class="appearance-none px-4 py-2.5 pr-10 bg-[#8A9B69] border-2 border-[#8A9B69] rounded-xl focus:outline-none focus:border-[#6d7d54] focus:ring-4 focus:ring-[#8A9B69]/20 transition-all duration-300 font-semibold text-white shadow-sm hover:shadow-md cursor-pointer"
                >
                  ${Array.from({ length: this.bookInfo.totalChapters }, (_, i) => `
                    <option value="${i + 1}" ${i + 1 === this.currentChapter ? 'selected' : ''}>
                      Глава ${i + 1}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Next button -->
            <button
              id="nav-next-btn"
              ${!hasNext ? 'disabled' : ''}
              class="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 
                ${hasNext 
                  ? 'bg-white hover:bg-[#8A9B69] text-[#2C1810] hover:text-white shadow-md hover:shadow-lg border border-[#8A9B69]/30 hover:border-[#8A9B69] transform hover:translate-x-1' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}"
            >
              Далее
              <svg class="w-4 h-4 transition-transform ${hasNext ? 'group-hover:translate-x-1' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
