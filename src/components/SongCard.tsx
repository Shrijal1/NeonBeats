import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { Song, SearchResult } from '../types';
import { formatDuration, truncateText } from '../utils/formatters';

type SongLike = Pick<Song | SearchResult, 'id' | 'title' | 'artist' | 'thumbnail' | 'duration'>;

interface Props {
  song: SongLike;
  onPress: () => void;
  onLongPress?: () => void;
  onMorePress?: () => void;
  isActive?: boolean;
  isLiked?: boolean;
  onToggleLike?: () => void;
  style?: ViewStyle;
  showDuration?: boolean;
}

export function SongCard({
  song,
  onPress,
  onLongPress,
  onMorePress,
  isActive,
  isLiked,
  onToggleLike,
  style,
  showDuration = true,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: song.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
          defaultSource={{ uri: 'https://via.placeholder.com/56/161616/CCFF00?text=♪' }}
        />
        {isActive && (
          <View style={styles.activeOverlay}>
            <Ionicons name="musical-notes" size={18} color={COLORS.neonYellow} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.title, isActive && styles.activeTitle]}
          numberOfLines={1}
        >
          {truncateText(song.title, 38)}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {truncateText(song.artist, 30)}
          {showDuration && song.duration > 0
            ? `  ·  ${formatDuration(song.duration)}`
            : ''}
        </Text>
      </View>

      {onToggleLike && (
        <TouchableOpacity
          onPress={onToggleLike}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.likeBtn}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? COLORS.neonYellow : COLORS.textMuted}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onMorePress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.menu}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function HorizontalSongCard({
  song,
  onPress,
  isActive,
  cardWidth = 140,
}: Pick<Props, 'song' | 'onPress' | 'isActive'> & { cardWidth?: number }) {
  return (
    <TouchableOpacity
      style={[styles.horizontal, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: song.thumbnail }}
        style={[styles.horizontalThumb, { width: cardWidth, height: cardWidth }]}
        resizeMode="cover"
      />
      {isActive && (
        <View style={[styles.activeOverlay, styles.horizontalOverlay]}>
          <Ionicons name="musical-notes" size={16} color={COLORS.neonYellow} />
        </View>
      )}
      <Text style={styles.horizontalTitle} numberOfLines={2}>
        {song.title}
      </Text>
      <Text style={styles.horizontalArtist} numberOfLines={1}>
        {song.artist}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.borderRadius,
  },
  activeContainer: {
    backgroundColor: `${COLORS.neonYellow}10`,
  },
  thumbnailWrap: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  activeTitle: {
    color: COLORS.neonYellow,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  likeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  menu: {
    marginLeft: 6,
    padding: 4,
  },
  // horizontal card
  horizontal: {
    width: 140,
    marginRight: 12,
  },
  horizontalThumb: {
    width: 140,
    height: 140,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.card,
  },
  horizontalOverlay: {
    borderRadius: SIZES.borderRadius,
  },
  horizontalTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  horizontalArtist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
