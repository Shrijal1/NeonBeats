export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function extractArtistFromTitle(title: string): string {
  // Many API results encode "Artist - Song Title"
  const dashIndex = title.indexOf(' - ');
  if (dashIndex > 0) return title.slice(0, dashIndex).trim();
  return 'Unknown Artist';
}

export function extractSongTitle(title: string): string {
  const dashIndex = title.indexOf(' - ');
  if (dashIndex > 0) return title.slice(dashIndex + 3).trim();
  return title;
}
