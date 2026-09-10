import { apiRequest } from './api';
import { Book, Chapter } from '@/types/book';

export const bookApi = {
  list: () => apiRequest<Book[]>('/books'),
  detail: (id: string) => apiRequest<Book>(`/books/${id}`),
  chapters: (bookId: string) => apiRequest<Chapter[]>(`/books/${bookId}/chapters`),
  chapter: (id: string) => apiRequest<Chapter>(`/chapters/${id}`),
  search: (query: string) => apiRequest<Book[]>(`/search?q=${encodeURIComponent(query)}`),
};
