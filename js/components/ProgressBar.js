// js/components/ProgressBar.js - Reading progress bar

import { getBookInfo } from '../../shared/bible-books-info.js';

export class ProgressBar {
  constructor(container, currentBook, currentChapter) {
    this.container = container;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;
    this.scrollProgress = 0;

    this.render();
    this.attachScrollListener();
  }

  render() {
    const bookInfo = getBookInfo(this.currentBook);
    const chapterProgress = ((this.currentChapter / bookInfo.totalChapters) * 100).toFixed(0);

    this.container.innerHTML = `
      <div class="progress-bar-wrapper sticky top-16 lg:top-20 z-40 bg-white border-b border-light-gray shadow-minimal">
        <div class="container mx-auto px-6 py-3">
          <div class="flex items-center gap-4">
            <!-- Chapter Progress -->
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-text-secondary">
                  Глава ${this.currentChapter} из ${bookInfo.totalChapters}
                </span>
                <span class="text-xs font-semibold text-accent-warm">
                  ${chapterProgress}%
                </span>
              </div>
              <div class="relative w-full h-2 bg-warm-white rounded-full overflow-hidden">
                <div
                  id="chapter-progress-fill"
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-warm to-accent-warm-hover rounded-full transition-all duration-300"
                  style="width: ${chapterProgress}%"
                ></div>
              </div>
            </div>

            <!-- Scroll Progress (в рамках текущей главы) -->
            <div class="hidden md:block w-32">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-text-secondary">Чтение</span>
                <span class="text-xs font-semibold text-text-primary" id="scroll-progress-text">0%</span>
              </div>
              <div class="relative w-full h-2 bg-warm-white rounded-full overflow-hidden">
                <div
                  id="scroll-progress-fill"
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-text-secondary to-text-primary rounded-full transition-all duration-150"
                  style="width: 0%"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachScrollListener() {
    // Обновлять scroll progress при скролле
    let ticking = false;

    const updateScrollProgress = () => {
      const readerContainer = document.getElementById('bible-reader-container');
      if (!readerContainer) return;

      const rect = readerContainer.getBoundingClientRect();
      const containerHeight = readerContainer.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;

      // Рассчитываем прогресс скролла внутри главы
      const scrollProgress = Math.min(100, Math.max(0, (scrolled / containerHeight) * 100));

      this.scrollProgress = scrollProgress;

      const scrollFill = document.getElementById('scroll-progress-fill');
      const scrollText = document.getElementById('scroll-progress-text');

      if (scrollFill) {
        scrollFill.style.width = `${scrollProgress.toFixed(0)}%`;
      }
      if (scrollText) {
        scrollText.textContent = `${scrollProgress.toFixed(0)}%`;
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress();
        });
        ticking = true;
      }
    });

    // Первоначальное обновление
    setTimeout(updateScrollProgress, 500);
  }

  update(book, chapter) {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.scrollProgress = 0;
    this.render();
    this.attachScrollListener();
  }

  destroy() {
    // Удалить слушатели событий если нужно
    window.removeEventListener('scroll', this.attachScrollListener);
  }
}
