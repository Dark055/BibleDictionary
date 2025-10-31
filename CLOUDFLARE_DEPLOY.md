# Деплой на Cloudflare Pages

## Предварительные требования

1. Аккаунт на [Cloudflare](https://dash.cloudflare.com/)
2. Установленный [Node.js](https://nodejs.org/) (v18+)

## Шаги для деплоя

### 1. Установка зависимостей

```bash
npm install
```

### 2. Сборка CSS

```bash
npm run build:css
```

### 3. Авторизация в Cloudflare

```bash
npx wrangler login
```

### 4. Создание KV namespace

```bash
npx wrangler kv:namespace create WORDS_KV
```

Скопируйте ID из вывода и замените `your_kv_namespace_id` в `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "WORDS_KV"
id = "ваш_реальный_id"
```

### 5. Настройка переменных окружения

Создайте секрет для AI API key:

```bash
npx wrangler secret put AI_API_KEY
```

Введите ваш OpenRouter API ключ: `io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`

**Примечание:** Другие переменные (AI_API_URL, AI_MODEL) уже настроены в `wrangler.toml`

### 6. Деплой проекта

#### Через GitHub (рекомендуется)

1. Создайте репозиторий на GitHub
2. Загрузите код:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ваш-username/bible-app.git
   git push -u origin main
   ```
3. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
4. Workers & Pages → Create application → Pages → Connect to Git
5. Выберите репозиторий
6. Настройте деплой:
   - Build command: `npm run build:css`
   - Build output directory: `/`
   - Root directory: `/`
7. Environment variables → Add variables:
   - `AI_API_KEY` = ваш OpenRouter API ключ
   - `AI_API_URL` = https://api.intelligence.io.solutions/api/v1/chat/completions
   - `AI_MODEL` = minimax/minimax-m2:free
8. Settings → Functions:
   - KV namespace bindings → Add binding:
     - Variable name: `WORDS_KV`
     - KV namespace: выберите созданный namespace
9. Deploy site

#### Напрямую через Wrangler

```bash
npm run deploy
```

### 7. Настройка для production

После деплоя обновите `worker.js` строку 168:
```javascript
'HTTP-Referer': 'https://ваш-сайт.pages.dev',
```

## Локальная разработка

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:8788`

## Важные замечания

1. **Лимиты KV**: Бесплатный план включает 100,000 операций чтения и 1,000 операций записи в день
2. **OpenRouter**: Используйте свой API ключ и отслеживайте использование
3. **Размер файлов**: Cloudflare Pages поддерживает до 25MB на файл
4. **Функции**: Worker имеет лимит 1ms CPU time на бесплатном плане

## Обновление приложения

```bash
git add .
git commit -m "Update"
git push
```

Cloudflare автоматически задеплоит изменения.

## Удаление

```bash
npx wrangler pages delete bible-app
npx wrangler kv:namespace delete --namespace-id=ваш_id
```

## Мониторинг

- Логи: Cloudflare Dashboard → Workers & Pages → ваш проект → Logs
- Аналитика: Workers & Pages → ваш проект → Analytics

## Поддержка

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
