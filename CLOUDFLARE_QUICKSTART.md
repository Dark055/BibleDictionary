# Быстрый старт для Cloudflare Pages

## 🚀 Деплой за 5 минут

### 1. Установите зависимости
```bash
npm install
```

### 2. Соберите CSS
```bash
npm run build:css
```

### 3. Залогиньтесь в Cloudflare
```bash
npx wrangler login
```

### 4. Создайте KV хранилище
```bash
npx wrangler kv:namespace create WORDS_KV
```

Скопируйте `id` из вывода и вставьте в `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "WORDS_KV"
id = "вставьте_сюда"
```

### 5. Настройте переменные окружения
Создайте файл `.env` на основе `.env.example`:
```bash
cp .env .env
```

Отредактируйте `.env` и добавьте ваш API ключ:
```env
AI_API_KEY=your_openrouter_api_key_here
AI_API_URL=https://api.intelligence.io.solutions/api/v1/chat/completions
AI_MODEL=minimax/minimax-m2:free
PORT=3000
```

### 6. Запустите локально
```bash
npm run dev
```

Откройте http://localhost:8788

### 7. Задеплойте на Cloudflare
```bash
npm run deploy
```

### 8. Добавьте переменные в production
В [Cloudflare Dashboard](https://dash.cloudflare.com/):
1. Workers & Pages → ваш проект → Settings
2. Environment variables → Production
3. Add variables:
   - `AI_API_KEY` = ваш OpenRouter API ключ
   - `AI_API_URL` = https://api.intelligence.io.solutions/api/v1/chat/completions
   - `AI_MODEL` = minimax/minimax-m2:free

## ✅ Готово!

Ваше приложение доступно по адресу: `https://bible-app.pages.dev`

## 📝 Важные файлы для Cloudflare

- `worker.js` - основной Worker с API логикой
- `_worker.js` - точка входа для Cloudflare Pages
- `wrangler.toml` - конфигурация проекта
- `.env` - переменные окружения для локальной разработки (не коммитить!)

## 🔄 Обновление приложения

Просто запустите:
```bash
npm run deploy
```

## ❓ Проблемы?

Смотрите полную документацию в `CLOUDFLARE_DEPLOY.md`
