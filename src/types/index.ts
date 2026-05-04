export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
  audioUrl: string;
  externalLinks?: {
    youtube?: string;
    spotify?: string;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  coverImage?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  isLoading: boolean;
}

export interface LibraryState {
  likedSongs: Song[];
  recentlyPlayed: Song[];
  playlists: Playlist[];
}

// JioSaavn API response shapes (internal)
export interface SaavnQuality {
  quality: string;
  link: string;
}

export interface SaavnTrack {
  id: string;
  name: string;
  duration: string;
  primaryArtists: string;
  image: SaavnQuality[];
  downloadUrl: SaavnQuality[];
}

export interface SaavnSearchResponse {
  status: string;
  data: {
    total: number;
    start: number;
    results: SaavnTrack[];
  };
}

export interface SaavnSongResponse {
  status: string;
  data: SaavnTrack[];
}
