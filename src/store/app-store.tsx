import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { ReaderTheme } from '@/components/reader/reader-settings';
import { personalLibraryApi } from '@/services/personal-library-api';
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
  dataError: string | null;
  toggleFavorite: (bookId: string) => void;
  saveBookmark: (bookmark: NewBookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  saveProgress: (bookId: string, chapterId: string, percent: number) => void;
  updateReaderPreferences: (preferences: Partial<ReaderPreferences>) => void;
};

const defaultPreferences: ReaderPreferences = { fontSize: 18, lineHeight: 1.72, theme: 'light', speed: 1 };
const AppStore = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [readerPreferences, setReaderPreferences] = useState<ReaderPreferences>(defaultPreferences);
  const [dataError, setDataError] = useState<string | null>(null);
  const progressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const preferenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPreferences = useRef<Partial<ReaderPreferences>>({});
  const activeUserId = user?.id;

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setDataError(null);
      if (!user) {
        setFavorites([]);
        setBookmarks([]);
        setProgress({});
        setReaderPreferences(defaultPreferences);
        return;
      }

      setReaderPreferences({
        ...defaultPreferences,
        fontSize: user.preferences.font_size ?? defaultPreferences.fontSize,
        lineHeight: user.preferences.line_height ?? defaultPreferences.lineHeight,
        theme: user.preferences.theme ?? defaultPreferences.theme,
        speed: user.preferences.speed ?? defaultPreferences.speed,
      });
      setFavorites([]);
      setBookmarks([]);
      setProgress({});
      void personalLibraryApi.load().then((data) => {
        if (!active) return;
        setFavorites(data.favorites);
        setBookmarks(data.bookmarks);
        setProgress(data.progress);
      }).catch((error: unknown) => {
        if (active) setDataError(error instanceof Error ? error.message : 'Không tải được dữ liệu cá nhân.');
      });
    });
    return () => {
      active = false;
      Object.values(progressTimers.current).forEach(clearTimeout);
      progressTimers.current = {};
      if (preferenceTimer.current) clearTimeout(preferenceTimer.current);
      preferenceTimer.current = null;
      pendingPreferences.current = {};
    };
  }, [user]);

  const saveProgress = useCallback((bookId: string, chapterId: string, percent: number) => {
    const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? Math.round(percent) : 0));
    setProgress((current) => ({ ...current, [bookId]: { chapterId, percent: safePercent, updatedAt: Date.now() } }));
    const previousTimer = progressTimers.current[bookId];
    if (previousTimer) clearTimeout(previousTimer);
    if (!activeUserId) return;
    progressTimers.current[bookId] = setTimeout(() => {
      void personalLibraryApi.saveProgress(bookId, chapterId, safePercent).catch((error: unknown) => {
        setDataError(error instanceof Error ? error.message : 'Không lưu được tiến độ đọc.');
      });
    }, 700);
  }, [activeUserId]);

  const toggleFavorite = useCallback((bookId: string) => {
    const adding = !favorites.includes(bookId);
    setFavorites((current) => {
      return adding ? (current.includes(bookId) ? current : [bookId, ...current]) : current.filter((id) => id !== bookId);
    });
    if (activeUserId) {
      const request = adding ? personalLibraryApi.addFavorite(bookId) : personalLibraryApi.removeFavorite(bookId);
      void request.catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'Không cập nhật được sách yêu thích.'));
    }
  }, [activeUserId, favorites]);

  const saveBookmark = useCallback((bookmark: NewBookmark) => {
    const paragraphIndex = bookmark.paragraphIndex ?? 0;
    const existing = bookmarks.find((item) => item.chapterId === bookmark.chapterId && item.paragraphIndex === paragraphIndex);
    const id = existing?.id ?? `local-${bookmark.chapterId}-${paragraphIndex}`;
    const saved: SavedBookmark = { ...bookmark, paragraphIndex, id, createdAt: existing?.createdAt ?? new Date().toLocaleDateString('vi-VN') };
    setBookmarks((current) => [saved, ...current.filter((item) => !(item.chapterId === bookmark.chapterId && item.paragraphIndex === paragraphIndex))]);
    if (activeUserId) {
      void personalLibraryApi.saveBookmark({ ...bookmark, paragraphIndex }).then(({ data }) => {
        setBookmarks((current) => current.map((item) => item.id === id ? { ...item, id: String(data.id) } : item));
      }).catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'Không lưu được bookmark.'));
    }
  }, [activeUserId, bookmarks]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((current) => current.filter((item) => item.id !== bookmarkId));
    if (activeUserId && !bookmarkId.startsWith('local-')) {
      void personalLibraryApi.removeBookmark(bookmarkId).catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'Không xóa được bookmark.'));
    }
  }, [activeUserId]);

  const updateReaderPreferences = useCallback((changes: Partial<ReaderPreferences>) => {
    setReaderPreferences((current) => ({ ...current, ...changes }));
    if (!activeUserId) return;
    pendingPreferences.current = { ...pendingPreferences.current, ...changes };
    if (preferenceTimer.current) clearTimeout(preferenceTimer.current);
    preferenceTimer.current = setTimeout(() => {
      const queued = pendingPreferences.current;
      pendingPreferences.current = {};
      const payload = {
        ...(queued.fontSize !== undefined ? { font_size: queued.fontSize } : {}),
        ...(queued.lineHeight !== undefined ? { line_height: queued.lineHeight } : {}),
        ...(queued.theme !== undefined ? { theme: queued.theme } : {}),
        ...(queued.speed !== undefined ? { speed: queued.speed } : {}),
      };
      void personalLibraryApi.updatePreferences(payload).catch((error: unknown) => {
        setDataError(error instanceof Error ? error.message : 'Không lưu được tùy chọn đọc.');
      });
    }, 450);
  }, [activeUserId]);

  const value = useMemo<AppState>(() => ({
    user, favorites, bookmarks, progress, readerPreferences, dataError,
    toggleFavorite, saveBookmark, removeBookmark, saveProgress, updateReaderPreferences,
  }), [user, favorites, bookmarks, progress, readerPreferences, dataError, toggleFavorite, saveBookmark, removeBookmark, saveProgress, updateReaderPreferences]);

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStore);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
