import { API_BASE_URL } from '../utils/constants';
import { Song, SearchResult, PrepareResponse, FetchResponse } from '../types';
import { Storage } from '../utils/storage';
import { extractArtistFromTitle, extractSongTitle } from '../utils/formatters';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return res.json() as Promise<T>;
}

function mapFetchToSong(data: FetchResponse): Song {
  return {
    id: data.id,
    title: extractSongTitle(data.title),
    artist: data.artist || extractArtistFromTitle(data.title),
    thumbnail: data.thumbnail,
    duration: data.duration,
    audioUrl: data.audioUrl || `${API_BASE_URL}/music/api/audio/${data.id}`,
    externalLinks: data.links,
  };
}

export const MusicApi = {
  async getSongId(songName: string): Promise<string> {
    const encoded = encodeURIComponent(songName);
    const data = await get<PrepareResponse>(`/music/api/prepare/${encoded}`);
    return data.id;
  },

  async getSongDetails(songId: string): Promise<Song> {
    const cached = await Storage.getCachedSong(songId);
    if (cached) return cached;

    const data = await get<FetchResponse>(`/music/api/fetch/${songId}`);
    const song = mapFetchToSong(data);
    await Storage.cacheSong(song);
    return song;
  },

  getAudioStreamUrl(songId: string): string {
    return `${API_BASE_URL}/music/api/audio/${songId}`;
  },

  async search(query: string): Promise<SearchResult[]> {
    try {
      const songId = await MusicApi.getSongId(query);
      const song = await MusicApi.getSongDetails(songId);
      // The API is single-result; wrap in array for UI compatibility
      return [
        {
          id: song.id,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration,
        },
      ];
    } catch {
      return [];
    }
  },

  async searchMultiple(queries: string[]): Promise<SearchResult[]> {
    const results = await Promise.allSettled(queries.map((q) => MusicApi.search(q)));
    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);
  },
};
