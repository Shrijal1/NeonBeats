import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, TRENDING_QUERIES, FEATURED_PLAYLISTS } from '../utils/constants';
import { MusicApi } from '../services/musicApi';
import { usePlayer } from '../hooks/usePlayer';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { SongCard, HorizontalSongCard } from '../components/SongCard';
import { SongCardSkeleton } from '../components/SkeletonLoader';
import { Song, SearchResult } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { playSong, currentSong } = usePlayer();
  const { recentlyPlayed, refreshRecentlyPlayed } = useLibraryStore();
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrending = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await MusicApi.searchMultiple(TRENDING_QUERIES.slice(0, 4));
      setTrending(results.slice(0, 12));
    } catch {
      setTrending([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
    refreshRecentlyPlayed();
  }, [loadTrending, refreshRecentlyPlayed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTrending(), refreshRecentlyPlayed()]);
    setRefreshing(false);
  }, [loadTrending, refreshRecentlyPlayed]);

  async function handleSongPress(result: SearchResult) {
    const song = await MusicApi.getSongDetails(result.id).catch(() => null);
    if (!song) return;
    const queue = trending
      .filter((r) => r.id !== result.id)
      .map((r) => ({
        id: r.id,
        title: r.title,
        artist: r.artist,
        thumbnail: r.thumbnail,
        duration: r.duration,
        audioUrl: MusicApi.getAudioStreamUrl(r.id),
      }));
    await playSong(song, [song, ...queue]);
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {FEATURED_PLAYLISTS.map((pl) => (
              <TouchableOpacity key={pl.id} style={[styles.featCard, { borderColor: pl.color + '44' }]}>
                <LinearGradient
                  colors={[pl.color + '33', COLORS.card]}
                  style={styles.featGradient}
                >
                  <Ionicons name="musical-notes" size={32} color={pl.color} />
                  <Text style={[styles.featName, { color: pl.color }]}>{pl.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <Section title="Recently Played">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {recentlyPlayed.slice(0, 8).map((song) => (
                <HorizontalSongCard
                  key={song.id}
                  song={song}
                  onPress={() => playSong(song)}
                  isActive={currentSong?.id === song.id}
                />
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Trending */}
        <Section title="Trending Now">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SongCardSkeleton key={i} />)
            : trending.map((item) => (
                <SongCard
                  key={item.id}
                  song={item}
                  onPress={() => handleSongPress(item)}
                  isActive={currentSong?.id === item.id}
                />
              ))}
        </Section>

        <View style={{ height: SIZES.miniPlayerHeight + SIZES.tabBarHeight + 16 }} />
      </ScrollView>
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
    width: 130,
    height: 130,
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
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
});
