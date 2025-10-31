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

### 5. Создайте файл с секретами
Создайте файл `.dev.vars` (для локальной разработки):
```
OPENROUTER_API_KEY=io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
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

### 8. Добавьте секрет в production
В [Cloudflare Dashboard](https://dash.cloudflare.com/):
1. Workers & Pages → ваш проект → Settings
2. Environment variables → Production
3. Add variable: `OPENROUTER_API_KEY` = ваш ключ

## ✅ Готово!

Ваше приложение доступно по адресу: `https://bible-app.pages.dev`

## 📝 Важные файлы для Cloudflare

- `worker.js` - основной Worker с API логикой
- `_worker.js` - точка входа для Cloudflare Pages
- `wrangler.toml` - конфигурация проекта
- `.dev.vars` - секреты для локальной разработки (не коммитить!)

## 🔄 Обновление приложения

Просто запустите:
```bash
npm run deploy
```

## ❓ Проблемы?

Смотрите полную документацию в `CLOUDFLARE_DEPLOY.md`
