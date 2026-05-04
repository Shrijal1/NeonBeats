import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayer } from '../hooks/usePlayer';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { SongCard } from '../components/SongCard';
import { COLORS, SIZES } from '../utils/constants';
import { Song } from '../types';
import { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export function PlaylistDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Route>();
  const { playlists, removeFromPlaylist, deletePlaylist, renamePlaylist } = useLibraryStore();
  const { playSong, currentSong } = usePlayer();
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const playlist = playlists.find((p) => p.id === params.playlistId);

  if (!playlist) {
    navigation.goBack();
    return null;
  }

  function handleMoreOptions() {
    Alert.alert(playlist!.name, undefined, [
      { text: 'Rename', onPress: () => { setNewName(playlist!.name); setShowRename(true); } },
      { text: 'Delete Playlist', style: 'destructive', onPress: handleDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete Playlist', `Delete "${playlist!.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePlaylist(playlist!.id);
        navigation.goBack();
      }},
    ]);
  }

  async function handleRename() {
    if (!newName.trim()) return;
    await renamePlaylist(playlist!.id, newName.trim());
    setShowRename(false);
  }

  function handleSongMore(song: Song) {
    Alert.alert(song.title, undefined, [
      { text: 'Remove from playlist', style: 'destructive', onPress: () => removeFromPlaylist(playlist!.id, song.id) },
      { text: 'Add to another playlist', onPress: () => setSelectedSong(song) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
        <TouchableOpacity onPress={handleMoreOptions} style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {playlist.songs.length > 0 && (
        <View style={styles.playBar}>
          <Text style={styles.songCount}>{playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity
            style={styles.playAllBtn}
            onPress={() => playSong(playlist.songs[0], playlist.songs)}
          >
            <Ionicons name="play" size={16} color={COLORS.background} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.playAllBtn, styles.shuffleBtn]}
            onPress={() => {
              const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
              playSong(shuffled[0], shuffled);
            }}
          >
            <Ionicons name="shuffle" size={16} color={COLORS.neonYellow} />
            <Text style={[styles.playAllText, styles.shuffleText]}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={playlist.songs}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <SongCard
            song={item}
            onPress={() => playSong(item, playlist.songs)}
            isActive={currentSong?.id === item.id}
            onMorePress={() => handleSongMore(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No songs yet</Text>
            <Text style={styles.emptySub}>Search for songs and tap ⋮ to add them here</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showRename} transparent animationType="fade" onRequestClose={() => setShowRename(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename Playlist</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleRename}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowRename(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRename} style={styles.modalSave}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddToPlaylistModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight ?? 44) + 8,
    paddingHorizontal: SIZES.sm,
    paddingBottom: SIZES.md,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: SIZES.sm,
  },
  moreBtn: {
    padding: 6,
  },
  playBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
    gap: 10,
  },
  songCount: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.neonYellow,
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAllText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  shuffleBtn: {
    backgroundColor: `${COLORS.neonYellow}22`,
    borderWidth: 1,
    borderColor: COLORS.neonYellow,
  },
  shuffleText: {
    color: COLORS.neonYellow,
  },
  list: {
    paddingBottom: SIZES.miniPlayerHeight + SIZES.tabBarHeight + 16,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
    paddingHorizontal: SIZES.lg,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '82%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SIZES.md,
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: SIZES.md,
  },
  modalCancel: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  modalSave: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    backgroundColor: COLORS.neonYellow,
    borderRadius: SIZES.borderRadius,
  },
  modalSaveText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
