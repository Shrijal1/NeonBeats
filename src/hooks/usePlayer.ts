import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { Song } from '../types';
import { MusicApi } from '../services/musicApi';

export function usePlayer() {
  const store = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  async function playFromSearch(songId: string) {
    try {
      const song = await MusicApi.getSongDetails(songId);
      await store.playSong(song);
    } catch (e) {
      console.error('Failed to load song', e);
    }
  }

  async function playWithQueue(song: Song, queue: Song[]) {
    await store.playSong(song, queue);
  }

  return {
    ...store,
    playFromSearch,
    playWithQueue,
    toggleLike,
    isLiked,
  };
}
