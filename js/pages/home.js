// js/pages/home.js - Логика главной страницы

import { BIBLE_BOOKS, BIBLE_STRUCTURE } from '../config.js';
import { Search } from '../components/Search.js';
import { MobileMenu } from '../components/MobileMenu.js';
import { TranslationSelector } from '../components/TranslationSelector.js';

// Текущий активный таб
let currentTab = 'all';

// Инициализация страницы
async function init() {
  // Инициализировать мобильное меню
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenuButton) {
    const menuItems = [
      { href: '#home', label: 'Главная' },
      { href: '#library', label: 'Библиотека' },
      { href: '#featured', label: 'Рекомендации' },
      { href: '#about', label: 'О проекте' }
    ];
    new MobileMenu(mobileMenuButton, menuItems);
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

  // Инициализировать tabs
  initTabs();

  // Инициализировать десктопный селектор перевода
  const translationContainer = document.getElementById('translation-selector');
  if (translationContainer) {
    new TranslationSelector(translationContainer, null, false);
  }

  // Инициализировать мобильный селектор перевода
  const mobileTranslationContainer = document.getElementById('mobile-translation-selector');
  if (mobileTranslationContainer && window.innerWidth < 768) {
    mobileTranslationContainer.classList.remove('hidden');
    new TranslationSelector(mobileTranslationContainer, null, true);
  }

  // Обработка изменения размера окна
  window.addEventListener('resize', () => {
    if (mobileTranslationContainer) {
      if (window.innerWidth < 768) {
        mobileTranslationContainer.classList.remove('hidden');
        if (!mobileTranslationContainer.firstChild) {
          new TranslationSelector(mobileTranslationContainer, null, true);
        }
      } else {
        mobileTranslationContainer.classList.add('hidden');
      }
    }
  });
}

// Инициализировать tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.library-tab');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;

      // Обновить активный таб
      tabButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-accent-warm', 'text-white');
        btn.classList.add('text-text-secondary');
      });

      button.classList.add('active', 'bg-accent-warm', 'text-white');
      button.classList.remove('text-text-secondary');

      currentTab = tab;
      renderBooksLibrary();
    });
  });
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
      <div class="group bg-white rounded-2xl p-8 border border-light-gray shadow-minimal hover:shadow-minimal-lg transition-all duration-300 hover-float">
        <div class="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
          ${feature.icon}
        </div>
        <h3 class="text-xl font-serif font-semibold text-text-primary mb-3">
          ${feature.title}
        </h3>
        <p class="text-text-secondary leading-relaxed">
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

  // Фильтровать секции по текущему табу
  let filteredSections = sections;
  if (currentTab === 'ot') {
    filteredSections = sections.filter(section => section.end <= 39);
  } else if (currentTab === 'nt') {
    filteredSections = sections.filter(section => section.start >= 40);
  }

  booksLibrary.innerHTML = filteredSections.map(section => {
    const sectionBooks = BIBLE_BOOKS.slice(section.start - 1, section.end);

    return `
      <div class="bg-white rounded-xl p-4 border border-light-gray shadow-minimal">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-light-gray">
          <h3 class="text-lg font-serif font-semibold text-text-primary">
            ${section.name}
          </h3>
          <span class="px-2.5 py-1 bg-warm-white text-text-secondary rounded-full text-xs font-medium whitespace-nowrap">
            ${sectionBooks.length} ${sectionBooks.length === 1 ? 'книга' : 'книг'}
          </span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${sectionBooks.map((book, idx) => {
      const bookNum = section.start + idx;
      return `
              <a
                href="read.html?book=${bookNum}&chapter=1"
                class="library-tab px-6 py-2.5 rounded-lg font-medium text-sm transition-all text-text-secondary hover:bg-accent-warm hover:text-white"
              >
                ${book}
              </a>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Получить описание секции
function getSectionDescription(name) {
  const descriptions = {
    'Закон': 'Первые пять книг Моисея',
    'История': 'Исторические книги Израиля',
    'Поэзия и мудрость': 'Поэтические и учительные книги',
    'Великие пророки': 'Книги великих пророков',
    'Малые пророки': 'Книги малых пророков',
    'Евангелия': 'Жизнь и учение Иисуса Христа',
    'История': 'Деяния апостолов',
    'Послания Павла': 'Письма апостола Павла',
    'Общие послания': 'Письма других апостолов',
    'Пророчество': 'Откровение Иоанна Богослова'
  };
  return descriptions[name] || '';
}

// Запустить инициализацию при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
