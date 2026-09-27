export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '');

type ApiOptions = RequestInit & { token?: string | null };
type ErrorBody = { message?: string; errors?: Record<string, string[]> };
let sessionToken: string | null = null;
const unauthorizedListeners = new Set<() => void>();

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setApiToken(token: string | null) { sessionToken = token; }

export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token = sessionToken, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (requestOptions.body) requestHeaders.set('Content-Type', 'application/json');
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions, headers: requestHeaders, signal: requestOptions.signal ?? controller.signal,
    });
    const body = await response.text();
    let data: unknown;
    try { data = body ? JSON.parse(body) : undefined; } catch { data = undefined; }
    if (!response.ok) {
      if (response.status === 401 && token && token === sessionToken) {
        sessionToken = null;
        unauthorizedListeners.forEach((listener) => listener());
      }
      const error = (data ?? {}) as ErrorBody;
      const message = Object.values(error.errors ?? {}).flat().join('\n') || error.message;
      throw new ApiError(
        response.status === 429 ? 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau một phút.'
          : response.status >= 500 ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
          : message || 'Không thể thực hiện yêu cầu. Vui lòng thử lại.',
        response.status, error.errors,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  } finally {
    clearTimeout(timeout);
  }
}
