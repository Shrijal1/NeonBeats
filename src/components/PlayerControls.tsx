import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface Props {
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  size?: 'small' | 'large';
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function PlayerControls({
  isPlaying,
  isLoading,
  onPlayPause,
  onNext,
  onPrevious,
  size = 'large',
  hasNext = true,
  hasPrevious = true,
}: Props) {
  const isLarge = size === 'large';
  const playIconSize = isLarge ? 64 : 44;
  const skipIconSize = isLarge ? 32 : 24;

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <TouchableOpacity
        onPress={onPrevious}
        disabled={!hasPrevious}
        style={[styles.skipBtn, !hasPrevious && styles.disabled]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="play-skip-back" size={skipIconSize} color={COLORS.text} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.playBtn, isLarge && styles.playBtnLarge]} onPress={onPlayPause}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.background} size={isLarge ? 'large' : 'small'} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={playIconSize * 0.48}
            color={COLORS.background}
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        disabled={!hasNext}
        style={[styles.skipBtn, !hasNext && styles.disabled]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="play-skip-forward" size={skipIconSize} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  containerLarge: {
    gap: 36,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.neonYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  skipBtn: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.3,
  },
});
