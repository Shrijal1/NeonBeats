import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, TRENDING_QUERIES, RECOMMENDED_QUERIES, FEATURED_PLAYLISTS } from '../utils/constants';
import { MusicApi } from '../services/musicApi';
import { usePlayer } from '../hooks/usePlayer';
import { useLibraryStore } from '../store/libraryStore';
import { SongCard, HorizontalSongCard } from '../components/SongCard';
import { SongCardSkeleton } from '../components/SkeletonLoader';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { Song, SearchResult } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { playSong, currentSong } = usePlayer();
  const { recentlyPlayed, loadLibrary } = useLibraryStore();
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [recommended, setRecommended] = useState<SearchResult[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingRec, setIsLoadingRec] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mixFromHistory, setMixFromHistory] = useState(false);

  const loadTrending = useCallback(async () => {
    setIsLoadingTrending(true);
    try {
      // Build queries from real listening/liked history
      const { recentlyPlayed: recent, likedSongs: liked } = useLibraryStore.getState();
      const history = [...recent, ...liked];
      let queries: string[];
      if (history.length >= 2) {
        // Unique artists from most recent history, up to 4
        queries = [...new Set(history.map((s) => s.artist))].slice(0, 4);
        setMixFromHistory(true);
      } else {
        queries = TRENDING_QUERIES.slice(0, 3);
        setMixFromHistory(false);
      }
      const results = await MusicApi.searchMultiple(queries);
      setTrending(results.slice(0, 10));
    } catch {
      setTrending([]);
    } finally {
      setIsLoadingTrending(false);
    }
  }, []);

  const loadRecommended = useCallback(async () => {
    setIsLoadingRec(true);
    try {
      const results = await MusicApi.searchMultiple(RECOMMENDED_QUERIES.slice(0, 3));
      setRecommended(results.slice(0, 10));
    } catch {
      setRecommended([]);
    } finally {
      setIsLoadingRec(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await loadLibrary();     // loads liked + recently played into store first
      loadTrending();          // now has access to full history
      loadRecommended();
    }
    init();
  }, [loadLibrary, loadTrending, loadRecommended]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibrary();
    await Promise.all([loadTrending(), loadRecommended()]);
    setRefreshing(false);
  }, [loadLibrary, loadTrending, loadRecommended]);

  function toSong(r: SearchResult): Song {
    return {
      id: r.id, title: r.title, artist: r.artist,
      thumbnail: r.thumbnail, duration: r.duration, audioUrl: r.audioUrl,
    };
  }

  function buildQueue(items: SearchResult[], current: SearchResult): Song[] {
    const s = toSong(current);
    const rest = items.filter((r) => r.id !== current.id).map(toSong);
    return [s, ...rest];
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.neonYellow}
            colors={[COLORS.neonYellow]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[`${COLORS.neonYellow}22`, COLORS.background]}
          style={styles.header}
        >
          <Text style={styles.greeting}>Good vibes 👾</Text>
          <Text style={styles.appName}>NeonBeats</Text>
        </LinearGradient>

        {/* Featured Playlists */}
        <Section title="Featured">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {FEATURED_PLAYLISTS.map((pl) => (
              <TouchableOpacity
                key={pl.id}
                style={[styles.featCard, { borderColor: pl.color + '44' }]}
              >
                <LinearGradient colors={[pl.color + '33', COLORS.card]} style={styles.featGradient}>
                  <Ionicons name="musical-notes" size={28} color={pl.color} />
                  <Text style={[styles.featName, { color: pl.color }]}>{pl.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <Section title="Recently Played">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {recentlyPlayed.slice(0, 8).map((song) => (
                <HorizontalSongCard
                  key={song.id}
                  song={song}
                  onPress={() => playSong(song, recentlyPlayed)}
                  isActive={currentSong?.id === song.id}
                />
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Your Mix — compact horizontal cards based on listening history */}
        <Section title={mixFromHistory ? 'Your Mix' : 'Trending Now'}>
          {isLoadingTrending ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              scrollEnabled={false}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.trendingSkeletonCard}>
                  <View style={styles.trendingSkeletonThumb} />
                  <View style={styles.trendingSkeletonTitle} />
                  <View style={styles.trendingSkeletonArtist} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {trending.map((item) => (
                <HorizontalSongCard
                  key={item.id}
                  song={item}
                  onPress={() => playSong(toSong(item), buildQueue(trending, item))}
                  isActive={currentSong?.id === item.id}
                  cardWidth={105}
                />
              ))}
            </ScrollView>
          )}
        </Section>

        {/* Recommended for You — vertical list */}
        <Section title="Recommended for You">
          {isLoadingRec
            ? Array.from({ length: 5 }).map((_, i) => <SongCardSkeleton key={i} />)
            : recommended.map((item) => (
                <SongCard
                  key={item.id}
                  song={item}
                  onPress={() => playSong(toSong(item), buildQueue(recommended, item))}
                  isActive={currentSong?.id === item.id}
                  onMorePress={() => setSelectedSong(toSong(item))}
                />
              ))}
        </Section>

        <View style={{ height: SIZES.miniPlayerHeight + SIZES.tabBarHeight + 16 }} />
      </ScrollView>

      <AddToPlaylistModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingTop: StatusBar.currentHeight ?? 44,
  },
  header: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  appName: {
    color: COLORS.neonYellow,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: COLORS.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  section: {
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  hScroll: {
    paddingHorizontal: SIZES.md,
    paddingBottom: 4,
  },
  featCard: {
    width: 120,
    height: 120,
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
  },
  featGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  featName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  // trending skeleton
  trendingSkeletonCard: {
    width: 105,
    marginRight: 12,
  },
  trendingSkeletonThumb: {
    width: 105,
    height: 105,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.card,
  },
  trendingSkeletonTitle: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.card,
    marginTop: 8,
    width: '80%',
  },
  trendingSkeletonArtist: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.card,
    marginTop: 5,
    width: '55%',
  },
});
