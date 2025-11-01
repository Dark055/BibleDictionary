// js/api-client.js - API клиент для взаимодействия с сервером (same-origin)

const CACHE_PREFIX = 'wordDef:';

function getCacheKey(word, verseRef) {
  return `${CACHE_PREFIX}${word.toLowerCase()}:${verseRef}`;
}

function getCachedDefinition(word, verseRef) {
  try {
    const cached = sessionStorage.getItem(getCacheKey(word, verseRef));
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedDefinition(word, verseRef, data) {
  try {
    sessionStorage.setItem(getCacheKey(word, verseRef), JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache definition:', e);
  }
}

/**
 * Получить определение слова из API
 */
export async function getWordDefinition(word, verseRef, verseContext) {
  const cached = getCachedDefinition(word, verseRef);
  if (cached) {
    console.log(`Client cache hit: ${word} in ${verseRef}`);
    return cached;
  }

  try {
    const response = await fetch(`/api/word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        word: word.toLowerCase(), 
        verseRef, 
        verseContext 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      const errorMsg = errorData.message ? `${errorData.error}: ${errorData.message}` : (errorData.error || `HTTP error! status: ${response.status}`);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedDefinition(word, verseRef, data);
    return data;
  } catch (error) {
    console.error('API Error (getWordDefinition):', error);
    throw error;
  }
}

/**
 * Поиск в Библии через API
 */
export async function searchBible(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search Error:', error);
    throw error;
  }
}

/**
 * Проверка доступности API
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`/health`);
    return response.ok;
  } catch (error) {
    console.error('API недоступен:', error);
    return false;
  }
}
