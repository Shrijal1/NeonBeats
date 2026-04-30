# NeonBeats 🎵

A cyberpunk-themed React Native music streaming app powered by **BhaskarPanja93/MusicAPI**.

## Theme
- Background: `#0A0A0A`
- Neon Yellow: `#CCFF00` (primary accent, play button glow)
- Neon Blue: `#00E5FF` (secondary accent)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API
Open `src/utils/constants.ts` and set `API_BASE_URL` to your deployed instance of
[BhaskarPanja93/MusicAPI](https://github.com/BhaskarPanja93/MusicAPI):

```ts
export const API_BASE_URL = 'https://your-api-host.com';
```

The app expects these endpoints:
| Endpoint | Description |
|----------|-------------|
| `GET /music/api/prepare/{song_name}` | Returns `{ id }` |
| `GET /music/api/fetch/{song_id}` | Returns metadata |
| `GET /music/api/audio/{song_id}` | Streams audio |

### 3. Run
```bash
# Expo Go (iOS/Android)
npm start

# Android emulator
npm run android

# iOS simulator (macOS only)
npm run ios
```

## Screens

| Screen | Features |
|--------|----------|
| **Home** | Trending songs, recently played, featured playlists |
| **Search** | Debounced search, quick-tap genre chips |
| **Library** | Liked songs, recently played, playlists |
| **Player** | Full-screen artwork, animated equalizer, seek bar, queue |

## Architecture

```
src/
├── components/    # SongCard, MiniPlayer, PlayerControls, SearchBar, SkeletonLoader
├── hooks/         # usePlayer, useSearch
├── navigation/    # Stack + BottomTab navigator
├── screens/       # HomeScreen, SearchScreen, LibraryScreen, PlayerScreen
├── services/      # musicApi.ts  ← all API calls here
├── store/         # playerStore.ts, libraryStore.ts (Zustand)
├── types/         # TypeScript interfaces
└── utils/         # constants, formatters, storage (AsyncStorage)
```

## Key Libraries
- `expo-av` — background audio playback
- `expo-blur` — glass-effect mini player
- `expo-linear-gradient` — neon gradient UI
- `zustand` — lightweight state management
- `@react-native-async-storage/async-storage` — persist liked songs & playlists
- `@react-native-community/slider` — seek bar
