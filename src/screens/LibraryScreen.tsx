import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/SongCard';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { COLORS, SIZES } from '../utils/constants';
import { Song } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'liked' | 'recent' | 'playlists';

export function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>('liked');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { likedSongs, recentlyPlayed, playlists, loadLibrary, toggleLike, isLiked, createPlaylist } =
    useLibraryStore();
  const { playSong, currentSong } = usePlayer();

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  async function handleCreate() {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  }

  const data: Song[] =
    activeTab === 'liked' ? likedSongs : activeTab === 'recent' ? recentlyPlayed : [];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={26} color={COLORS.neonYellow} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['liked', 'recent', 'playlists'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'liked' ? 'Liked' : tab === 'recent' ? 'Recent' : 'Playlists'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'playlists' ? (
        <FlatList
          data={playlists}
          keyExtractor={(pl) => pl.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.playlistRow}
              onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.playlistIcon}>
                <Ionicons name="musical-notes" size={24} color={COLORS.neonBlue} />
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistCount}>
                  {item.songs.length} song{item.songs.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="list-outline"
              message="No playlists yet"
              sub='Tap "+" to create one'
            />
          }
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={() => playSong(item, data)}
              isActive={currentSong?.id === item.id}
              isLiked={isLiked(item.id)}
              onToggleLike={activeTab === 'liked' ? () => toggleLike(item) : undefined}
              onMorePress={() => setSelectedSong(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'liked' ? 'heart-outline' : 'time-outline'}
              message={activeTab === 'liked' ? 'No liked songs' : 'Nothing played yet'}
              sub={
                activeTab === 'liked'
                  ? 'Heart a song to save it here'
                  : 'Your recently played will appear here'
              }
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create playlist modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Playlist name…"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.modalCreate}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddToPlaylistModal song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}

function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  sub: string;
}) {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name={icon} size={52} color={COLORS.textMuted} />
      <Text style={emptyStyles.msg}>{message}</Text>
      <Text style={emptyStyles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: (StatusBar.currentHeight ?? 44) + 8,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
  },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  addBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: 8,
    marginBottom: SIZES.md,
  },
  tab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
  },
  activeTab: { backgroundColor: COLORS.neonYellow },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  activeTabText: { color: COLORS.background },
  list: { paddingBottom: SIZES.miniPlayerHeight + SIZES.tabBarHeight + 16 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
  },
  playlistIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: `${COLORS.neonBlue}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: { flex: 1, marginLeft: 12 },
  playlistName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  playlistCount: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: SIZES.md },
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: SIZES.md },
  modalCancel: { paddingHorizontal: SIZES.md, paddingVertical: 10 },
  modalCancelText: { color: COLORS.textSecondary, fontSize: 15 },
  modalCreate: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    backgroundColor: COLORS.neonYellow,
    borderRadius: SIZES.borderRadius,
  },
  modalCreateText: { color: COLORS.background, fontSize: 15, fontWeight: '700' },
});

const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 80, gap: 12, paddingHorizontal: SIZES.lg },
  msg: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  sub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
