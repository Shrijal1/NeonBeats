import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { SongCardSkeleton } from '../components/SkeletonLoader';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { COLORS, SIZES, TRENDING_QUERIES } from '../utils/constants';
import { useSearch } from '../hooks/useSearch';
import { usePlayer } from '../hooks/usePlayer';
import { useLibraryStore } from '../store/libraryStore';
import { MusicApi } from '../services/musicApi';
import { SearchResult, Song } from '../types';

export function SearchScreen() {
  const { query, setQuery, results, isLoading, error } = useSearch();
  const { playSong, currentSong, toggleLike, isLiked } = usePlayer();
  const { likedSongs } = useLibraryStore();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  async function handlePress(result: SearchResult) {
    Keyboard.dismiss();
    const song = {
      id: result.id,
      title: result.title,
      artist: result.artist,
      thumbnail: result.thumbnail,
      duration: result.duration,
      audioUrl: result.audioUrl,
    };
    const queue = results
      .filter((r) => r.id !== result.id)
      .map((r) => ({
        id: r.id,
        title: r.title,
        artist: r.artist,
        thumbnail: r.thumbnail,
        duration: r.duration,
        audioUrl: r.audioUrl,
      }));
    await playSong(song, [song, ...queue]);
  }

  async function handleLike(result: SearchResult) {
    const song = await MusicApi.getSongDetails(result.id).catch(() => null);
    if (song) toggleLike(song);
  }

  const showEmpty = !isLoading && query.length > 0 && results.length === 0 && !error;
  const showSuggestions = query.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} autoFocus={false} />
        </View>
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionTitle}>Try searching for</Text>
          <View style={styles.chips}>
            {TRENDING_QUERIES.map((q) => (
              <ChipButton key={q} label={q} onPress={() => setQuery(q)} />
            ))}
          </View>
        </View>
      )}

      {isLoading && (
        <View>
          {Array.from({ length: 6 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      )}

      {showEmpty && (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      )}

      {!isLoading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={() => handlePress(item)}
              isActive={currentSong?.id === item.id}
              isLiked={isLiked(item.id)}
              onToggleLike={() => handleLike(item)}
              onMorePress={() => setSelectedSong({
                id: item.id, title: item.title, artist: item.artist,
                thumbnail: item.thumbnail, duration: item.duration, audioUrl: item.audioUrl,
              })}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
      <AddToPlaylistModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </KeyboardAvoidingView>
  );
}

function ChipButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: (StatusBar.currentHeight ?? 44) + 8,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SIZES.md,
  },
  searchWrap: {
    marginTop: 4,
  },
  suggestions: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.md,
  },
  suggestionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SIZES.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    paddingBottom: SIZES.miniPlayerHeight + SIZES.tabBarHeight + 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
