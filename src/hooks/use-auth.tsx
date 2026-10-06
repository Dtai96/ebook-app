import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ApiError, onUnauthorized, setApiToken } from '@/services/api';
import { authApi, type AuthResponse, type AuthUser } from '@/services/auth-api';
import { tokenStorage } from '@/services/token-storage';
import { personalLibraryApi } from '@/services/personal-library-api';

export type UserProfile = AuthUser & { initials: string; avatarUrl: string | null };
type AuthState = {
  user: UserProfile | null;
  initializing: boolean;
  sessionError: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, confirmation: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (changes: { name?: string; avatar_url?: string | null }) => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);
const profile = (user: AuthUser): UserProfile => ({
  ...user,
  avatarUrl: user.avatar_url,
  initials: user.name.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'MT',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const token = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onUnauthorized(() => {
      token.current = null;
      setUser(null);
      setSessionError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      void tokenStorage.remove().catch(() => setSessionError('Không thể xóa phiên đã hết hạn trên thiết bị.'));
    });
    void (async () => {
      try {
        const saved = await tokenStorage.get();
        if (!saved || !active) return;
        const result = await authApi.me(saved);
        if (!active) return;
        token.current = saved;
        setApiToken(saved);
        setUser(profile(result.user));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) await tokenStorage.remove();
        if (active) setSessionError(error instanceof Error ? error.message : 'Không thể khôi phục phiên đăng nhập.');
      } finally {
        if (active) setInitializing(false);
      }
    })().catch(() => { if (active) setSessionError('Không thể đọc phiên đăng nhập trên thiết bị.'); });
    return () => { active = false; unsubscribe(); };
  }, []);

  const acceptSession = useCallback(async (result: AuthResponse) => {
    try {
      await tokenStorage.set(result.token);
    } catch {
      await authApi.logout(result.token).catch(() => undefined);
      throw new Error('Không thể lưu phiên đăng nhập an toàn trên thiết bị. Vui lòng thử lại.');
    }
    token.current = result.token;
    setApiToken(result.token);
    setUser(profile(result.user));
    setSessionError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await acceptSession(await authApi.login(email.trim().toLowerCase(), password));
  }, [acceptSession]);
  const signUp = useCallback(async (name: string, email: string, password: string, confirmation: string) => {
    await acceptSession(await authApi.register(name.trim(), email.trim().toLowerCase(), password, confirmation));
  }, [acceptSession]);
  const signOut = useCallback(async () => {
    if (token.current) {
      try { await authApi.logout(token.current); } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) throw error;
      }
    }
    token.current = null;
    setApiToken(null);
    setUser(null);
    await tokenStorage.remove();
    setSessionError(null);
  }, []);

  const updateProfile = useCallback(async (changes: { name?: string; avatar_url?: string | null }) => {
    const result = await personalLibraryApi.updateProfile(changes);
    setUser(profile(result.user));
  }, []);

  const value = useMemo(() => ({ user, initializing, sessionError, isAdmin: user?.role === 'admin', signIn, signUp, signOut, updateProfile }),
    [user, initializing, sessionError, signIn, signUp, signOut, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
