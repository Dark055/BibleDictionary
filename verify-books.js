import { readFileSync } from 'fs';
import { BIBLE_BOOKS } from './shared/bible-constants.js';
const bibleData = JSON.parse(readFileSync('./data/bible.json', 'utf-8'));

const bookTexts = {
  45: "Радостную Весть и вам, живущим в Риме",
  58: "многократно и многообразно говоривший в прошлом",
  59: "испытание вашей веры вырабатывает стойкость",
  65: "Пусть умножатся для вас милость, мир и любовь"
};

console.log('Проверка соответствия книг:\n');

for (let i = 1; i <= 66; i++) {
  const verses = bibleData.filter(v => v.book === i && v.chapter === 1);
  if (verses.length === 0) {
    console.log(`❌ Книга ${i} (${BIBLE_BOOKS[i-1]}): НЕ НАЙДЕНА`);
  } else {
    const firstVerse = verses.find(v => v.verse === 1);
    console.log(`✓ Книга ${i} - ${BIBLE_BOOKS[i-1]}: ${verses.length} стихов в главе 1`);
    
    if (bookTexts[i] && firstVerse) {
      const match = firstVerse.text.includes(bookTexts[i].slice(0, 20));
      if (match) {
        console.log(`  ✓ Текст соответствует`);
      } else {
        console.log(`  ❌ ОШИБКА! Ожидалось: "${bookTexts[i].slice(0, 30)}..."`);
        console.log(`  ❌ Получено: "${firstVerse.text.slice(0, 50)}..."`);
      }
    }
  }
}

console.log('\n=== НОВЫЙ ЗАВЕТ (детальная проверка) ===\n');

const ntBooks = [
  { num: 40, name: "От Матфея" },
  { num: 41, name: "От Марка" },
  { num: 42, name: "От Луки" },
  { num: 43, name: "От Иоанна" },
  { num: 44, name: "Деяния" },
  { num: 45, name: "Римлянам" },
  { num: 46, name: "1 Коринфянам" },
  { num: 47, name: "2 Коринфянам" },
  { num: 48, name: "Галатам" },
  { num: 49, name: "Ефесянам" },
  { num: 50, name: "Филиппийцам" },
  { num: 51, name: "Колоссянам" },
  { num: 52, name: "1 Фессалоникийцам" },
  { num: 53, name: "2 Фессалоникийцам" },
  { num: 54, name: "1 Тимофею" },
  { num: 55, name: "2 Тимофею" },
  { num: 56, name: "Титу" },
  { num: 57, name: "Филимону" },
  { num: 58, name: "Евреям" },
  { num: 59, name: "Иакова" },
  { num: 60, name: "1 Петра" },
  { num: 61, name: "2 Петра" },
  { num: 62, name: "1 Иоанна" },
  { num: 63, name: "2 Иоанна" },
  { num: 64, name: "3 Иоанна" },
  { num: 65, name: "Иуды" },
  { num: 66, name: "Откровение" }
];

ntBooks.forEach(book => {
  const verses = bibleData.filter(v => v.book === book.num && v.chapter === 1);
  const configName = BIBLE_BOOKS[book.num - 1];
  
  if (configName === book.name) {
    console.log(`✓ ${book.num}: ${book.name} - OK (${verses.length} стихов)`);
  } else {
    console.log(`❌ ${book.num}: Ожидалось "${book.name}", получено "${configName}"`);
  }
});
