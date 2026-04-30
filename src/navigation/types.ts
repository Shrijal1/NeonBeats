import { Song } from '../types';

export type RootStackParamList = {
  Main: undefined;
  Player: { song?: Song };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};
