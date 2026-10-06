import { apiRequest } from './api';
import type { ApiReaderPreferences } from './auth-api';

type Envelope<T> = { data: T };
type ApiProgress = { book_id: number; chapter_id: number; progress: number; last_read_at: string | null };
type ApiBookmark = { id: number; book_id: number; chapter_id: number; position: number; percent: number; quote: string; note: string | null; created_at: string };

export type PersonalData = {
  favorites: string[];
  bookmarks: { id: string; bookId: string; chapterId: string; percent: number; paragraphIndex: number; quote: string; note: string; createdAt: string }[];
  progress: Record<string, { chapterId: string; percent: number; updatedAt: number }>;
};

export const personalLibraryApi = {
  load: async (): Promise<PersonalData> => {
    const [favorites, bookmarks, progress] = await Promise.all([
      apiRequest<Envelope<number[]>>('/favorites'),
      apiRequest<Envelope<ApiBookmark[]>>('/bookmarks'),
      apiRequest<Envelope<ApiProgress[]>>('/reading-progress'),
    ]);
    return {
      favorites: favorites.data.map(String),
      bookmarks: bookmarks.data.map((item) => ({
        id: String(item.id), bookId: String(item.book_id), chapterId: String(item.chapter_id),
        percent: Number(item.percent), paragraphIndex: item.position, quote: item.quote, note: item.note ?? '',
        createdAt: new Date(item.created_at).toLocaleDateString('vi-VN'),
      })),
      progress: Object.fromEntries(progress.data.map((item) => [String(item.book_id), {
        chapterId: String(item.chapter_id), percent: Math.round(Number(item.progress)),
        updatedAt: item.last_read_at ? new Date(item.last_read_at).getTime() : 0,
      }])),
    };
  },
  addFavorite: (bookId: string) => apiRequest(`/books/${encodeURIComponent(bookId)}/favorite`, { method: 'POST' }),
  removeFavorite: (bookId: string) => apiRequest<void>(`/books/${encodeURIComponent(bookId)}/favorite`, { method: 'DELETE' }),
  saveProgress: (bookId: string, chapterId: string, progress: number) => apiRequest(`/books/${encodeURIComponent(bookId)}/reading-progress`, {
    method: 'PUT', body: JSON.stringify({ chapter_id: Number(chapterId), progress }),
  }),
  saveBookmark: (bookmark: { bookId: string; chapterId: string; percent: number; paragraphIndex: number; quote: string; note: string }) => apiRequest<Envelope<ApiBookmark>>('/bookmarks', {
    method: 'POST', body: JSON.stringify({ book_id: Number(bookmark.bookId), chapter_id: Number(bookmark.chapterId), position: bookmark.paragraphIndex, percent: bookmark.percent, quote: bookmark.quote, note: bookmark.note }),
  }),
  removeBookmark: (bookmarkId: string) => apiRequest<void>(`/bookmarks/${encodeURIComponent(bookmarkId)}`, { method: 'DELETE' }),
  updatePreferences: (preferences: ApiReaderPreferences) => apiRequest('/reader-preferences', { method: 'PATCH', body: JSON.stringify(preferences) }),
  updateProfile: (profile: { name?: string; avatar_url?: string | null }) => apiRequest<{ user: { id: number; name: string; email: string; role: 'reader' | 'admin'; avatar_url: string | null; preferences: ApiReaderPreferences } }>('/me', {
    method: 'PATCH', body: JSON.stringify(profile),
  }),
};
