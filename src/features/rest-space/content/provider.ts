import type { DateKey } from '../shared/types';
import type { ContentTheme, ProviderCandidate } from './types';

export type ContentProviderQuery = {
  dateKey: DateKey;
  preferredThemes: ContentTheme[];
  locale: 'zh-CN' | 'en-US';
  timeoutMs: number;
};

export type ContentProviderErrorCode = 'provider_timeout' | 'rate_limited' | 'network_failed' | 'provider_unavailable';

export type ContentProviderError = {
  code: ContentProviderErrorCode;
  message: string;
  recoverable: true;
};

export type ContentProviderResult =
  | { ok: true; candidates: ProviderCandidate[] }
  | { ok: false; error: ContentProviderError };

export type ContentProvider = {
  id: string;
  searchDailyMoment: (query: ContentProviderQuery) => Promise<ContentProviderResult>;
};

export function providerError(code: ContentProviderErrorCode, message: string): ContentProviderError {
  return {
    code,
    message,
    recoverable: true,
  };
}