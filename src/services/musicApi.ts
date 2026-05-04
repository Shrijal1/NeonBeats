import { Song, SearchResult, SaavnTrack, SaavnSearchResponse, SaavnSongResponse } from '../types';
import { Storage } from '../utils/storage';

const BASE = 'https://jiosaavn-api-privatecvc2.vercel.app';
const QUALITY = '160kbps';

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function pickAudio(downloadUrl: SaavnTrack['downloadUrl']): string {
  return (
    downloadUrl.find((d) => d.quality === QUALITY)?.link ??
    downloadUrl[downloadUrl.length - 1]?.link ??
    ''
  );
}

function pickImage(image: SaavnTrack['image']): string {
  return image.find((i) => i.quality === '500x500')?.link ?? image[image.length - 1]?.link ?? '';
}

function trackToSong(t: SaavnTrack): Song {
  return {
    id: t.id,
    title: t.name,
    artist: t.primaryArtists,
    thumbnail: pickImage(t.image),
    duration: Number(t.duration),
    audioUrl: pickAudio(t.downloadUrl),
  };
}

function trackToSearchResult(t: SaavnTrack): SearchResult {
  return {
    id: t.id,
    title: t.name,
    artist: t.primaryArtists,
    thumbnail: pickImage(t.image),
    duration: Number(t.duration),
    audioUrl: pickAudio(t.downloadUrl),
  };
}

export const MusicApi = {
  async search(query: string): Promise<SearchResult[]> {
    const url = `${BASE}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=20`;
    const data = await get<SaavnSearchResponse>(url);
    if (data.status !== 'SUCCESS') return [];
    return data.data.results
      .filter((t) => t.downloadUrl?.length)
      .map(trackToSearchResult);
  },

  async getSongDetails(songId: string): Promise<Song> {
    const cached = await Storage.getCachedSong(songId);
    if (cached) return cached;

    const url = `${BASE}/songs?id=${songId}`;
    const data = await get<SaavnSongResponse>(url);
    if (data.status !== 'SUCCESS' || !data.data[0]) throw new Error('Track not found');

    const song = trackToSong(data.data[0]);
    await Storage.cacheSong(song);
    return song;
  },

  // audioUrl is now embedded in SearchResult — this is only a fallback
  getAudioStreamUrl(songId: string): string {
    return songId;
  },

  async searchMultiple(queries: string[]): Promise<SearchResult[]> {
    const results = await Promise.allSettled(queries.map((q) => MusicApi.search(q)));
    const seen = new Set<string>();
    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  },
};
