// js/components/Navigation.js - Компонент навигации между главами

import { BIBLE_BOOKS } from '../config.js';
import { getBookInfo } from '../../shared/bible-books-info.js';
import { updateUrl } from '../utils.js';

export class Navigation {
  constructor(container, currentBook, currentChapter, onNavigate) {
    this.container = container;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;
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
      <div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-[#8A9B69]/30 rounded-xl">
        <!-- Back button -->
        <button
          id="nav-prev-btn"
          ${!hasPrev ? 'disabled' : ''}
          class="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
            ${hasPrev
        ? 'text-gray-700 hover:bg-[#F5F1E8] hover:text-[#B35441]'
        : 'text-gray-300 cursor-not-allowed'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Book & Chapter selectors -->
        <div class="flex items-center gap-2">
          <div class="relative" id="book-selector">
            <button id="book-button" class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8A9B69] rounded-xl 
                     hover:border-[#B35441] transition-all duration-300 text-sm font-medium">
              <span class="text-[#2C1810]">${BIBLE_BOOKS[this.currentBook - 1]}</span>
              <svg class="w-4 h-4 text-[#8A9B69] transition-transform duration-300" id="book-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div id="book-dropdown" class="absolute left-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white border-2 border-[#8A9B69]/30 rounded-xl shadow-2xl z-50 hidden">
              <div class="p-2">
                ${BIBLE_BOOKS.map((book, idx) => `
                  <button data-book="${idx + 1}" class="w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group
                           ${idx + 1 === this.currentBook
            ? 'bg-[#8A9B69]/10 text-[#2C1810] font-semibold'
            : 'hover:bg-[#F5F1E8] text-gray-700'}">
                    <span class="font-medium">${book}</span>
                    ${idx + 1 === this.currentBook
            ? `<svg class="w-5 h-5 text-[#B35441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>`
            : ''}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <span class="text-gray-300">|</span>

          <div class="relative" id="chapter-selector">
            <button id="chapter-button" class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8A9B69] rounded-xl 
                     hover:border-[#B35441] transition-all duration-300 text-sm font-medium">
              <span class="text-[#B35441] font-semibold">Глава ${this.currentChapter}</span>
              <svg class="w-4 h-4 text-[#8A9B69] transition-transform duration-300" id="chapter-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div id="chapter-dropdown" class="absolute left-0 mt-2 w-40 max-h-80 overflow-y-auto bg-white border-2 border-[#8A9B69]/30 rounded-xl shadow-2xl z-50 hidden">
              <div class="p-2">
                ${Array.from({ length: this.bookInfo.totalChapters }, (_, i) => `
                  <button data-chapter="${i + 1}" class="w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group
                           ${i + 1 === this.currentChapter
                ? 'bg-[#8A9B69]/10 text-[#2C1810] font-semibold'
                : 'hover:bg-[#F5F1E8] text-gray-700'}">
                    <span class="font-medium">Глава ${i + 1}</span>
                    ${i + 1 === this.currentChapter
                ? `<svg class="w-5 h-5 text-[#B35441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>`
                : ''}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Next button -->
        <button
          id="nav-next-btn"
          ${!hasNext ? 'disabled' : ''}
          class="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
            ${hasNext
        ? 'text-gray-700 hover:bg-[#F5F1E8] hover:text-[#B35441]'
        : 'text-gray-300 cursor-not-allowed'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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

    // Book dropdown
    const bookButton = this.container.querySelector('#book-button');
    const bookDropdown = this.container.querySelector('#book-dropdown');
    const bookArrow = this.container.querySelector('#book-arrow');

    // Toggle dropdown
    bookButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = bookDropdown.classList.contains('hidden');
      bookDropdown.classList.toggle('hidden');
      bookArrow.style.transform = isHidden ? 'rotate(180deg)' : '';
    });

    // Select book from dropdown
    bookDropdown.querySelectorAll('[data-book]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newBook = parseInt(btn.dataset.book);
        bookDropdown.classList.add('hidden');
        bookArrow.style.transform = '';
        this.goToChapter(newBook, 1);
      });
    });

    // Close dropdown on outside click (both dropdowns)
    document.addEventListener('click', (e) => {
      if (!bookButton.contains(e.target) && !bookDropdown.contains(e.target)) {
        bookDropdown.classList.add('hidden');
        bookArrow.style.transform = '';
      }
      const chapterButton = this.container.querySelector('#chapter-button');
      const chapterDropdown = this.container.querySelector('#chapter-dropdown');
      const chapterArrow = this.container.querySelector('#chapter-arrow');
      if (chapterButton && chapterDropdown && !chapterButton.contains(e.target) && !chapterDropdown.contains(e.target)) {
        chapterDropdown.classList.add('hidden');
        if (chapterArrow) chapterArrow.style.transform = '';
      }
    });

    // Chapter dropdown
    const chapterButton = this.container.querySelector('#chapter-button');
    const chapterDropdown = this.container.querySelector('#chapter-dropdown');
    const chapterArrow = this.container.querySelector('#chapter-arrow');

    // Toggle chapter dropdown
    chapterButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = chapterDropdown.classList.contains('hidden');
      chapterDropdown.classList.toggle('hidden');
      chapterArrow.style.transform = isHidden ? 'rotate(180deg)' : '';
      // Close book dropdown if open
      bookDropdown.classList.add('hidden');
      bookArrow.style.transform = '';
    });

    // Select chapter from dropdown
    chapterDropdown.querySelectorAll('[data-chapter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newChapter = parseInt(btn.dataset.chapter);
        chapterDropdown.classList.add('hidden');
        chapterArrow.style.transform = '';
        this.goToChapter(this.currentBook, newChapter);
      });
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
    this.currentBook = Number(book) || 1;
    this.currentChapter = Number(chapter) || 1;
    this.bookInfo = getBookInfo(this.currentBook);
    this.render();
    this.attachEvents();
  }
}
