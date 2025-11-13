import { getSupportedTranslations, getCurrentTranslation, setCurrentTranslation } from '../bible-service.js';

export class TranslationSelector {
  constructor(container, onTranslationChange = null, isMobile = false) {
    this.container = container;
    this.onTranslationChange = onTranslationChange;
    this.translations = getSupportedTranslations();
    this.currentTranslation = getCurrentTranslation();
    this.isMobile = isMobile;
    this.documentClickHandler = null;
    
    this.render();
    this.attachEvents();
  }

  render() {
    if (this.isMobile) {
      this.renderMobile();
    } else {
      this.renderDesktop();
    }
  }

  renderDesktop() {
    this.container.innerHTML = `
      <div class="relative">
        <button 
          id="translation-button"
          class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8A9B69] rounded-xl 
                 hover:border-[#B35441] transition-all duration-300 text-sm font-medium"
        >
          <span class="text-[#2C1810]">${this.getCurrentTranslationName()}</span>
          <svg class="w-4 h-4 text-[#8A9B69] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div id="translation-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white border-2 border-[#8A9B69]/30 rounded-xl shadow-2xl z-50">
          <div class="p-2">
            ${this.translations.map(translation => `
              <button 
                data-translation="${translation.code}"
                class="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group
                       ${translation.code === this.currentTranslation 
                         ? 'bg-[#8A9B69]/10 text-[#2C1810] font-semibold' 
                         : 'hover:bg-[#F5F1E8] text-gray-700'}"
              >
                <div>
                  <div class="font-medium">${translation.name}</div>
                  <div class="text-xs text-gray-500 mt-0.5">${this.getLanguageName(translation.lang)}</div>
                </div>
                ${translation.code === this.currentTranslation ? `
                  <svg class="w-5 h-5 text-[#B35441]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                ` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderMobile() {
    this.container.innerHTML = `
      <select 
        id="translation-select"
        class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm 
               focus:outline-none focus:border-white/40 transition-colors min-w-[120px]"
      >
        ${this.translations.map(translation => `
          <option value="${translation.code}" ${translation.code === this.currentTranslation ? 'selected' : ''}>
            ${this.getShortName(translation)}
          </option>
        `).join('')}
      </select>
    `;
  }

  getCurrentTranslationName() {
    const translation = this.translations.find(t => t.code === this.currentTranslation);
    return translation ? translation.name : 'Выбор перевода';
  }

  getLanguageName(lang) {
    const names = {
      'uk': 'Українська',
      'ru': 'Русский',
      'en': 'English'
    };
    return names[lang] || lang;
  }

  getShortName(translation) {
    const names = {
      'UBIO': 'Укр',
      'NRT': 'Рус',
      'NIV': 'Eng'
    };
    return names[translation.code] || translation.code;
  }

  attachEvents() {
    if (this.isMobile) {
      this.attachMobileEvents();
    } else {
      this.attachDesktopEvents();
    }
  }

  attachDesktopEvents() {
    const button = this.container.querySelector('#translation-button');
    const dropdown = this.container.querySelector('#translation-dropdown');
    
    button.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
      const arrow = button.querySelector('svg');
      arrow.classList.toggle('rotate-180');
    });

    dropdown.querySelectorAll('[data-translation]').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.dataset.translation;
        if (code !== this.currentTranslation) {
          this.currentTranslation = code;
          setCurrentTranslation(code);
          this.render();
          this.attachEvents();
          
          if (this.onTranslationChange) {
            this.onTranslationChange(code);
          }
        }
      });
    });

    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }

    this.documentClickHandler = (e) => {
      if (!this.container.contains(e.target)) {
        dropdown.classList.add('hidden');
        const arrow = button.querySelector('svg');
        arrow.classList.remove('rotate-180');
      }
    };

    document.addEventListener('click', this.documentClickHandler);
  }

  attachMobileEvents() {
    const select = this.container.querySelector('#translation-select');
    
    select.addEventListener('change', () => {
      const code = select.value;
      if (code !== this.currentTranslation) {
        this.currentTranslation = code;
        setCurrentTranslation(code);
        
        if (this.onTranslationChange) {
          this.onTranslationChange(code);
        }
      }
    });
  }

  update() {
    this.currentTranslation = getCurrentTranslation();
    this.render();
    this.attachEvents();
  }
}
