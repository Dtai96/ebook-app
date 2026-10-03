import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { ReaderTheme } from '@/components/reader/reader-settings';

import { useAuth, type UserProfile } from '@/hooks/use-auth';
export type ReadingProgress = { chapterId: string; percent: number; updatedAt: number };
export type SavedBookmark = {
  id: string;
  bookId: string;
  chapterId: string;
  percent: number;
  paragraphIndex?: number;
  quote: string;
  note: string;
  createdAt: string;
};
export type ReaderPreferences = { fontSize: number; lineHeight: number; theme: ReaderTheme; speed: number };

type NewBookmark = Omit<SavedBookmark, 'id' | 'createdAt'>;
type AppState = {
  user: UserProfile | null;
  favorites: string[];
  bookmarks: SavedBookmark[];
  progress: Record<string, ReadingProgress>;
  readerPreferences: ReaderPreferences;
  toggleFavorite: (bookId: string) => void;
  saveBookmark: (bookmark: NewBookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  saveProgress: (bookId: string, chapterId: string, percent: number) => void;
  updateReaderPreferences: (preferences: Partial<ReaderPreferences>) => void;
};

const AppStore = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [readerPreferences, setReaderPreferences] = useState<ReaderPreferences>({ fontSize: 18, lineHeight: 1.72, theme: 'light', speed: 1 });

  const saveProgress = useCallback((bookId: string, chapterId: string, percent: number) => {
    const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? Math.round(percent) : 0));
    setProgress((current) => ({ ...current, [bookId]: { chapterId, percent: safePercent, updatedAt: Date.now() } }));
  }, []);

  const value = useMemo<AppState>(() => ({
    user,
    favorites,
    bookmarks,
    progress,
    readerPreferences,
    toggleFavorite: (bookId) => setFavorites((current) => current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]),
    saveBookmark: (bookmark) => setBookmarks((current) => {
      const index = current.findIndex((item) => item.chapterId === bookmark.chapterId && (bookmark.paragraphIndex !== undefined ? item.paragraphIndex === bookmark.paragraphIndex : item.percent === bookmark.percent));
      const saved: SavedBookmark = { ...bookmark, id: index >= 0 ? current[index].id : `${bookmark.chapterId}-${Date.now()}`, createdAt: 'Vừa xong' };
      return index < 0 ? [saved, ...current] : current.map((item, itemIndex) => itemIndex === index ? saved : item);
    }),
    removeBookmark: (bookmarkId) => setBookmarks((current) => current.filter((item) => item.id !== bookmarkId)),
    saveProgress,
    updateReaderPreferences: (preferences) => setReaderPreferences((current) => ({ ...current, ...preferences })),
  }), [bookmarks, favorites, progress, readerPreferences, user, saveProgress]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStore);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
