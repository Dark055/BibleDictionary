// js/components/Search.js - Компонент поиска

import { BIBLE_BOOKS, API_BASE_URL } from '../config.js';
import { searchBible } from '../api-client.js';
import { searchVerses as searchBollsVerses } from '../bolls-api.js';
import { getCurrentTranslation } from '../bible-service.js';

export class Search {
  constructor(container) {
    this.container = container;
    this.query = '';
    this.results = [];
    this.loading = false;
    this.showResults = false;
    this.searchType = null;
    this.clickOutsideHandler = null;
    this.offline = false;
    
    this.render();
    this.attachEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="relative w-full max-w-2xl mx-auto" id="search-wrapper">
        <!-- Search input with button - минималистичный -->
        <div class="relative flex items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              id="search-input"
              placeholder="Поиск по Библии..."
              class="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-white border border-light-gray
                     focus:border-accent-warm focus:outline-none focus:ring-2 focus:ring-accent-warm/20
                     shadow-minimal transition duration-300 text-base sm:text-lg placeholder:text-text-muted"
            />

            <!-- Clear button (inside input) -->
            <button
              id="clear-search"
              style="display: none;"
              class="absolute right-3 top-1/2 transform -translate-y-1/2
                     text-text-muted hover:text-accent-warm transition-colors p-1 rounded-lg hover:bg-warm-white"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Loading spinner -->
            <div id="loading-spinner" style="display: none;" class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="relative w-5 h-5">
                <div class="absolute inset-0 rounded-full border-2 border-accent-warm/20"></div>
                <div class="absolute inset-0 rounded-full border-2 border-accent-warm border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>

          <!-- Search Button with Icon - минималистичный -->
          <button
            id="search-button"
            class="px-5 sm:px-6 py-3.5 sm:py-4 bg-accent-warm hover:bg-accent-warm-hover text-white rounded-2xl
                   transition-all duration-300 shadow-minimal hover:shadow-minimal-md
                   flex items-center gap-2 font-medium min-w-[44px] min-h-[44px] touch-manipulation"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="hidden sm:inline">Найти</span>
          </button>
        </div>

        <!-- Search hints - минималистичные -->
        <div id="search-hints" class="mt-4 flex items-center justify-center gap-2 text-sm">
          <span class="px-4 py-2 bg-warm-white rounded-xl font-medium cursor-pointer text-text-secondary
                       hover:bg-accent-warm hover:text-white transition-all duration-200 border border-light-gray"
                data-hint="любовь">любовь</span>
          <span class="px-4 py-2 bg-warm-white rounded-xl font-medium cursor-pointer text-text-secondary
                       hover:bg-accent-warm hover:text-white transition-all duration-200 border border-light-gray"
                data-hint="надежда">надежда</span>
          <span class="px-4 py-2 bg-warm-white rounded-xl font-medium cursor-pointer text-text-secondary
                       hover:bg-accent-warm hover:text-white transition-all duration-200 border border-light-gray"
                data-hint="вера">вера</span>
        </div>

        <!-- Search results -->
        <div id="search-results" style="display: none;"></div>
      </div>
    `;

    this.attachEvents();
    this.updateUI();
  }
  
  renderResults() {
    if (this.offline) {
      return `
        <div class="absolute w-full mt-4 bg-white border border-light-gray
                  rounded-2xl shadow-minimal-lg p-8 z-50">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
              <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p class="text-text-primary font-semibold mb-2 text-lg">
              Поиск недоступен офлайн
            </p>
            <p class="text-sm text-text-secondary">
              Подключитесь к интернету, чтобы использовать поиск по Библии.
            </p>
          </div>
        </div>
      `;
    }

    if (this.results.length === 0 && !this.loading) {
      return `
        <div class="absolute w-full mt-4 bg-white border border-light-gray
                  rounded-2xl shadow-minimal-lg p-8 z-50">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-warm-white rounded-full mb-4">
              <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="text-text-primary font-semibold mb-2 text-lg">
              Ничего не найдено
            </p>
            <p class="text-sm text-text-secondary">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        </div>
      `;
    }

    if (this.results.length === 0) return '';

    return `
      <div class="absolute w-full mt-4 bg-white border border-light-gray
                rounded-2xl shadow-minimal-lg max-h-[60vh] sm:max-h-[70vh] md:max-h-[32rem] overflow-hidden z-50">
        <!-- Results header - минималистичный -->
        <div class="px-6 py-4 bg-warm-white border-b border-light-gray sticky top-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-accent-warm rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-text-primary">
                Найдено: ${this.results.length} ${this.results.length === 1 ? 'стих' : 'стихов'}
              </span>
            </div>
            <button
              id="close-results"
              class="text-text-muted hover:text-accent-warm transition-colors p-1 rounded-lg hover:bg-white"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Results list - минималистичный -->
        <div class="divide-y divide-light-gray overflow-y-auto max-h-[calc(60vh-8rem)] sm:max-h-[calc(70vh-8rem)] md:max-h-[28rem]">
          ${this.results.map((verse, idx) => `
            <div
              class="group px-6 py-4 hover:bg-warm-white cursor-pointer transition-all duration-200 relative result-item"
              data-book="${verse.book}"
              data-chapter="${verse.chapter}"
              data-verse="${verse.verse}"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-accent-warm transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top"></div>

              <!-- Verse reference -->
              <div class="flex items-center gap-2 mb-2">
                <div class="px-3 py-1 bg-warm-white group-hover:bg-accent-warm/10 rounded-lg transition-colors border border-light-gray">
                  <span class="text-xs font-medium text-accent-warm font-serif">
                    ${BIBLE_BOOKS[verse.book - 1]} ${verse.chapter}:${verse.verse}
                  </span>
                </div>
                <svg class="w-4 h-4 text-text-muted group-hover:text-accent-warm opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <!-- Verse text with highlighting -->
              <div class="text-sm text-text-secondary line-clamp-2 leading-relaxed font-serif">
                ${verse.highlight || verse.text}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Results footer -->
        ${this.results.length >= 50 ? `
          <div class="px-6 py-4 bg-warm-white border-t border-light-gray">
            <div class="flex items-center gap-2 text-xs text-text-secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">
                Показаны первые 50 результатов. Уточните запрос для более точного поиска.
              </span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  updateUI() {
    const input = this.container.querySelector('#search-input');
    const clearBtn = this.container.querySelector('#clear-search');
    const spinner = this.container.querySelector('#loading-spinner');
    const hints = this.container.querySelector('#search-hints');
    const resultsContainer = this.container.querySelector('#search-results');
    
    if (input) {
      input.value = this.query;
    }
    
    if (clearBtn) {
      clearBtn.style.display = (this.query.length > 0 && !this.loading) ? 'block' : 'none';
    }
    
    if (spinner) {
      spinner.style.display = this.loading ? 'block' : 'none';
    }
    
    if (hints) {
      hints.style.display = (this.query.length === 0 && !this.showResults) ? 'flex' : 'none';
    }
    
    if (resultsContainer) {
      resultsContainer.style.display = this.showResults ? 'block' : 'none';
      resultsContainer.innerHTML = this.renderResults();
      this.attachResultsEvents();
    }
  }
  
  attachEvents() {
    const input = this.container.querySelector('#search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        this.query = e.target.value;
        if (this.query.length < 2) {
          this.results = [];
          this.showResults = false;
        }
        this.updateUI();
      });
      
      input.addEventListener('focus', () => {
        if (this.results.length > 0) {
          this.showResults = true;
          this.updateUI();
        }
      });
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.query.length >= 2) {
            this.performSearch();
          }
        } else if (e.key === 'Escape') {
          this.showResults = false;
          this.updateUI();
        }
      });
    }
    
    const searchBtn = this.container.querySelector('#search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        if (this.query.length >= 2) {
          this.performSearch();
        }
      });
    }
    
    const clearBtn = this.container.querySelector('#clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.query = '';
        this.results = [];
        this.showResults = false;
        this.updateUI();
        const input = this.container.querySelector('#search-input');
        if (input) input.focus();
      });
    }
    
    const hints = this.container.querySelectorAll('[data-hint]');
    hints.forEach(hint => {
      hint.addEventListener('click', () => {
        this.query = hint.dataset.hint;
        const input = this.container.querySelector('#search-input');
        if (input) {
          input.value = this.query;
          input.focus();
        }
        this.updateUI();
        this.performSearch();
      });
    });
    
    if (!this.clickOutsideHandler) {
      this.clickOutsideHandler = this.handleClickOutside.bind(this);
      setTimeout(() => {
        document.addEventListener('click', this.clickOutsideHandler);
      }, 100);
    }
  }
  
  attachResultsEvents() {
    const closeBtn = this.container.querySelector('#close-results');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.showResults = false;
        this.updateUI();
      });
    }
    
    const resultItems = this.container.querySelectorAll('.result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const book = item.dataset.book;
        const chapter = item.dataset.chapter;
        const verse = item.dataset.verse;
        window.location.href = `read.html?book=${book}&chapter=${chapter}#v${verse}`;
      });
    });
  }
  
  handleClickOutside(event) {
    const wrapper = this.container.querySelector('#search-wrapper');
    if (wrapper && !wrapper.contains(event.target)) {
      if (this.showResults) {
        this.showResults = false;
        this.updateUI();
      }
    }
  }
  
  highlightSearchResults(verses, query) {
    const lowerQuery = query.toLowerCase();
    return verses.map(verse => {
      const text = verse.text;
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);
      
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + lowerQuery.length + 100);
        let snippet = text.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        const highlightedSnippet = snippet.replace(
          new RegExp(query, 'gi'),
          match => `<mark class="bg-accent-warm/20 text-accent-warm font-medium px-1 rounded">${match}</mark>`
        );
        
        return {
          ...verse,
          highlight: highlightedSnippet
        };
      }
      
      return verse;
    });
  }
  
  async performSearch() {
    this.offline = false;
    this.loading = true;
    this.updateUI();
    
    try {
      if (API_BASE_URL) {
        const data = await searchBible(this.query);
        this.results = data.results || [];
        this.searchType = data.type;
      } else {
        const translation = getCurrentTranslation();
        const verses = await searchBollsVerses(translation, this.query, { limit: 50 });
        this.results = this.highlightSearchResults(verses, this.query);
        this.searchType = 'text';
      }
      
      this.showResults = true;
    } catch (error) {
      console.error('Search error:', error);
      this.results = [];
      this.showResults = true;
      
      if (error.message.includes('Bolls API error') || !navigator.onLine) {
        this.showOfflineError();
      }
    } finally {
      this.loading = false;
      this.updateUI();
    }
  }
  
  showOfflineError() {
    this.offline = true;
  }
  
  destroy() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }
}
