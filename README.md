# Bible App Vanilla — руководство по проекту

## TL;DR (для следующего ИИ-агента)
- **Что это**: ванильное (без фреймворков и без бандлера) веб‑приложение для чтения Библии, с поиском и AI‑подсказками по словам.
- **Главная технология деплоя/бэкенда**: Cloudflare Pages + Worker (`worker.js`) с KV‑кешем (`WORDS_KV`).
- **Источник текста Библии для чтения глав**: внешний API **Bolls.life** (`js/bolls-api.js`).
- **AI‑подсказки по словам**: Google Gemini (в Worker и в Express‑сервере).
- **Рекомендованный запуск локально**: `npm install` → `npm run dev` → открыть `http://127.0.0.1:8788`.
- **Где «сердце» фронтенда**:
  - `index.html` + `js/pages/home.js`
  - `read.html` + `js/pages/read.js`
  - UI‑компоненты: `js/components/*`
  - Данные/кеши: `js/bible-service.js`, `js/api-client.js`
- **Где «сердце» API**:
  - Worker: `worker.js` (эндпоинты `/api/search`, `/api/word`, `/health`)
  - Альтернатива: Express `server/server.js` + `server/routes/*`

---

## 1) Назначение проекта
Приложение позволяет:
- читать главы Библии в разных переводах;
- быстро переходить по книгам/главам/стихам;
- искать по тексту;
- получать AI‑анализ выбранного слова в контексте стиха (оригинал/транслитерация/Strong’s/корень + объяснения).

Ключевой акцент:
- мобильный UX (touch‑friendly, double‑tap для выбора слова);
- кэширование (offline‑first для чтения глав);
- отсутствие сборки JS (ES6‑модули выполняются нативно в браузере).

---

## 2) Стек и технологии
### Frontend
- **HTML MPA**: несколько страниц без SPA‑роутера.
- **Vanilla JS + ES Modules**: `type: "module"` в `package.json`.
- **TailwindCSS**: сборка в `css/styles.css` из `css/input.css`.

### Backend (основной)
- **Cloudflare Pages Functions / Worker**: файл `worker.js`.
- **Cloudflare KV**: биндинг `WORDS_KV` для кеша словарных карточек.

### Backend (альтернативный, для локальной разработки)
- **Express**: `server/server.js` (раздаёт статику + API).
- **MongoDB** (опционально): кеш определений слов.

### Внешние API
- **Bolls.life API**: тексты глав/список книг/поиск (фоллбек).
- **Google Gemini API**: генерация структурированного JSON‑ответа для подсказок.
- **OpenRouter**: опциональный провайдер для Express‑режима.

---

## 3) Быстрый старт
### 3.1 Требования
- **Node.js ≥ 18** (важно из‑за ESM и встроенного `fetch`/`AbortSignal.timeout`).
- npm.
- Для деплоя на Cloudflare: аккаунт Cloudflare + настроенный KV.

### 3.2 Установка
```bash
npm install
```

### 3.3 CSS (Tailwind)
- Собрать один раз:
```bash
npm run build:css
```
- Следить за изменениями:
```bash
npm run watch:css
```

### 3.4 Рекомендованный локальный режим: Cloudflare Pages dev
Этот режим максимально близок к продакшену (работают и фронт, и `/api/*`, и KV‑кеш).

1) Убедись, что есть `.dev.vars` с переменными (минимум `GEMINI_API_KEY`).
2) Запусти:
```bash
npm run dev
```
3) Открой:
- `http://127.0.0.1:8788/`

Доступно:
- `GET /health`
- `GET /api/search?q=...`
- `POST /api/word`

### 3.5 Альтернативный локальный режим: Express
```bash
npm run serve:dev
```
По умолчанию:
- фронтенд: `http://localhost:3000/`
- чтение: `http://localhost:3000/read.html`

Требования к конфигу:
- переменные в `.env` (см. раздел 5)
- если включён MongoDB‑кеш — нужен `MONGODB_URI`

Важно:
- В текущем репозитории код Express использует пакет `mongodb` (`server/lib/mongodb.js`). Если он не установлен, запуск упадёт. В таком случае установи зависимость вручную.

### 3.6 Режим «только фронтенд» (без API)
```bash
npm start
```
Это просто статический сервер (live-server) на порту `8080`.

Ограничения:
- `/api/word` и `/api/search` отсутствуют, поэтому:
  - AI‑подсказки по словам работать не будут;
  - поиск будет работать **только если** переключить `API_BASE_URL` в `js/config.js` на `null`, чтобы `Search` использовал Bolls.life напрямую.

