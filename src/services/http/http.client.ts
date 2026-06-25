import { appConfig } from '@config/index';
import { CLIENT_PLATFORM, SHARED_HEADERS } from '@constants/index';
import { logger } from '@utils/logger';
import type { ApiResponse } from '@types/api.types';

export interface HttpOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
  baseUrl?: string;
}

/**
 * Lightweight `fetch` wrapper used for one-off calls that don't go
 * through RTK Query (e.g. bootstrap, file uploads, public health probes).
 *
 * Always returns the canonical `ApiResponse<T>` envelope so consumers
 * have a single shape to switch on.
 */
class HttpClient {
  private getDeviceId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const KEY = 'w11.device.id';
      let id = window.localStorage.getItem(KEY);
      if (!id) {
        id = crypto.randomUUID();
        window.localStorage.setItem(KEY, id);
      }
      return id;
    } catch {
      return undefined;
    }
  }

  private buildHeaders(init?: HeadersInit): Headers {
    const headers = new Headers(init);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (!headers.has(SHARED_HEADERS.CLIENT_PLATFORM))
      headers.set(SHARED_HEADERS.CLIENT_PLATFORM, CLIENT_PLATFORM);
    if (!headers.has(SHARED_HEADERS.CLIENT_VERSION))
      headers.set(SHARED_HEADERS.CLIENT_VERSION, appConfig.appVersion);

    const deviceId = this.getDeviceId();
    if (deviceId && !headers.has(SHARED_HEADERS.DEVICE_ID))
      headers.set(SHARED_HEADERS.DEVICE_ID, deviceId);

    return headers;
  }

  async request<T>(path: string, options: HttpOptions = {}): Promise<ApiResponse<T>> {
    const { body, timeoutMs = appConfig.api.timeoutMs, baseUrl, headers, ...rest } = options;
    const url = `${baseUrl ?? appConfig.api.fullBaseUrl}${path}`;

    const finalHeaders = this.buildHeaders(headers);
    let payload: BodyInit | undefined;

    if (body !== undefined && body !== null) {
      if (body instanceof FormData || body instanceof Blob) {
        payload = body;
      } else {
        finalHeaders.set('Content-Type', 'application/json');
        payload = JSON.stringify(body);
      }
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...rest,
        headers: finalHeaders,
        body: payload,
        signal: rest.signal ?? ctrl.signal,
        credentials: rest.credentials ?? 'include',
      });

      const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;
      if (json && typeof json === 'object' && 'success' in json) return json;

      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: `Malformed response (status ${response.status})` },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      logger.warn('http.request failed', { url, err });
      const aborted = (err as { name?: string }).name === 'AbortError';
      return {
        success: false,
        error: {
          code: aborted ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
          message: aborted ? 'Request timed out' : 'Network error',
        },
        timestamp: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string, options?: HttpOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: HttpOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T>(path: string, body?: unknown, options?: HttpOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  patch<T>(path: string, body?: unknown, options?: HttpOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options?: HttpOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
export type { HttpClient };
