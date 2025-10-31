# ⚡ Быстрый старт за 5 минут

## 📋 Чеклист готовности

- [ ] Node.js 18+ установлен
- [ ] OpenRouter API Key получен

## 🚀 Команды для запуска

### 1️⃣ Установка (1 минута)

```bash
cd bible-app-vanilla
npm install
```

### 2️⃣ Конфигурация (2 минуты)

Создайте `.env`:

```bash
copy .env .env
```

Откройте `.env` и заполните:

```env
AI_API_KEY=your_openrouter_api_key_here
AI_API_URL=https://api.intelligence.io.solutions/api/v1/chat/completions
AI_MODEL=minimax/minimax-m2:free
PORT=3000
```

**Где взять API Key:**
- https://openrouter.ai/ → Sign up → API Keys → Create

### 3️⃣ Сборка CSS (30 секунд)

```bash
npm run build:css
```

### 4️⃣ Запуск (1 минута)

**Терминал 1 - Backend:**
```bash
npm run dev
```

**Терминал 2 - Frontend:**
```bash
npx live-server --port=8080
```

### 5️⃣ Открыть браузер

http://localhost:8080

---

## 🎯 Проверка работы

1. ✅ Главная страница загрузилась
2. ✅ Видна библиотека из 66 книг
3. ✅ Поиск работает (введите "любовь")
4. ✅ Можно открыть любую книгу
5. ✅ Клик по слову показывает определение

---

## 🐛 Быстрое решение проблем

### CORS ошибка?

Используйте **live-server**, не открывайте HTML напрямую!

### API ключ не работает?

Проверьте баланс на https://openrouter.ai/settings/usage

---

## 📊 Архитектура

```
Frontend (Live Server :8080)
    ↓
HTML + Vanilla JS
    ↓
API (Express :3000)
    ↓
MongoDB + OpenRouter AI
```

---

## 🎉 Готово!

Теперь можно изучать Библию с AI-поддержкой!

**Полная документация:**
- `SETUP.md` - детальная инструкция
- `MIGRATION_SUMMARY.md` - что было сделано
- `README.md` - описание проекта
