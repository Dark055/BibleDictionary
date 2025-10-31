# ⚡ Быстрый старт за 5 минут

## 📋 Чеклист готовности

- [ ] Node.js 18+ установлен
- [ ] MongoDB запущен (локально или Atlas)
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
copy .env.example .env
```

Откройте `.env` и заполните:

```env
MONGODB_URI=mongodb://localhost:27017/bible-app
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ
PORT=3000
NODE_ENV=development
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

### MongoDB не работает?

```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Или используйте Atlas (облачный)
# https://www.mongodb.com/cloud/atlas
```

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
