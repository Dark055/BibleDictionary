// js/api-client.js - API клиент для взаимодействия с сервером (same-origin)

/**
 * Получить определение слова из API
 */
export async function getWordDefinition(word, verseRef, verseContext) {
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

    return await response.json();
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
