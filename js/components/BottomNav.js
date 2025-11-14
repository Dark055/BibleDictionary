// js/components/BottomNav.js - Mobile bottom navigation

import { getBookInfo } from '../../shared/bible-books-info.js';

export class BottomNav {
  constructor(container, currentBook, currentChapter, onNavigate) {
    this.container = container;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;
    this.onNavigate = onNavigate;

    this.render();
    this.attachEvents();
  }

  render() {
    const bookInfo = getBookInfo(this.currentBook);
    const hasNext = this.currentChapter < bookInfo.totalChapters || this.currentBook < 66;
    const hasPrev = this.currentChapter > 1 || this.currentBook > 1;

    this.container.innerHTML = `
      <div class="bottom-nav lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-light-gray shadow-minimal-lg z-50">
        <div class="grid grid-cols-4 gap-1 p-2">
          <!-- Previous Chapter -->
          <button
            id="bottom-nav-prev"
            ${!hasPrev ? 'disabled' : ''}
            class="flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all touch-manipulation min-h-[60px]
              ${!hasPrev
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:bg-warm-white hover:text-accent-warm active:bg-accent-warm active:text-white'}"
            aria-label="Предыдущая глава"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="text-xs font-medium">Назад</span>
          </button>

          <!-- Chapters List -->
          <button
            id="bottom-nav-chapters"
            class="flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all touch-manipulation min-h-[60px] text-text-secondary hover:bg-warm-white hover:text-accent-warm active:bg-accent-warm active:text-white"
            aria-label="Список глав"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span class="text-xs font-medium">Главы</span>
          </button>

          <!-- Books List -->
          <button
            id="bottom-nav-books"
            class="flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all touch-manipulation min-h-[60px] text-text-secondary hover:bg-warm-white hover:text-accent-warm active:bg-accent-warm active:text-white"
            aria-label="Список книг"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="text-xs font-medium">Книги</span>
          </button>

          <!-- Next Chapter -->
          <button
            id="bottom-nav-next"
            ${!hasNext ? 'disabled' : ''}
            class="flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all touch-manipulation min-h-[60px]
              ${!hasNext
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:bg-warm-white hover:text-accent-warm active:bg-accent-warm active:text-white'}"
            aria-label="Следующая глава"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-xs font-medium">Вперед</span>
          </button>
        </div>
      </div>

      <!-- Spacer для контента, чтобы не перекрывался bottom nav -->
      <div class="lg:hidden h-20"></div>
    `;
  }

  attachEvents() {
    const bookInfo = getBookInfo(this.currentBook);

    // Previous button
    const prevBtn = this.container.querySelector('#bottom-nav-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        if (this.currentChapter > 1) {
          this.onNavigate(this.currentBook, this.currentChapter - 1);
        } else if (this.currentBook > 1) {
          const prevBookInfo = getBookInfo(this.currentBook - 1);
          this.onNavigate(this.currentBook - 1, prevBookInfo.totalChapters);
        }
      });
    }

    // Next button
    const nextBtn = this.container.querySelector('#bottom-nav-next');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => {
        if (this.currentChapter < bookInfo.totalChapters) {
          this.onNavigate(this.currentBook, this.currentChapter + 1);
        } else if (this.currentBook < 66) {
          this.onNavigate(this.currentBook + 1, 1);
        }
      });
    }

    // Chapters button - открывает мобильную навигацию
    const chaptersBtn = this.container.querySelector('#bottom-nav-chapters');
    if (chaptersBtn) {
      chaptersBtn.addEventListener('click', () => {
        // Trigger mobile navigation
        const mobileNavBtn = document.getElementById('mobile-nav-button');
        if (mobileNavBtn) {
          mobileNavBtn.click();
        }
      });
    }

    // Books button - открывает мобильную навигацию
    const booksBtn = this.container.querySelector('#bottom-nav-books');
    if (booksBtn) {
      booksBtn.addEventListener('click', () => {
        // Trigger mobile navigation
        const mobileNavBtn = document.getElementById('mobile-nav-button');
        if (mobileNavBtn) {
          mobileNavBtn.click();
        }
      });
    }
  }

  update(book, chapter) {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.render();
    this.attachEvents();
  }
}
