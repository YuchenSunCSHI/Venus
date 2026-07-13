export type Result<TValue, TError extends RecoverableError = RecoverableError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export type RecoverableError = {
  code: string;
  message: string;
  recoverable: true;
};

export type DateKey = `${number}-${number}-${number}`;

export type SourceMetadata = {
  sourceType: 'online' | 'cache' | 'bundledFallback' | 'silenceFallback';
  provider: string;
  providerAssetId?: string;
  licenseNote: string;
  attribution?: string;
  cachedAt?: string;
  expiresAt?: string;
};