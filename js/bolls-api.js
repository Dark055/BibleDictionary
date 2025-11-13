const BOLLS_BASE_URL = 'https://bolls.life';

export async function fetchChapter(translation, book, chapter) {
  const url = `${BOLLS_BASE_URL}/get-text/${translation}/${book}/${chapter}/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bolls API error: ${response.status} ${response.statusText}`);
  }
  const verses = await response.json();
  return verses;
}

export async function fetchBooks(translation) {
  const url = `${BOLLS_BASE_URL}/get-books/${translation}/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bolls API error: ${response.status} ${response.statusText}`);
  }
  const books = await response.json();
  return books;
}

export async function fetchVerse(translation, book, chapter, verse) {
  const url = `${BOLLS_BASE_URL}/get-verse/${translation}/${book}/${chapter}/${verse}/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bolls API error: ${response.status} ${response.statusText}`);
  }
  const verseData = await response.json();
  return verseData;
}

export async function searchVerses(translation, query, options = {}) {
  const params = new URLSearchParams({
    search: query,
    match_case: options.matchCase ? 'true' : 'false',
    match_whole: options.matchWhole ? 'true' : 'false',
    limit: options.limit || 50,
    page: options.page || 1
  });

  if (options.book) {
    params.set('book', options.book);
  }

  const url = `${BOLLS_BASE_URL}/v2/find/${translation}?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bolls API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.results || [];
}
