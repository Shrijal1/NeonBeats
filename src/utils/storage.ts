import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, Playlist } from '../types';

const KEYS = {
  LIKED_SONGS: 'neonbeats:liked_songs',
  RECENTLY_PLAYED: 'neonbeats:recently_played',
  PLAYLISTS: 'neonbeats:playlists',
  SONG_CACHE: 'neonbeats:song_cache',
} as const;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const Storage = {
  getLikedSongs: () => getJSON<Song[]>(KEYS.LIKED_SONGS, []),
  setLikedSongs: (songs: Song[]) => setJSON(KEYS.LIKED_SONGS, songs),

  getRecentlyPlayed: () => getJSON<Song[]>(KEYS.RECENTLY_PLAYED, []),
  setRecentlyPlayed: (songs: Song[]) => setJSON(KEYS.RECENTLY_PLAYED, songs),

  getPlaylists: () => getJSON<Playlist[]>(KEYS.PLAYLISTS, []),
  setPlaylists: (playlists: Playlist[]) => setJSON(KEYS.PLAYLISTS, playlists),

  async getCachedSong(id: string): Promise<Song | null> {
    const cache = await getJSON<Record<string, Song>>(KEYS.SONG_CACHE, {});
    return cache[id] ?? null;
  },

  async cacheSong(song: Song): Promise<void> {
    const cache = await getJSON<Record<string, Song>>(KEYS.SONG_CACHE, {});
    cache[song.id] = song;
    // keep cache under 200 entries
    const keys = Object.keys(cache);
    if (keys.length > 200) delete cache[keys[0]];
    await setJSON(KEYS.SONG_CACHE, cache);
  },
};
