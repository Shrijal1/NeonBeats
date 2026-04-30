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

// API response shapes
export interface PrepareResponse {
  id: string;
}

export interface FetchResponse {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  duration: number;
  audioUrl?: string;
  links?: {
    youtube?: string;
    spotify?: string;
  };
}
