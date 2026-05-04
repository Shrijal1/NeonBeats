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

// iTunes API response shape (internal)
export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl?: string;
  trackTimeMillis: number;
}

export interface ItunesResponse {
  resultCount: number;
  results: ItunesTrack[];
}
