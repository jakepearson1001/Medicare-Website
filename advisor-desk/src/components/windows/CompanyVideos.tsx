import { useState } from 'react';
import { ExternalLink, Youtube } from 'lucide-react';
import { COMPANY_VIDEO_URL, youtubePlaylistId } from '../../config';

/**
 * In-app YouTube playlist embed for Peak Financial's client-ready videos.
 * If COMPANY_VIDEO_URL has no playlist id (or the embed fails), falls back
 * to a button that opens the channel in a new browser tab.
 */
export function CompanyVideos() {
  const playlistId = youtubePlaylistId(COMPANY_VIDEO_URL);
  const [embedFailed, setEmbedFailed] = useState(false);

  if (!playlistId || embedFailed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <Youtube size={36} className="text-accred" aria-hidden />
        <p className="max-w-xs text-[13px] text-slate-400">
          {embedFailed
            ? 'The in-app player couldn’t load here.'
            : 'No playlist configured for in-app playback.'}{' '}
          Open the Peak Financial video channel in a new tab instead.
        </p>
        <a
          href={COMPANY_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md bg-brass px-3 py-1.5 text-[13px] font-semibold text-desk hover:bg-brass/90"
        >
          <ExternalLink size={14} />
          Open Company Videos
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <iframe
        title="Peak Financial company videos"
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`}
        className="min-h-0 w-full flex-1 border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setEmbedFailed(true)}
      />
      <div className="flex shrink-0 items-center justify-between border-t border-edge px-3 py-1.5">
        <span className="text-[11px] text-slate-500">Client-ready videos — share freely.</span>
        <a
          href={COMPANY_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-brass"
        >
          <ExternalLink size={11} />
          Open on YouTube
        </a>
      </div>
    </div>
  );
}
