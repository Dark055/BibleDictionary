// js/components/Breadcrumbs.js - Navigation breadcrumbs

import { BIBLE_BOOKS, BIBLE_STRUCTURE } from '../config.js';

export class Breadcrumbs {
  constructor(container, currentBook, currentChapter) {
    this.container = container;
    this.currentBook = Number(currentBook) || 1;
    this.currentChapter = Number(currentChapter) || 1;

    this.render();
  }

  render() {
    const bookName = BIBLE_BOOKS[this.currentBook - 1];
    const section = this.getBookSection(this.currentBook);

    this.container.innerHTML = `
      <nav class="breadcrumbs flex items-center gap-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
        <a href="index.html" class="hover:text-accent-warm transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="hidden sm:inline">Главная</span>
        </a>

        <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <span class="text-text-secondary hidden md:inline">
          ${section}
        </span>

        <svg class="w-4 h-4 text-text-muted hidden md:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <span class="font-serif font-semibold text-text-primary">
          ${bookName}
        </span>

        <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <span class="font-medium text-accent-warm">
          Глава ${this.currentChapter}
        </span>
      </nav>
    `;
  }

  getBookSection(bookNum) {
    const sections = BIBLE_STRUCTURE.SECTIONS;
    for (const section of sections) {
      if (bookNum >= section.start && bookNum <= section.end) {
        return section.name;
      }
    }
    return 'Библия';
  }

  update(book, chapter) {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.render();
  }
}
