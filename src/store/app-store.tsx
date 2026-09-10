import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type Progress = { chapterId: string; percent: number };
type AppState = {
  favorites: string[];
  bookmarks: string[];
  progress: Record<string, Progress>;
  toggleFavorite: (bookId: string) => void;
  toggleBookmark: (chapterId: string) => void;
  saveProgress: (bookId: string, chapterId: string, percent: number) => void;
};

const AppStore = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState(['khu-vuon-ben-o-cua', 'nghe-thuat-tap-trung']);
  const [bookmarks, setBookmarks] = useState<string[]>(['slow-2']);
  const [progress, setProgress] = useState<Record<string, Progress>>({
    'nhung-ngay-rat-cham': { chapterId: 'slow-2', percent: 64 },
  });

  const value = useMemo<AppState>(() => ({
    favorites,
    bookmarks,
    progress,
    toggleFavorite: (bookId) => setFavorites((current) => current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]),
    toggleBookmark: (chapterId) => setBookmarks((current) => current.includes(chapterId) ? current.filter((id) => id !== chapterId) : [...current, chapterId]),
    saveProgress: (bookId, chapterId, percent) => setProgress((current) => ({ ...current, [bookId]: { chapterId, percent } })),
  }), [bookmarks, favorites, progress]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStore);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
