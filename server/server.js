// server/server.js - Express сервер

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import wordRouter from './routes/word.js';
import searchRouter from './routes/search.js';

// Получить __dirname в ES модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузить переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/word', wordRouter);
app.use('/api/search', searchRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info endpoint (только для /api)
app.get('/api', (req, res) => {
  res.json({
    name: 'Bible App API',
    version: '1.0.0',
    endpoints: {
      '/api/word': 'POST - Get word definition',
      '/api/search': 'GET - Search Bible verses',
      '/health': 'GET - Health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📖 Bible App is ready!`);
  console.log(`\n🌐 Frontend:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/read.html`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/word (POST)`);
  console.log(`  - http://localhost:${PORT}/api/search?q=... (GET)`);
  console.log(`  - http://localhost:${PORT}/health (GET)\n`);
});
