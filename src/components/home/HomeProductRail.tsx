import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FavoriteHeartButton from '../FavoriteHeartButton';
import type {Product} from '../../types/product';
import {getProductImageUri} from '../../app/api/products';
import {BRAND, FONTS} from '../../utils';
import {lowStockLabel} from '../../utils/stock';

const TILE_SIZE = 140;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type Props = {
  products: Product[];
  apiBaseUrl: string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptySubtitle?: string;
  onRetry?: () => void;
  onPressProduct: (product: Product) => void;
};

const HomeProductRail = ({
  products,
  apiBaseUrl,
  loading,
  error,
  emptyTitle = 'Nothing here yet',
  emptySubtitle = 'Check back soon.',
  onRetry,
  onPressProduct,
}: Props) => {
  if (loading && products.length === 0) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
        <Text style={styles.stateSub}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.state}>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry ? (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.state}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.stateSub}>{emptySubtitle}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      keyboardShouldPersistTaps="always">
      {products.map((item, index) => {
        const uri = getProductImageUri(apiBaseUrl, item.image);
        const scarcity = lowStockLabel(item);
        return (
          <React.Fragment key={`${item.id}-${index}`}>
            {index > 0 ? <View style={styles.gap} /> : null}
            <Pressable
              style={({pressed}) => [styles.tile, pressed && styles.tilePressed]}
              onPress={() => onPressProduct(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${priceFormatter.format(item.price)}`}>
              <View style={styles.imageShell}>
                {uri ? (
                  <Image source={{uri}} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={[styles.image, styles.placeholder]} />
                )}
                {scarcity ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{scarcity}</Text>
                  </View>
                ) : null}
                <FavoriteHeartButton
                  product={item}
                  apiBaseUrl={apiBaseUrl}
                  size="sm"
                  style={styles.heart}
                />
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>{priceFormatter.format(item.price)}</Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    paddingRight: 4,
    paddingBottom: 4,
  },
  gap: {
    width: 12,
  },
  tile: {
    width: TILE_SIZE,
  },
  tilePressed: {
    opacity: 0.92,
  },
  imageShell: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: BRAND.productTileBg,
  },
  image: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: BRAND.productTileBg,
  },
  placeholder: {
    opacity: 0.85,
  },
  heart: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
  },
  badge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(110, 15, 15, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FONTS.body,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontFamily: FONTS.body,
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.productTitle,
    lineHeight: 17,
    minHeight: 34,
  },
  price: {
    fontFamily: FONTS.body,
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  state: {
    minHeight: 140,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateSub: {
    fontFamily: FONTS.body,
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: '#a40000',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: FONTS.body,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default HomeProductRail;
