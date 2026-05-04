import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/libraryStore';
import { Song } from '../types';
import { COLORS, SIZES } from '../utils/constants';

interface Props {
  song: Song | null;
  onClose: () => void;
}

export function AddToPlaylistModal({ song, onClose }: Props) {
  const { playlists, addToPlaylist, createPlaylist } = useLibraryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  if (!song) return null;

  async function handleAdd(playlistId: string) {
    await addToPlaylist(playlistId, song!);
    onClose();
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    const updated = useLibraryStore.getState().playlists;
    const newPl = updated[updated.length - 1];
    if (newPl) await addToPlaylist(newPl.id, song!);
    setNewName('');
    setShowCreate(false);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Add to Playlist</Text>
        <Text style={styles.songName} numberOfLines={1}>{song.title}</Text>

        {!showCreate ? (
          <TouchableOpacity style={styles.createRow} onPress={() => setShowCreate(true)}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={22} color={COLORS.neonYellow} />
            </View>
            <Text style={styles.createText}>New Playlist</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.createInputRow}>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Playlist name…"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
              <Text style={styles.createBtnText}>Create & Add</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={playlists}
          keyExtractor={(pl) => pl.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.plRow} onPress={() => handleAdd(item.id)}>
              <View style={styles.plIcon}>
                <Ionicons name="musical-notes" size={20} color={COLORS.neonBlue} />
              </View>
              <View style={styles.plInfo}>
                <Text style={styles.plName}>{item.name}</Text>
                <Text style={styles.plCount}>{item.songs.length} songs</Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No playlists — create one above</Text>
          }
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: SIZES.md,
    marginBottom: 2,
  },
  songName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${COLORS.neonYellow}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    color: COLORS.neonYellow,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  createInputRow: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createBtn: {
    backgroundColor: COLORS.neonYellow,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 10,
    alignItems: 'center',
  },
  createBtnText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    marginTop: 4,
  },
  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
  },
  plIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${COLORS.neonBlue}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plInfo: {
    flex: 1,
    marginLeft: 12,
  },
  plName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  plCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.md,
  },
});
