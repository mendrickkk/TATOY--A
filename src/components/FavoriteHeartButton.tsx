import React, {useCallback} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {useFavorites} from '../context/FavoritesContext';
import type {Product} from '../types/product';
import {BRAND} from '../utils';

type FavoriteHeartButtonProps = {
  product: Product;
  apiBaseUrl?: string;
  filled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  onToggle?: (nextFavorite: boolean) => void;
};

const SIZE_MAP = {
  sm: {font: 16, pad: 4, min: 28},
  md: {font: 20, pad: 6, min: 32},
  lg: {font: 22, pad: 8, min: 36},
} as const;

const FavoriteHeartButton = ({
  product,
  apiBaseUrl,
  filled,
  size = 'md',
  style,
  hitSlop = 8,
  onToggle,
}: FavoriteHeartButtonProps) => {
  const {isFavorite, toggleFavorite} = useFavorites();
  const saved = filled ?? isFavorite(product.id);
  const metrics = SIZE_MAP[size];

  const onPress = useCallback(() => {
    toggleFavorite(product, apiBaseUrl);
    onToggle?.(!saved);
  }, [apiBaseUrl, onToggle, product, saved, toggleFavorite]);

  return (
    <Pressable
      style={({pressed}) => [
        styles.btn,
        {
          minWidth: metrics.min,
          minHeight: metrics.min,
          padding: metrics.pad,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'}>
      <Text
        style={[
          styles.heart,
          {fontSize: metrics.font},
          saved ? styles.heartFilled : styles.heartOutline,
        ]}>
        {saved ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    lineHeight: 22,
  },
  heartOutline: {
    color: BRAND.maroonPrimary,
  },
  heartFilled: {
    color: BRAND.maroonPrimary,
    fontWeight: '700',
  },
});

export default FavoriteHeartButton;
