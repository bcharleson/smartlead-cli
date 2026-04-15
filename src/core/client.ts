import type { SmartleadClient as ISmartleadClient } from './types.js';
import {
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  SmartleadError,
} from './errors.js';
import { VERSION } from './version.js';

const BASE_URL = 'https://server.smartlead.ai/api/v1';
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30_000;
const WRITE_TIMEOUT = 15_000;

interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export class SmartleadClient implements ISmartleadClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.maxRetries = options.maxRetries ?? MAX_RETRIES;
    this.timeout = options.timeout ?? REQUEST_TIMEOUT;
  }

  async request<T>(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  }): Promise<T> {
    const url = new URL(this.baseUrl + options.path);

    // Smartlead auth: api_key is always a query param
    url.searchParams.set('api_key', this.apiKey);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'User-Agent': `smartlead-cli/${VERSION}`,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: Error | undefined;
    const isWrite = options.method !== 'GET';
    const effectiveTimeout = isWrite ? Math.min(this.timeout, WRITE_TIMEOUT) : this.timeout;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

        const response = await fetch(url.toString(), {
          method: options.method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          if (!text) return undefined as T;
          // Smartlead's write endpoints (notably DELETE /campaigns/{id}/leads/{id})
          // sometimes return plain text like "success" instead of JSON, despite
          // what the published docs claim. Tolerate both shapes.
          const trimmed = text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              return JSON.parse(trimmed) as T;
            } catch {
              // fall through to plain-text envelope
            }
          }
          return { ok: true, message: trimmed } as T;
        }

        const errorBody = await response.text().catch(() => '');
        let errorMessage: string;
        try {
          const parsed = JSON.parse(errorBody);
          errorMessage = parsed.message || parsed.error || parsed.err || errorBody;
        } catch {
          errorMessage = errorBody || response.statusText;
        }

        switch (response.status) {
          case 401:
          case 403:
            throw new AuthError(errorMessage);
          case 404:
            throw new NotFoundError(errorMessage);
          case 400:
          case 422:
            throw new ValidationError(errorMessage);
          case 429: {
            const retryAfter = parseInt(response.headers.get('retry-after') ?? '', 10);
            const err = new RateLimitError(
              errorMessage,
              isNaN(retryAfter) ? 2 : retryAfter,
            );
            if (attempt < this.maxRetries) {
              // Smartlead rate limit: 10 req/2s — wait at least 2s
              const delay = err.retryAfter
                ? err.retryAfter * 1000
                : Math.max(2_000, Math.min(1000 * Math.pow(2, attempt), 10_000));
              await sleep(delay);
              lastError = err;
              continue;
            }
            throw err;
          }
          default:
            if (response.status >= 500) {
              const err = new ServerError(errorMessage, response.status);
              if (attempt < this.maxRetries) {
                await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
                lastError = err;
                continue;
              }
              throw err;
            }
            throw new SmartleadError(errorMessage, 'API_ERROR', response.status);
        }
      } catch (error) {
        if (error instanceof SmartleadError) throw error;

        const isAbort =
          error instanceof Error &&
          (error.name === 'AbortError' || String(error.message).includes('aborted'));

        if (isAbort) {
          lastError = new SmartleadError(
            `Request timed out after ${effectiveTimeout / 1000}s: ${options.method} ${options.path}`,
            'TIMEOUT',
          );
          if (!isWrite && attempt < this.maxRetries) {
            await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
            continue;
          }
          throw lastError;
        }

        if (error instanceof TypeError && String(error.message).includes('fetch')) {
          throw new SmartleadError(`Network error: ${error.message}`, 'NETWORK_ERROR');
        }

        throw error;
      }
    }

    throw lastError ?? new SmartleadError('Request failed after retries', 'MAX_RETRIES');
  }

  async get<T>(path: string, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  async post<T>(path: string, body?: unknown, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'POST', path, query, body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async delete<T>(path: string, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, query });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
