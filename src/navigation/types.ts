import { Song } from '../types';

export type RootStackParamList = {
  Main: undefined;
  Player: { song?: Song };
  PlaylistDetail: { playlistId: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};
