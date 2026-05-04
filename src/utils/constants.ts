export const COLORS = {
  background: '#0A0A0A',
  surface: '#111111',
  surfaceElevated: '#1A1A1A',
  card: '#161616',
  border: '#222222',
  neonYellow: '#CCFF00',
  neonBlue: '#00E5FF',
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#555555',
  error: '#FF4444',
  overlay: 'rgba(0,0,0,0.7)',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  borderRadius: 12,
  borderRadiusLg: 20,
  cardHeight: 72,
  miniPlayerHeight: 64,
  tabBarHeight: 60,
} as const;

export const TRENDING_QUERIES = [
  'top hits 2024',
  'pop hits',
  'rock classics',
  'hip hop',
  'electronic music',
  'chill vibes',
];

export const RECOMMENDED_QUERIES = [
  'lofi hip hop beats',
  'indie pop 2024',
  'rnb soul classics',
  'acoustic covers',
  'workout motivation',
];

export const FEATURED_PLAYLISTS = [
  { id: 'p1', name: 'Neon Nights', query: 'synthwave', color: '#CCFF00' },
  { id: 'p2', name: 'Cyber Bass', query: 'electronic bass', color: '#00E5FF' },
  { id: 'p3', name: 'Top Hits', query: 'top hits 2024', color: '#FF6B6B' },
  { id: 'p4', name: 'Chill Wave', query: 'lofi chill', color: '#A78BFA' },
];

export const MAX_RECENTLY_PLAYED = 20;
export const SEARCH_DEBOUNCE_MS = 500;