---

## 4) Команды npm (`package.json`)
- `npm run dev`
  - Cloudflare Pages dev (KV emulation), порт обычно `8788`.
- `npm run deploy`
  - сборка CSS + деплой на Cloudflare Pages.
- `npm run build:css`, `npm run watch:css`
  - сборка Tailwind.
- `npm start`
  - статический сервер (без API).
- `npm run serve`, `npm run serve:dev`
  - Express‑сервер (API + статика).

---

## 5) Переменные окружения и секреты
### 5.1 Worker (Cloudflare)
Обязательные:
- `GEMINI_API_KEY` — ключ Gemini.

Опциональные:
- `GEMINI_API_URL` — URL модели (в коде есть дефолт на `gemini-2.5-flash:generateContent`).

Локально (wrangler dev):
- использовать файл `.dev.vars`.

В проде:
- хранить как секреты Cloudflare (не коммитить в git).

### 5.2 Express (server/)
Вариант A (Gemini):
- `GEMINI_API_KEY`
- `GEMINI_API_URL`

Вариант B (OpenRouter):
- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL` (например, задан дефолт)
- `AI_MAX_TOKENS` (дефолт 300)

Кеширование в MongoDB (опционально, но сейчас код `server/routes/word.js` ожидает Mongo):
- `MONGODB_URI`

Порт:
- `PORT` (дефолт 3000)

Важно по безопасности:
- **не хранить реальные ключи в репозитории**. Если ключ уже попал в git — его надо отозвать/перевыпустить.

---

## 6) Структура репозитория
Ключевые директории/файлы:
- `index.html`, `read.html`
  - страницы приложения.
- `css/input.css`, `css/styles.css`
  - Tailwind input и скомпилированный CSS.
- `js/pages/*`
  - «контроллеры страниц».
- `js/components/*`
  - UI‑компоненты (классы).
- `js/bible-service.js`
  - слой данных для чтения глав + кеш глав в `localStorage` + управление переводом.
- `js/bolls-api.js`
  - клиент внешнего API Bolls.life.
- `js/api-client.js`
  - клиент внутренних эндпоинтов `/api/*` + кеш определений в `sessionStorage`.
- `shared/*`
  - утилиты/константы, которые шарятся между фронтом и Worker/сервером.
- `worker.js`
  - Cloudflare Worker: `/api/search`, `/api/word`, `/health`.
- `_worker.js`
  - entrypoint для Cloudflare Pages (реэкспорт `worker.js`).
- `_routes.json`
  - маршрутизация Pages: какие пути идут в Worker.
- `wrangler.toml`
  - конфиг wrangler, KV биндинги.
- `server/*`
  - Express альтернатива Worker.
- `data/bible.json`
  - локальный датасет стихов (используется сервером/worker для поиска).

---

## 7) Архитектура (как всё связано)
### 7.1 Клиент: страницы
- `index.html` → `js/pages/home.js`
  - поиск, библиотека книг, меню, селектор перевода.
- `read.html` → `js/pages/read.js`
  - загрузка главы, рендеринг стихов, навигация, тултип слова.

### 7.2 Компонентная модель
Компоненты в `js/components/*` — классы, обычно с паттерном:
- `constructor(container, ...)` → `render()` → `attachEvents()`

Примеры:
- `BibleReader` — рендер стихов, обработка double‑click/double‑tap по словам.
- `WordTooltip` — UI модалки/тултипа + запрос к API.
- `Search` — UI поиска + выбор источника (internal API или Bolls fallback).
- `Navigation`, `MobileNavigation`, `Sidebar`, `BottomNav` — навигация.

### 7.3 Data layer
- `js/bible-service.js`
  - хранит текущий перевод;
  - кэширует главы в `localStorage` на 7 дней (`bible-chapter-${translation}-${book}-${chapter}`);
  - при промахе — идёт в `js/bolls-api.js`.

- `js/api-client.js`
  - `getWordDefinition()` → `POST /api/word` + кеш в `sessionStorage` (`wordDef:${word}:${verseRef}`).
  - `searchBible()` → `GET /api/search?q=...`.

### 7.4 Backend
#### Cloudflare Worker (`worker.js`)
- `/api/search`
  - грузит `data/bible.json` (с кешированием через `caches.default`) и делает поиск.
- `/api/word`
  - вызывает Gemini, возвращает JSON, кеширует результат в KV (`WORDS_KV`), если доступно.

#### Express (`server/server.js`)
- `/api/search`
  - читает `data/bible.json` с диска и делает поиск.
- `/api/word`
  - mem‑кеш + MongoDB кеш + генерация через Gemini или OpenRouter.

---

## 8) Потоки данных (data flow)
### 8.1 Чтение главы
```text
read.js -> bible-service.getChapter()
        -> localStorage cache (7 дней)
        -> (cache miss) bolls-api.fetchChapter()
        -> render через BibleReader
```

### 8.2 Подсказка слова (AI)
```text
BibleReader (double click/tap) -> WordTooltip
                              -> api-client.getWordDefinition()
                              -> POST /api/word
                              -> (Worker) Gemini -> KV cache
                              -> UI render
```

### 8.3 Поиск
По умолчанию `Search` использует internal API (если `API_BASE_URL` в `js/config.js` не `null`).

```text
Search -> GET /api/search?q=...
       -> (Worker/Express) поиск по data/bible.json + highlight
       -> UI results -> переход на read.html?...#vN
```

Fallback режим:
- если выставить `API_BASE_URL = null`, `Search` будет искать через `Bolls.life /v2/find/...`.

---

## 9) URL‑состояние и навигация
Источник истины для «где мы в Библии» — URL:
- `read.html?book=1&chapter=1&translation=NRT#v5`

В коде есть два формата:
- query params (`?book=...&chapter=...&translation=...`)
- hash‑роут (`#/read/{book}/{chapter}`), который пишет `updateUrl()`

Функции:
- `getUrlParams()` (в `js/utils.js`) читает и query, и hash‑роут.
- `updateUrl()` обновляет URL без перезагрузки.

---

## 10) Где что менять (шпаргалка)
- **Рендер стихов / взаимодействие со словами**:
  - `js/components/BibleReader.js`
- **Тултип слова и UI карточки**:
  - `js/components/WordTooltip.js`
- **Запрос к API для слова/поиска**:
  - `js/api-client.js`
- **Кеширование глав / выбор перевода**:
  - `js/bible-service.js`
- **Внешний контент Библии**:
  - `js/bolls-api.js`
- **Поиск (UI)**:
  - `js/components/Search.js`
- **Worker API**:
  - `worker.js`
- **Express API**:
  - `server/routes/search.js`, `server/routes/word.js`
- **Книги/алиасы/парсинг ссылок**:
  - `shared/bible-constants.js`, `shared/bible-utils.js`
- **Количество глав в книгах (для навигации)**:
  - `shared/bible-books-info.js`

---

## 11) Деплой на Cloudflare Pages
Высокоуровневые шаги:
1) Подготовить KV namespace `WORDS_KV`.
2) Прописать `kv_namespaces` в `wrangler.toml` (binding `WORDS_KV`, корректные `id`/`preview_id`).
3) Установить секреты (`GEMINI_API_KEY`, при необходимости `GEMINI_API_URL`).
4) Деплой:
```bash
npm run deploy
```

Маршрутизация:
- `_routes.json` включает `/api/*` и `/health` в Worker, исключает статику (`/css/*`, `/js/*`, `/data/*`, `/*.html`, и т.д.).

---

## 12) Траблшутинг
- **Не работает `/api/word`**
  - проверь `GEMINI_API_KEY` (для Worker — секрет/`.dev.vars`, для Express — `.env`).
  - проверь, что ты запускаешь не “только фронтенд” (`npm start`), а Worker/Express.

- **Поиск не работает в режиме `npm start`**
  - это ожидаемо: нет `/api/search`.
  - либо запускай `npm run dev`/`npm run serve`, либо переключи `API_BASE_URL = null` и используй Bolls search.

- **Большой `data/bible.json`**
  - это нормально: используется для внутреннего поиска.
  - в Worker файл кешируется через `caches.default`.

- **Express падает с ошибкой про MongoDB**
  - `server/routes/word.js` ожидает MongoDB.
  - либо настрой `MONGODB_URI`, либо доработай код маршрута под режим без Mongo.

---

## 13) Примечания (важно для понимания контекста)
- В репозитории одновременно существуют 2 подхода к данным:
  - чтение глав через Bolls.life (онлайн);
  - поиск по локальному датасету `data/bible.json` (быстро, предсказуемо, но тяжёлый файл).

- `CLAUDE.md` в репозитории может содержать устаревшие детали (например, про отсутствие локального JSON). Это не «источник истины»; источники истины — `worker.js`, `js/*`, `server/*`.
