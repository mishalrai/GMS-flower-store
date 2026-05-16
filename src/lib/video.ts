// Helpers to handle product/banner videos. A "video URL" in the DB can be:
// 1. A local file under /uploads/...mp4 (uploaded via media library)
// 2. A YouTube URL (watch / shorts / youtu.be / embed)

const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(YOUTUBE_RE);
  return m?.[1] ?? null;
}

export function isYouTubeUrl(url: string): boolean {
  return youtubeId(url) !== null;
}

export function youtubeThumbnail(id: string): string {
  // mqdefault is 320x180 — fine for thumbnails and always available.
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/** Does this URL look like an uploaded video file (by extension)? */
export function isVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|mov|mkv|m4v|ogg|ogv)(\?|#|$)/i.test(url);
}

/** Catch-all: any video, either YouTube or uploaded file. */
export function isAnyVideoUrl(url: string): boolean {
  return isYouTubeUrl(url) || isVideoFileUrl(url);
}

export function youtubeEmbed(id: string): string {
  // Use youtube-nocookie.com to avoid the "Sign in to confirm you're not a bot"
  // guard that YouTube triggers on regular youtube.com/embed URLs from dev origins.
  // playsinline=1 keeps it inline on iOS; rel=0 avoids unrelated suggestions.
  return `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`;
}

export type VideoSource =
  | { kind: "file"; src: string }
  | { kind: "youtube"; id: string; src: string; embed: string; thumbnail: string };

export function parseVideoSource(url: string): VideoSource {
  const id = youtubeId(url);
  if (id) {
    return {
      kind: "youtube",
      id,
      src: url,
      embed: youtubeEmbed(id),
      thumbnail: youtubeThumbnail(id),
    };
  }
  return { kind: "file", src: url };
}
