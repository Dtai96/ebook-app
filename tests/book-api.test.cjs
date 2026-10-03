const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/services/book-api.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const book = {
  id: 42, title: 'Pride and Prejudice', description: 'A novel', cover_url: 'http://example.test/storage/cover.jpg', language: 'en',
  view_count: 7, chapters_count: 2, author: { name: 'Jane Austen' }, category: { id: 3, name: 'Classics' },
  chapters: [{ id: 90, book_id: 42, number: 1, title: 'Chapter One' }],
};

function setup(responses) {
  const requests = [];
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, URLSearchParams,
    require: (name) => name === './api' ? {
      apiRequest: async (url) => { requests.push(url); return responses[requests.length - 1]; },
    } : require(name),
  }, { filename });
  return { bookApi: exports.bookApi, requests };
}

test('home maps real books, author names, covers, and categories', async () => {
  const { bookApi, requests } = setup([{ data: {
    new_books: [book], popular_books: [book], categories: [{ id: 3, name: 'Classics', books_count: 1 }],
  } }]);
  const home = await bookApi.home();
  assert.equal(requests[0], '/home');
  assert.equal(home.newBooks[0].author, 'Jane Austen');
  assert.equal(home.newBooks[0].language, 'en');
  assert.equal(home.newBooks[0].coverUrl, book.cover_url);
  assert.equal(home.popularBooks[0].chaptersCount, 2);
  assert.equal(home.categories[0].booksCount, 1);
});

test('search sends pagination and filters to backend', async () => {
  const { bookApi, requests } = setup([{ data: [book], meta: { current_page: 2, last_page: 3, total: 42 } }]);
  const result = await bookApi.list({ page: 2, categoryId: 3, query: 'Jane Austen', searchBy: 'author' });
  const url = new URL(requests[0], 'http://example.test');
  assert.equal(url.pathname, '/books');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('q'), 'Jane Austen');
  assert.equal(url.searchParams.get('search_by'), 'author');
  assert.equal(url.searchParams.get('category_id'), '3');
  assert.equal(result.total, 42);
  assert.equal(result.books[0].id, '42');
});

test('categories come from the public category endpoint', async () => {
  const { bookApi, requests } = setup([{ data: [{ id: 3, name: 'Classics', books_count: 42 }] }]);
  const categories = await bookApi.categories();
  assert.equal(requests[0], '/categories');
  assert.equal(categories[0].booksCount, 42);
});

test('detail and chapter map ordered summaries and real content', async () => {
  const { bookApi } = setup([
    { data: book },
    { data: { id: 90, book_id: 42, number: 1, title: 'Chapter One', content: 'First paragraph.\n\nSecond paragraph.' } },
  ]);
  const detail = await bookApi.detail('42');
  const chapter = await bookApi.chapter('90');
  assert.equal(detail.chapters[0].id, '90');
  assert.equal(chapter.bookId, '42');
  assert.deepEqual(Array.from(chapter.content), ['First paragraph.', 'Second paragraph.']);
});
