import type { ContentProvider, ContentProviderQuery, ContentProviderResult } from './provider';
import { providerError } from './provider';
import type { ContentMood, ContentTheme, ProviderCandidate } from './types';

type WikimediaPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url?: string;
    width?: number;
    height?: number;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

type WikimediaSearchResponse = {
  query?: {
    pages?: Record<string, WikimediaPage>;
  };
};

const themeCategoryTitles: Record<ContentTheme, string> = {
  forest: 'Category:Featured pictures of forests',
  lake: 'Category:Featured pictures of lakes',
  meadow: 'Category:Featured pictures of landscapes',
  mountain: 'Category:Featured pictures of mountains',
  ocean: 'Category:Featured pictures of landscapes',
  rain: 'Category:Featured pictures of rain',
  sky: 'Category:Featured pictures of clouds',
  stars: 'Category:Featured pictures of astronomy',
};

const themeMoods: Record<ContentTheme, ContentMood> = {
  forest: 'calm',
  lake: 'quiet',
  meadow: 'fresh',
  mountain: 'calm',
  ocean: 'soft',
  rain: 'quiet',
  sky: 'soft',
  stars: 'quiet',
};

export const wikimediaCommonsProvider: ContentProvider = {
  id: 'wikimedia-commons',
  searchDailyMoment: searchWikimediaDailyMoment,
};

async function searchWikimediaDailyMoment(query: ContentProviderQuery): Promise<ContentProviderResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), query.timeoutMs);

  try {
    const theme = pickTheme(query.preferredThemes, query.dateKey);
    const response = await fetch(buildCommonsUrl(theme), { signal: controller.signal });

    if (!response.ok) {
      return { ok: false, error: providerError('provider_unavailable', `Wikimedia Commons returned ${response.status}`) };
    }

    const payload = (await response.json()) as WikimediaSearchResponse;
    const candidates = rotateCandidates(toCandidates(payload, theme, query.dateKey), query.dateKey);

    return { ok: true, candidates };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, error: providerError('provider_timeout', 'Wikimedia Commons request timed out') };
    }

    return { ok: false, error: providerError('network_failed', 'Unable to reach Wikimedia Commons') };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function buildCommonsUrl(theme: ContentTheme): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'categorymembers',
    gcmtitle: themeCategoryTitles[theme],
    gcmtype: 'file',
    gcmlimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
  });

  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
}

function toCandidates(payload: WikimediaSearchResponse, theme: ContentTheme, dateKey: string): ProviderCandidate[] {
  return Object.values(payload.query?.pages ?? {})
    .map((page) => toCandidate(page, theme, dateKey))
    .filter((candidate): candidate is ProviderCandidate => Boolean(candidate));
}

function toCandidate(page: WikimediaPage, theme: ContentTheme, dateKey: string): ProviderCandidate | undefined {
  const imageInfo = page.imageinfo?.[0];
  const remoteUrl = imageInfo?.url;
  const mime = imageInfo?.mime ?? '';

  if (!remoteUrl || !mime.startsWith('image/')) {
    return undefined;
  }

  const licenseNote = cleanHtml(imageInfo?.extmetadata?.LicenseShortName?.value ?? imageInfo?.extmetadata?.UsageTerms?.value ?? '');
  const artist = cleanHtml(imageInfo?.extmetadata?.Artist?.value ?? '');
  const credit = cleanHtml(imageInfo?.extmetadata?.Credit?.value ?? '');

  return {
    id: `wikimedia-${page.pageid}-${dateKey}`,
    sourceProvider: 'wikimedia-commons',
    providerAssetId: String(page.pageid),
    remoteUrl,
    title: cleanTitle(page.title),
    mediaType: 'visual',
    width: imageInfo?.width,
    height: imageInfo?.height,
    licenseNote,
    attribution: artist || credit || 'Wikimedia Commons contributor',
    theme,
    mood: themeMoods[theme],
    quality: imageInfo?.width && imageInfo.width >= 2400 ? 'high' : 'medium',
    matchingTags: [theme, 'nature', 'landscape'],
  };
}

function pickTheme(themes: ContentTheme[], dateKey: string): ContentTheme {
  const availableThemes = themes.length > 0 ? themes : (Object.keys(themeCategoryTitles) as ContentTheme[]);
  const index = Math.abs(hashString(dateKey)) % availableThemes.length;

  return availableThemes[index];
}

function rotateCandidates(candidates: ProviderCandidate[], dateKey: string): ProviderCandidate[] {
  if (candidates.length <= 1) {
    return candidates;
  }

  const startIndex = Math.abs(hashString(dateKey)) % candidates.length;

  return [...candidates.slice(startIndex), ...candidates.slice(0, startIndex)];
}

function cleanTitle(title: string): string {
  return title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

function cleanHtml(value: string): string {
  const documentValue = new DOMParser().parseFromString(value, 'text/html');
  return documentValue.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function hashString(value: string): number {
  return Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0);
}