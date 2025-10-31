# 📖 Живая Библия - Vanilla JS

Миграция Bible App с Next.js на Vanilla JavaScript.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env файл
```

### 3. Сборка CSS
```bash
npm run build:css
# или для режима разработки:
npm run watch:css
```

### 4. Копирование данных
```bash
# Скопируйте bible.json из старого проекта
cp ../bible-app/data/bible.json ./data/
```

### 5. Запуск сервера
```bash
npm run server
# или для разработки с автоперезагрузкой:
npm run dev
```

### 6. Открыть в браузере
Откройте `index.html` в браузере или используйте live-server:
```bash
npx live-server --port=8080
```

## 📁 Структура проекта

```
bible-app-vanilla/
├── index.html              # Главная страница
├── read.html               # Страница чтения
├── css/
│   ├── input.css          # TailwindCSS источник
│   └── styles.css         # Скомпилированный CSS
├── js/
│   ├── config.js          # Константы
│   ├── bible-data.js      # Работа с данными
│   ├── api-client.js      # API клиент
│   ├── utils.js           # Утилиты
│   ├── components/        # UI компоненты
│   └── pages/             # Логика страниц
├── data/
│   └── bible.json         # Данные Библии
└── server/                # Node.js сервер
    ├── server.js          # Express app
    ├── routes/            # API маршруты
    └── lib/               # Библиотеки
```

## 🛠️ Технологии

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: OpenRouter API

## 📝 API Endpoints

- `POST /api/word` - Получить определение слова
- `GET /api/search?q=query` - Поиск по Библии
