# 🚀 Инструкция по запуску Bible App (Vanilla JS)

## Предварительные требования

- **Node.js** версии 18 или выше
- **MongoDB** (локальный или удаленный)
- **OpenRouter API Key** (для AI-определений слов)

## 📦 Шаг 1: Установка зависимостей

```bash
cd bible-app-vanilla
npm install
```

## ⚙️ Шаг 2: Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
copy .env.example .env
```

Отредактируйте `.env` и укажите свои параметры:

```env
MONGODB_URI=mongodb://localhost:27017/bible-app
OPENROUTER_API_KEY=ваш_ключ_api
PORT=3000
NODE_ENV=development
```

### Получение OpenRouter API Key

1. Зарегистрируйтесь на https://openrouter.ai/
2. Перейдите в настройки API
3. Создайте новый ключ
4. Скопируйте его в `.env`

## 🗄️ Шаг 3: MongoDB

### Локальная установка MongoDB

**Windows:**
```bash
# Скачайте MongoDB Community Server
# https://www.mongodb.com/try/download/community

# После установки запустите службу
net start MongoDB
```

**Linux/Mac:**
```bash
# Установка через package manager
brew install mongodb-community  # Mac
sudo apt install mongodb         # Ubuntu/Debian

# Запуск
brew services start mongodb-community  # Mac
sudo systemctl start mongodb           # Linux
```

### Или используйте MongoDB Atlas (облачный)

1. Создайте аккаунт на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер
3. Получите строку подключения
4. Укажите ее в `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bible-app?retryWrites=true&w=majority
```

## 🎨 Шаг 4: Сборка CSS

Скомпилируйте TailwindCSS:

```bash
npm run build:css
```

Или запустите в режиме watch (автоматическая пересборка):

```bash
npm run watch:css
```

## 🚀 Шаг 5: Запуск сервера

```bash
npm run server
```

Или с автоперезагрузкой (режим разработки):

```bash
npm run dev
```

Сервер запустится на **http://localhost:3000**

## 🌐 Шаг 6: Открытие веб-приложения

### Вариант A: Использовать Live Server (рекомендуется)

```bash
# Установить глобально
npm install -g live-server

# Запустить
live-server --port=8080 --no-browser
```

Откройте браузер: **http://localhost:8080**

### Вариант B: Открыть напрямую

Откройте `index.html` в браузере (могут быть проблемы с CORS)

### Вариант C: Использовать расширение VS Code

Установите расширение **Live Server** в VS Code, затем:
- Правый клик на `index.html`
- "Open with Live Server"

## ✅ Проверка работоспособности

1. **API сервер работает:**
   ```bash
   curl http://localhost:3000/health
   ```
   
2. **Главная страница загружается:**
   - Откройте http://localhost:8080
   - Должны увидеть библиотеку книг

3. **Поиск работает:**
   - Введите слово в поиске
   - Должны появиться результаты

4. **Определения слов:**
   - Откройте любую книгу
   - Кликните на слово
   - Должен появиться тултип с определением (первый раз медленнее из-за AI-генерации)

## 🐛 Решение проблем

### Проблема: "MONGODB_URI is not defined"

**Решение:** Убедитесь, что файл `.env` создан и содержит правильные данные

### Проблема: "CORS error"

**Решение:** 
- Используйте Live Server, не открывайте HTML напрямую
- Убедитесь, что API сервер запущен на порту 3000

### Проблема: "Failed to fetch definition"

**Решение:**
- Проверьте OpenRouter API Key в `.env`
- Проверьте соединение с MongoDB
- Посмотрите логи сервера в консоли

### Проблема: "Bible data not loaded"

**Решение:**
- Убедитесь, что файл `data/bible.json` существует
- Проверьте путь к файлу

## 📚 Структура проекта

```
bible-app-vanilla/
├── index.html           # Главная страница
├── read.html            # Страница чтения
├── css/
│   ├── input.css       # Исходный TailwindCSS
│   └── styles.css      # Скомпилированный CSS
├── js/
│   ├── config.js       # Константы
│   ├── utils.js        # Утилиты
│   ├── bible-data.js   # Работа с данными
│   ├── api-client.js   # API клиент
│   ├── components/     # UI компоненты
│   └── pages/          # Логика страниц
├── data/
│   └── bible.json      # Данные Библии
└── server/
    ├── server.js       # Express сервер
    ├── routes/         # API роуты
    └── lib/            # Библиотеки
```

## 🔥 Полный запуск за 5 минут

```bash
# 1. Установить зависимости
npm install

# 2. Настроить .env
copy .env.example .env
# Отредактировать .env

# 3. Собрать CSS
npm run build:css

# 4. В одном терминале - запустить сервер
npm run dev

# 5. В другом терминале - запустить Live Server
npx live-server --port=8080

# 6. Открыть браузер
# http://localhost:8080
```

## 📞 Поддержка

Если возникли проблемы, проверьте:
1. Логи сервера в консоли
2. Консоль браузера (F12)
3. Network tab в DevTools

---

**Готово! 🎉** Приятного использования!
