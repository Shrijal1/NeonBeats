import { create } from 'zustand';
import { Song, Playlist } from '../types';
import { Storage } from '../utils/storage';

interface LibraryStore {
  likedSongs: Song[];
  recentlyPlayed: Song[];
  playlists: Playlist[];
  isLoaded: boolean;

  loadLibrary: () => Promise<void>;
  toggleLike: (song: Song) => Promise<void>;
  isLiked: (songId: string) => boolean;
  createPlaylist: (name: string) => Promise<void>;
  addToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, name: string) => Promise<void>;
  refreshRecentlyPlayed: () => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedSongs: [],
  recentlyPlayed: [],
  playlists: [],
  isLoaded: false,

  async loadLibrary() {
    const [liked, recent, playlists] = await Promise.all([
      Storage.getLikedSongs(),
      Storage.getRecentlyPlayed(),
      Storage.getPlaylists(),
    ]);
    set({ likedSongs: liked, recentlyPlayed: recent, playlists, isLoaded: true });
  },

  async toggleLike(song) {
    const { likedSongs } = get();
    const exists = likedSongs.some((s) => s.id === song.id);
    const updated = exists
      ? likedSongs.filter((s) => s.id !== song.id)
      : [song, ...likedSongs];
    set({ likedSongs: updated });
    await Storage.setLikedSongs(updated);
  },

  isLiked(songId) {
    return get().likedSongs.some((s) => s.id === songId);
  },

  async createPlaylist(name) {
    const playlist: Playlist = {
      id: `pl_${Date.now()}`,
      name,
      songs: [],
    };
    const updated = [...get().playlists, playlist];
    set({ playlists: updated });
    await Storage.setPlaylists(updated);
  },

  async addToPlaylist(playlistId, song) {
    const updated = get().playlists.map((pl) =>
      pl.id === playlistId && !pl.songs.find((s) => s.id === song.id)
        ? { ...pl, songs: [...pl.songs, song] }
        : pl,
    );
    set({ playlists: updated });
    await Storage.setPlaylists(updated);
  },

  async removeFromPlaylist(playlistId, songId) {
    const updated = get().playlists.map((pl) =>
      pl.id === playlistId
        ? { ...pl, songs: pl.songs.filter((s) => s.id !== songId) }
        : pl,
    );
    set({ playlists: updated });
    await Storage.setPlaylists(updated);
  },

  async deletePlaylist(playlistId) {
    const updated = get().playlists.filter((pl) => pl.id !== playlistId);
    set({ playlists: updated });
    await Storage.setPlaylists(updated);
  },

  async renamePlaylist(playlistId, name) {
    const updated = get().playlists.map((pl) =>
      pl.id === playlistId ? { ...pl, name } : pl,
    );
    set({ playlists: updated });
    await Storage.setPlaylists(updated);
  },

  async refreshRecentlyPlayed() {
    const recent = await Storage.getRecentlyPlayed();
    set({ recentlyPlayed: recent });
  },
}));
