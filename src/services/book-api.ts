import { API_BASE_URL, apiRequest } from './api';
import type { Book, BookCategory, Chapter } from '@/types/book';

type ApiChapter = { id: number; book_id: number; number: number; title: string; content?: string };
type ApiBook = {
  id: number; title: string; description: string | null; cover_url: string | null; language: string;
  view_count: number; chapters_count: number;
  author: { name: string }; category: { id: number; name: string };
  chapters?: ApiChapter[];
};
type ApiCategory = { id: number; name: string; books_count: number };
type Envelope<T> = { data: T };
type Page<T> = Envelope<T[]> & { meta: { current_page: number; last_page: number; total: number } };

const mapChapter = (chapter: ApiChapter): Chapter => ({
  id: String(chapter.id), bookId: String(chapter.book_id), number: chapter.number,
  title: chapter.title, content: chapter.content?.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean) ?? [],
});

const resolveCoverUrl = (coverUrl: string | null): string | null => {
  if (!coverUrl) return null;

  try {
    const apiUrl = new URL(API_BASE_URL);
    const resolvedUrl = new URL(coverUrl, `${apiUrl.origin}/`);
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(resolvedUrl.hostname)) {
      resolvedUrl.hostname = apiUrl.hostname;
      if (!resolvedUrl.port) resolvedUrl.port = apiUrl.port;
    }
    return resolvedUrl.toString();
  } catch {
    return coverUrl;
  }
};

const mapBook = (book: ApiBook): Book => ({
  id: String(book.id), title: book.title, author: book.author?.name ?? '', language: book.language,
  category: book.category?.name ?? '', categoryId: book.category?.id ?? 0,
  description: book.description ?? '', coverUrl: resolveCoverUrl(book.cover_url),
  viewCount: book.view_count, chaptersCount: book.chapters_count,
  chapters: book.chapters?.map(mapChapter) ?? [],
});

const mapCategory = (category: ApiCategory): BookCategory => ({
  id: category.id, name: category.name, booksCount: category.books_count,
});

export type BookListOptions = { page?: number; categoryId?: number; query?: string; searchBy?: 'title' | 'author'; sort?: 'newest' | 'popular' };

export const bookApi = {
  categories: async () => (await apiRequest<Envelope<ApiCategory[]>>('/categories')).data.map(mapCategory),
  home: async () => {
    const response = await apiRequest<Envelope<{ new_books: ApiBook[]; popular_books: ApiBook[]; categories: ApiCategory[] }>>('/home');
    return { newBooks: response.data.new_books.map(mapBook), popularBooks: response.data.popular_books.map(mapBook), categories: response.data.categories.map(mapCategory) };
  },
  list: async ({ page = 1, categoryId, query, searchBy = 'title', sort = 'newest' }: BookListOptions = {}) => {
    const params = new URLSearchParams({ page: String(page), per_page: '20', sort });
    if (categoryId) params.set('category_id', String(categoryId));
    if (query?.trim()) { params.set('q', query.trim()); params.set('search_by', searchBy); }
    const response = await apiRequest<Page<ApiBook>>(`/books?${params.toString()}`);
    return { books: response.data.map(mapBook), page: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total };
  },
  detail: async (id: string) => mapBook((await apiRequest<Envelope<ApiBook>>(`/books/${encodeURIComponent(id)}`)).data),
  chapter: async (id: string) => mapChapter((await apiRequest<Envelope<ApiChapter>>(`/chapters/${encodeURIComponent(id)}`)).data),
};
