// js/components/Sidebar.js - Desktop sidebar навигация

import { BIBLE_BOOKS } from '../config.js';
import { BIBLE_STRUCTURE } from '../config.js';
import { getBookInfo } from '../../shared/bible-books-info.js';

export class Sidebar {
  constructor(container, currentBook, currentChapter, onNavigate) {
    this.container = container;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;
    this.onNavigate = onNavigate;
    this.isCollapsed = false;
    this.expandedSections = new Set(['books']); // По умолчанию книги открыты

    this.render();
    this.attachEvents();
  }

  render() {
    const bookInfo = getBookInfo(this.currentBook);
    const currentBookName = BIBLE_BOOKS[this.currentBook - 1];

    this.container.innerHTML = `
      <aside class="sidebar-desktop ${this.isCollapsed ? 'collapsed' : ''} hidden lg:block sticky top-20 h-[calc(100vh-5rem)] bg-white border-r border-light-gray overflow-hidden transition-all duration-300">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between p-4 border-b border-light-gray">
          <h3 class="text-lg font-serif font-semibold text-text-primary ${this.isCollapsed ? 'hidden' : ''}">Навигация</h3>
          <button id="sidebar-toggle" class="p-2 hover:bg-warm-white rounded-lg transition-colors" aria-label="Свернуть/развернуть">
            <svg class="w-5 h-5 text-text-secondary transition-transform ${this.isCollapsed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-content overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar ${this.isCollapsed ? 'hidden' : ''}">
          <!-- Текущая книга и главы -->
          <div class="p-4 border-b border-light-gray bg-warm-white">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-text-secondary uppercase tracking-wide">Текущая книга</h4>
            </div>
            <div class="mb-4">
              <p class="text-lg font-serif font-semibold text-text-primary mb-1">${currentBookName}</p>
              <p class="text-sm text-text-secondary">${bookInfo.totalChapters} ${this.getChaptersWord(bookInfo.totalChapters)}</p>
            </div>

            <!-- Главы -->
            <div class="grid grid-cols-5 gap-2">
              ${this.renderChapters(bookInfo.totalChapters)}
            </div>
          </div>

          <!-- Список всех книг -->
          <div class="p-4">
            <button
              id="books-section-toggle"
              class="flex items-center justify-between w-full mb-3 text-sm font-medium text-text-secondary uppercase tracking-wide hover:text-text-primary transition-colors"
            >
              <span>Все книги</span>
              <svg class="w-4 h-4 transition-transform ${this.expandedSections.has('books') ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div id="books-list" class="${this.expandedSections.has('books') ? '' : 'hidden'} space-y-4">
              ${this.renderBooksList()}
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  renderChapters(totalChapters) {
    let html = '';
    for (let i = 1; i <= totalChapters; i++) {
      const isActive = i === this.currentChapter;
      html += `
        <button
          data-chapter="${i}"
          class="chapter-btn aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
            ${isActive
              ? 'bg-accent-warm text-white shadow-minimal'
              : 'bg-warm-white text-text-primary hover:bg-accent-warm hover:text-white'}"
        >
          ${i}
        </button>
      `;
    }
    return html;
  }

  renderBooksList() {
    const sections = BIBLE_STRUCTURE.SECTIONS;

    return sections.map(section => {
      const sectionBooks = BIBLE_BOOKS.slice(section.start - 1, section.end);
      const sectionId = section.name.toLowerCase().replace(/\s+/g, '-');
      const isExpanded = this.expandedSections.has(sectionId);

      return `
        <div class="section-group">
          <button
            data-section="${sectionId}"
            class="section-toggle flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-warm-white transition-colors group"
          >
            <span class="text-sm font-serif font-semibold text-text-primary">${section.name}</span>
            <svg class="w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div class="section-books ${isExpanded ? '' : 'hidden'} mt-2 space-y-1 ml-2">
            ${sectionBooks.map((book, idx) => {
              const bookNum = section.start + idx;
              const isActive = bookNum === this.currentBook;

              return `
                <button
                  data-book="${bookNum}"
                  class="book-btn w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                    ${isActive
                      ? 'bg-accent-warm text-white font-medium'
                      : 'text-text-primary hover:bg-warm-white'}"
                >
                  ${book}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  attachEvents() {
    // Toggle sidebar
    const toggleBtn = this.container.querySelector('#sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isCollapsed = !this.isCollapsed;
        this.render();
        this.attachEvents();

        // Уведомить об изменении ширины
        window.dispatchEvent(new Event('sidebar-toggle'));
      });
    }

    // Toggle books section
    const booksSectionToggle = this.container.querySelector('#books-section-toggle');
    if (booksSectionToggle) {
      booksSectionToggle.addEventListener('click', () => {
        if (this.expandedSections.has('books')) {
          this.expandedSections.delete('books');
        } else {
          this.expandedSections.add('books');
        }
        this.render();
        this.attachEvents();
      });
    }

    // Toggle sections
    const sectionToggles = this.container.querySelectorAll('.section-toggle');
    sectionToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const sectionId = toggle.dataset.section;
        if (this.expandedSections.has(sectionId)) {
          this.expandedSections.delete(sectionId);
        } else {
          this.expandedSections.add(sectionId);
        }
        this.render();
        this.attachEvents();
      });
    });

    // Chapter buttons
    const chapterBtns = this.container.querySelectorAll('.chapter-btn');
    chapterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chapter = Number(btn.dataset.chapter);
        if (chapter !== this.currentChapter) {
          this.onNavigate(this.currentBook, chapter);
        }
      });
    });

    // Book buttons
    const bookBtns = this.container.querySelectorAll('.book-btn');
    bookBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const book = Number(btn.dataset.book);
        if (book !== this.currentBook) {
          this.onNavigate(book, 1);
        }
      });
    });
  }

  update(book, chapter) {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.render();
    this.attachEvents();
  }

  getChaptersWord(count) {
    if (count === 1) return 'глава';
    if (count > 1 && count < 5) return 'главы';
    return 'глав';
  }
}
