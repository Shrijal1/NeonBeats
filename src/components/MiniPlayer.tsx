import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { COLORS, SIZES } from '../utils/constants';
import { truncateText } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MiniPlayer() {
  const navigation = useNavigation<Nav>();
  const { currentSong, isPlaying, isLoading, togglePlayPause, playNext, queue, queueIndex, showMiniPlayer } =
    usePlayerStore();

  if (!currentSong || !showMiniPlayer) return null;

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => navigation.navigate('Player', { song: currentSong })}
    >
      <View style={styles.bg}>
        <View style={styles.container}>
          <Image source={{ uri: currentSong.thumbnail }} style={styles.thumb} />

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {truncateText(currentSong.title, 30)}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.btn}
          >
            <Ionicons
              name={isLoading ? 'sync' : isPlaying ? 'pause' : 'play'}
              size={26}
              color={COLORS.neonYellow}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
            style={styles.btn}
            disabled={queueIndex >= queue.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={queueIndex >= queue.length - 1 ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* progress bar */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  usePlayerStore.getState().duration > 0
                    ? (usePlayerStore.getState().position / usePlayerStore.getState().duration) * 100
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: SIZES.tabBarHeight,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  bg: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    height: SIZES.miniPlayerHeight,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: COLORS.card,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    padding: 8,
    marginLeft: 4,
  },
  progressBg: {
    height: 2,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: COLORS.neonYellow,
  },
});
