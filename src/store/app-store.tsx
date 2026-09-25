import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import type { ReaderTheme } from '@/components/reader/reader-settings';

export type UserProfile = { name: string; email: string; initials: string };
export type ReadingProgress = { chapterId: string; percent: number };
export type SavedBookmark = {
  id: string;
  bookId: string;
  chapterId: string;
  percent: number;
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
  signIn: (email: string) => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;
  toggleFavorite: (bookId: string) => void;
  saveBookmark: (bookmark: NewBookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  saveProgress: (bookId: string, chapterId: string, percent: number) => void;
  updateReaderPreferences: (preferences: Partial<ReaderPreferences>) => void;
};

const AppStore = createContext<AppState | null>(null);

function initialsFromName(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'MT';
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>({ name: 'Duy Trần', email: 'duy.reader@example.com', initials: 'DT' });
  const [favorites, setFavorites] = useState(['khu-vuon-ben-o-cua', 'nghe-thuat-tap-trung']);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([
    {
      id: 'slow-2-64',
      bookId: 'nhung-ngay-rat-cham',
      chapterId: 'slow-2',
      percent: 64,
      quote: 'Ta đang tìm điều gì? Có lẽ không phải một nơi chốn, mà là cảm giác được sống trọn vẹn trong từng khoảnh khắc.',
      note: 'Đọc lại khi cần chậm lại.',
      createdAt: 'Hôm nay, 08:42',
    },
  ]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({
    'nhung-ngay-rat-cham': { chapterId: 'slow-2', percent: 64 },
  });
  const [readerPreferences, setReaderPreferences] = useState<ReaderPreferences>({ fontSize: 18, lineHeight: 1.72, theme: 'light', speed: 1 });

  const value = useMemo<AppState>(() => ({
    user,
    favorites,
    bookmarks,
    progress,
    readerPreferences,
    signIn: (email) => {
      const localName = email.split('@')[0].replace(/[._-]+/g, ' ');
      const name = localName.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Bạn đọc';
      setUser({ name, email, initials: initialsFromName(name) });
    },
    signUp: (name, email) => setUser({ name: name.trim(), email: email.trim(), initials: initialsFromName(name) }),
    signOut: () => setUser(null),
    toggleFavorite: (bookId) => setFavorites((current) => current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]),
    saveBookmark: (bookmark) => setBookmarks((current) => {
      const index = current.findIndex((item) => item.chapterId === bookmark.chapterId && item.percent === bookmark.percent);
      const saved: SavedBookmark = { ...bookmark, id: index >= 0 ? current[index].id : `${bookmark.chapterId}-${Date.now()}`, createdAt: 'Vừa xong' };
      return index < 0 ? [saved, ...current] : current.map((item, itemIndex) => itemIndex === index ? saved : item);
    }),
    removeBookmark: (bookmarkId) => setBookmarks((current) => current.filter((item) => item.id !== bookmarkId)),
    saveProgress: (bookId, chapterId, percent) => setProgress((current) => ({ ...current, [bookId]: { chapterId, percent } })),
    updateReaderPreferences: (preferences) => setReaderPreferences((current) => ({ ...current, ...preferences })),
  }), [bookmarks, favorites, progress, readerPreferences, user]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStore);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
