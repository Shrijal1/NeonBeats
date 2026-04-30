import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore — community slider types
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { PlayerControls } from '../components/PlayerControls';
import { COLORS, SIZES } from '../utils/constants';
import { formatDuration } from '../utils/formatters';

const { width, height } = Dimensions.get('window');
const ARTWORK_SIZE = width - 64;

export function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    queue,
    queueIndex,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
  } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  // Artwork pulse animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 10000, useNativeDriver: true }),
      ).start();
      Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, friction: 8 }).start();
    } else {
      scaleAnim.stopAnimation();
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
      rotateAnim.stopAnimation();
    }
  }, [isPlaying, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background blur from artwork */}
      <Image
        source={{ uri: currentSong.thumbnail }}
        style={StyleSheet.absoluteFill}
        blurRadius={40}
      />
      <LinearGradient
        colors={['rgba(10,10,10,0.6)', 'rgba(10,10,10,0.92)', COLORS.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkWrap}>
        <Animated.View
          style={[
            styles.artworkGlow,
            {
              shadowColor: COLORS.neonYellow,
              shadowRadius: isPlaying ? 40 : 20,
              shadowOpacity: isPlaying ? 0.5 : 0.2,
            },
          ]}
        >
          <Animated.Image
            source={{ uri: currentSong.thumbnail }}
            style={[styles.artwork, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Animated equalizer bars when playing */}
        {isPlaying && (
          <View style={styles.eqContainer}>
            {[1, 1.6, 0.8, 1.4, 1].map((h, i) => (
              <EqBar key={i} heightMultiplier={h} delay={i * 120} />
            ))}
          </View>
        )}
      </View>

      {/* Song Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentSong)} style={styles.likeBtn}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? COLORS.neonYellow : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Seek Bar */}
      <View style={styles.seekContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onSlidingComplete={(val) => seekTo(val * duration)}
          minimumTrackTintColor={COLORS.neonYellow}
          maximumTrackTintColor={COLORS.border}
          thumbTintColor={COLORS.neonYellow}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatDuration(position)}</Text>
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <PlayerControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrevious={playPrevious}
          size="large"
          hasNext={queueIndex < queue.length - 1}
          hasPrevious={queueIndex > 0}
        />
      </View>

      {/* Extra controls row */}
      <View style={styles.extras}>
        <TouchableOpacity style={styles.extraBtn}>
          <Ionicons name="shuffle" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Ionicons name="repeat" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Ionicons name="share-social-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Queue indicator */}
      {queue.length > 1 && (
        <Text style={styles.queueText}>
          {queueIndex + 1} / {queue.length} in queue
        </Text>
      )}
    </View>
  );
}

function EqBar({ heightMultiplier, delay }: { heightMultiplier: number; delay: number }) {
  const anim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 4 + 12 * heightMultiplier,
          duration: 300 + delay,
          useNativeDriver: false,
        }),
        Animated.timing(anim, { toValue: 4, duration: 300 + delay, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, heightMultiplier, delay]);

  return (
    <Animated.View
      style={{
        width: 4,
        height: anim,
        backgroundColor: COLORS.neonYellow,
        borderRadius: 2,
        marginHorizontal: 2,
      }}
    />
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
    justifyContent: 'space-between',
    paddingTop: (StatusBar.currentHeight ?? 44) + 12,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  artworkWrap: {
    alignItems: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  artworkGlow: {
    borderRadius: SIZES.borderRadiusLg + 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: SIZES.borderRadiusLg + 4,
    backgroundColor: COLORS.card,
  },
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 12,
    right: 44,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  infoText: {
    flex: 1,
  },
  songTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  artistName: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  likeBtn: {
    padding: 8,
    marginLeft: 12,
  },
  seekContainer: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  controls: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  extras: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: SIZES.md,
  },
  extraBtn: {
    padding: 10,
  },
  queueText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
