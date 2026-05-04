import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song } from '../types';
import { Storage } from '../utils/storage';
import { MAX_RECENTLY_PLAYED } from '../utils/constants';

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  isLoading: boolean;
  showMiniPlayer: boolean;

  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
}

let soundRef: Audio.Sound | null = null;
let loadGeneration = 0; // increments on every playSong call to cancel stale loads

async function stopCurrentSound() {
  if (soundRef) {
    try {
      await soundRef.stopAsync();
      await soundRef.unloadAsync();
    } catch {}
    soundRef = null;
  }
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  isLoading: false,
  showMiniPlayer: false,

  async playSong(song, queue = []) {
    const gen = ++loadGeneration;

    set({ isLoading: true, currentSong: song, showMiniPlayer: true, position: 0, isPlaying: false });

    const recent = await Storage.getRecentlyPlayed();
    const filtered = recent.filter((s) => s.id !== song.id);
    await Storage.setRecentlyPlayed([song, ...filtered].slice(0, MAX_RECENTLY_PLAYED));

    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    await stopCurrentSound();

    // Another song was requested while we were setting up — bail out
    if (gen !== loadGeneration) return;

    const queueToUse = queue.length > 0 ? queue : [song];
    const idx = queueToUse.findIndex((s) => s.id === song.id);
    set({ queue: queueToUse, queueIndex: idx >= 0 ? idx : 0 });

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          // Ignore callbacks from a previous load
          if (gen !== loadGeneration) return;
          if (!status.isLoaded) return;
          set({
            position: status.positionMillis / 1000,
            duration: (status.durationMillis ?? 0) / 1000,
            isPlaying: status.isPlaying,
          });
          if (status.didJustFinish) {
            get().playNext();
          }
        },
      );

      // Another song was requested while this one was loading — discard it
      if (gen !== loadGeneration) {
        sound.unloadAsync().catch(() => {});
        return;
      }

      soundRef = sound;
      set({ isLoading: false, isPlaying: true });
    } catch {
      if (gen === loadGeneration) {
        set({ isLoading: false, isPlaying: false });
      }
    }
  },

  async togglePlayPause() {
    if (!soundRef) return;
    const { isPlaying } = get();
    if (isPlaying) {
      await soundRef.pauseAsync();
    } else {
      await soundRef.playAsync();
    }
    set({ isPlaying: !isPlaying });
  },

  async seekTo(position) {
    if (!soundRef) return;
    await soundRef.setPositionAsync(position * 1000);
    set({ position });
  },

  async playNext() {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      set({ queueIndex: queueIndex + 1 });
      await get().playSong(next, queue);
    }
  },

  async playPrevious() {
    const { queue, queueIndex, position } = get();
    if (position > 3) {
      await get().seekTo(0);
      return;
    }
    if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      set({ queueIndex: queueIndex - 1 });
      await get().playSong(prev, queue);
    }
  },

  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
}));
