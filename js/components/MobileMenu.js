// js/components/MobileMenu.js - Компонент мобильного меню

export class MobileMenu {
  constructor(button, menuItems) {
    this.button = button;
    this.menuItems = menuItems;
    this.isOpen = false;
    this.menuEl = null;
    this.overlayEl = null;
    
    this.init();
  }
  
  init() {
    // Создать меню и overlay
    this.createMenu();
    this.attachEvents();
  }
  
  createMenu() {
    // Overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'fixed inset-0 bg-black/50 z-40 md:hidden';
    this.overlayEl.style.opacity = '0';
    this.overlayEl.style.pointerEvents = 'none';
    this.overlayEl.style.transition = 'opacity 0.3s ease-in-out';
    
    // Menu
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'fixed top-0 left-0 h-full w-64 bg-[#4A3041] shadow-2xl z-50 md:hidden transform -translate-x-full transition-transform duration-300 ease-in-out';
    
    this.menuEl.innerHTML = `
      <div class="flex items-center justify-between p-6 border-b border-white/10">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">📖</span>
          <h2 class="text-xl font-serif font-bold text-white">Меню</h2>
        </div>
        <button id="mobile-menu-close" class="text-white hover:text-amber-200 transition-colors" aria-label="Закрыть меню">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="p-6">
        <ul class="space-y-4">
          ${this.menuItems.map(item => `
            <li>
              <a 
                href="${item.href}" 
                class="block px-4 py-3 text-white hover:text-amber-200 hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium mobile-menu-link"
              >
                ${item.label}
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
    `;
    
    // Добавить в body
    document.body.appendChild(this.overlayEl);
    document.body.appendChild(this.menuEl);
    
    // Добавить обработчик закрытия через overlay
    this.overlayEl.addEventListener('click', () => this.close());
    
    // Обработчик закрытия через кнопку
    const closeBtn = this.menuEl.querySelector('#mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // Закрытие меню при клике на ссылку
    const menuLinks = this.menuEl.querySelectorAll('.mobile-menu-link');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Небольшая задержка для плавной анимации перехода
        setTimeout(() => this.close(), 200);
      });
    });
    
    // Предотвратить закрытие при клике внутри меню
    this.menuEl.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  attachEvents() {
    if (this.button) {
      this.button.addEventListener('click', () => {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      });
    }
    
    // Закрытие при изменении размера окна (если стал больше md)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && this.isOpen) {
        this.close();
      }
    });
    
    // Закрытие при нажатии Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Показать overlay
    this.overlayEl.style.pointerEvents = 'auto';
    this.overlayEl.style.opacity = '1';
    
    // Показать меню
    requestAnimationFrame(() => {
      this.menuEl.classList.remove('-translate-x-full');
      this.menuEl.classList.add('translate-x-0');
    });
  }
  
  close() {
    this.isOpen = false;
    document.body.style.overflow = '';
    
    // Скрыть overlay
    this.overlayEl.style.opacity = '0';
    this.overlayEl.style.pointerEvents = 'none';
    
    // Скрыть меню
    this.menuEl.classList.remove('translate-x-0');
    this.menuEl.classList.add('-translate-x-full');
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  destroy() {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.remove();
    }
    if (this.menuEl && this.menuEl.parentNode) {
      this.menuEl.remove();
    }
    document.body.style.overflow = '';
  }
}

