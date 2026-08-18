/**
 * App-wide configuration constants.
 * Point COMPANY_VIDEO_URL at the real Peak Financial YouTube channel/playlist.
 * If the URL contains a `list=` playlist param, the Company Videos window
 * embeds that playlist in-app; otherwise it falls back to opening the URL
 * in a new browser tab.
 */
export const COMPANY_VIDEO_URL =
  'https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE';

export const ADVISOR_NAME = 'Dave Pearson';
export const COMPANY_NAME = 'Peak Financial Network Solutions';

export const DEFAULT_BOOKING_URL = 'https://calendly.com/dave-peakfinancial/30min';

export const BOOKING_COPY_MESSAGE = (link: string) =>
  `Here's my calendar — grab any time that works for you: ${link}`;

/** Below this viewport width the free-floating window model collapses to stacked cards. */
export const MOBILE_BREAKPOINT = 900;

/** Extracts a YouTube playlist id from a channel/playlist URL, or null. */
export function youtubePlaylistId(url: string): string | null {
  try {
    return new URL(url).searchParams.get('list');
  } catch {
    return null;
  }
}
