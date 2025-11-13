# 🔧 Настройка Google Gemini API

## Быстрый старт

### 1. Получите API ключ Gemini

1. Перейдите на https://aistudio.google.com/app/apikey
2. Нажмите **"Create API Key"**
3. Выберите или создайте проект
4. Скопируйте сгенерированный ключ

### 2. Добавьте ключ в `.env`

Создайте файл `.env` в корне проекта (или отредактируйте существующий):

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
USE_GEMINI=true

# MongoDB (опционально)
MONGODB_URI=

# Сервер
PORT=3000
```

### 3. Запустите приложение

```bash
npm install
npm run build:css
npm run dev
```

## Выбор между API провайдерами

### Использовать Gemini (рекомендуется)

```env
USE_GEMINI=true
GEMINI_API_KEY=your_key_here
```

### Использовать OpenRouter (по умолчанию)

```env
USE_GEMINI=false
AI_API_KEY=your_openrouter_key_here
AI_API_URL=https://openrouter.ai/api/v1/chat/completions
AI_MODEL=minimax/minimax-m2:free
```

## Сравнение API

| Параметр | Gemini | OpenRouter |
|----------|--------|-----------|
| **Бесплатный уровень** | Да (1500 запросов/день) | Да (ограничено) |
| **Скорость** | Быстро | Средне |
| **Качество** | Высокое | Зависит от модели |
| **Поддержка русского** | Отличная | Хорошая |
| **Лимиты** | 1500 запросов/день | Зависит от плана |

## Решение проблем

### Ошибка: "GEMINI_API_KEY must be set"

**Решение:** Убедитесь, что в файле `.env` установлена переменная `GEMINI_API_KEY`

### Ошибка: "Gemini API error: 401"

**Решение:** Проверьте, что ключ скопирован правильно и не содержит пробелов

### Ошибка: "Failed to parse Gemini response"

**Решение:** Это может быть проблема с форматом ответа. Проверьте логи сервера:

```bash
npm run dev
```

Посмотрите консоль для деталей ошибки.

### Ошибка: "Gemini API request timeout"

**Решение:** Увеличьте таймаут или проверьте интернет-соединение

## Архитектура

Модуль Gemini находится в `server/lib/gemini.js` и экспортирует функцию:

```javascript
export async function getWordDefinitionGemini(word, context)
```

Логика выбора API находится в `server/routes/word.js`:

```javascript
const useGemini = process.env.USE_GEMINI === 'true' || process.env.GEMINI_API_KEY;
if (useGemini && process.env.GEMINI_API_KEY) {
  aiDefinition = await getWordDefinitionGemini(word, context);
} else {
  aiDefinition = await getWordDefinition(word, context);
}
```

## Дополнительные ресурсы

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Models](https://ai.google.dev/models)
- [API Pricing](https://ai.google.dev/pricing)
