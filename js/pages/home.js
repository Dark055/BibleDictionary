// js/pages/home.js - Логика главной страницы

import { BIBLE_BOOKS, BIBLE_STRUCTURE } from '../config.js';
import { Search } from '../components/Search.js';
import { loadBibleData, getBookStats } from '../bible-data.js';

// Инициализация страницы
async function init() {
  // Загрузить данные Библии
  try {
    await loadBibleData();
    console.log('Данные Библии загружены');
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
  
  // Инициализировать компонент поиска
  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    new Search(searchContainer);
  }
  
  // Отрисовать фичи
  renderFeatures();
  
  // Отрисовать библиотеку книг
  renderBooksLibrary();
}

// Отрисовать возможности платформы
function renderFeatures() {
  const features = [
    {
      icon: '📝',
      title: 'Интерактивное чтение',
      description: 'Кликайте на любое слово для получения подробного определения и контекста'
    },
    {
      icon: '🔍',
      title: 'Умный поиск',
      description: 'Мгновенный поиск по всей Библии с подсветкой результатов'
    },
    {
      icon: '🤖',
      title: 'AI-ассистент',
      description: 'Глубокий анализ слов с использованием искусственного интеллекта'
    },
    {
      icon: '📊',
      title: 'Аналитика текста',
      description: 'Частота употребления слов, морфология, семантические связи'
    },
    {
      icon: '🌐',
      title: 'Оригинальные языки',
      description: 'Информация из древнееврейского и древнегреческого текстов'
    },
    {
      icon: '⚡',
      title: 'Быстрая навигация',
      description: 'Удобный переход между книгами, главами и стихами'
    }
  ];
  
  const featuresGrid = document.getElementById('features-grid');
  if (featuresGrid) {
    featuresGrid.innerHTML = features.map(feature => `
      <div class="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        <div class="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          ${feature.icon}
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3">
          ${feature.title}
        </h3>
        <p class="text-gray-600 leading-relaxed">
          ${feature.description}
        </p>
      </div>
    `).join('');
  }
}

// Отрисовать библиотеку книг
function renderBooksLibrary() {
  const booksLibrary = document.getElementById('books-library');
  if (!booksLibrary) return;
  
  const sections = BIBLE_STRUCTURE.SECTIONS;
  
  booksLibrary.innerHTML = sections.map(section => {
    const sectionBooks = BIBLE_BOOKS.slice(section.start - 1, section.end);
    const isOT = section.end <= 39;
    
    return `
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold bg-gradient-to-r ${
            isOT ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-emerald-600'
          } bg-clip-text text-transparent">
            ${section.name}
          </h3>
          <span class="px-3 py-1 ${
            isOT ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          } rounded-full text-sm font-semibold">
            ${sectionBooks.length} ${sectionBooks.length === 1 ? 'книга' : 'книг'}
          </span>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${sectionBooks.map((book, idx) => {
            const bookNum = section.start + idx;
            return `
              <a 
                href="read.html?book=${bookNum}&chapter=1"
                class="group px-4 py-3 bg-gradient-to-r ${
                  isOT 
                    ? 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200' 
                    : 'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200'
                } border rounded-xl transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold ${
                    isOT ? 'text-blue-700' : 'text-green-700'
                  } group-hover:text-opacity-80">
                    ${book}
                  </span>
                  <svg class="w-4 h-4 ${
                    isOT ? 'text-blue-500' : 'text-green-500'
                  } opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Запустить инициализацию при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
