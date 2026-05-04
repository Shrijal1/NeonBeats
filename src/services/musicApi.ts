import { Song, SearchResult, ItunesTrack, ItunesResponse } from '../types';
import { Storage } from '../utils/storage';

const ITUNES_SEARCH = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup';

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function artworkHD(url: string): string {
  return url.replace('100x100bb', '600x600bb');
}

function trackToSong(t: ItunesTrack): Song {
  return {
    id: String(t.trackId),
    title: t.trackName,
    artist: t.artistName,
    thumbnail: artworkHD(t.artworkUrl100),
    duration: Math.round(t.trackTimeMillis / 1000),
    audioUrl: t.previewUrl ?? '',
  };
}

function trackToSearchResult(t: ItunesTrack): SearchResult {
  return {
    id: String(t.trackId),
    title: t.trackName,
    artist: t.artistName,
    thumbnail: artworkHD(t.artworkUrl100),
    duration: Math.round(t.trackTimeMillis / 1000),
    audioUrl: t.previewUrl ?? '',
  };
}

export const MusicApi = {
  async search(query: string): Promise<SearchResult[]> {
    const url = `${ITUNES_SEARCH}?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20&country=US`;
    const data = await get<ItunesResponse>(url);
    return data.results
      .filter((t) => t.previewUrl)
      .map(trackToSearchResult);
  },

  async getSongDetails(songId: string): Promise<Song> {
    const cached = await Storage.getCachedSong(songId);
    if (cached) return cached;

    const url = `${ITUNES_LOOKUP}?id=${songId}`;
    const data = await get<ItunesResponse>(url);
    const track = data.results[0];
    if (!track) throw new Error('Track not found');

    const song = trackToSong(track);
    await Storage.cacheSong(song);
    return song;
  },

  // kept for API compatibility — audioUrl is now in SearchResult directly
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
