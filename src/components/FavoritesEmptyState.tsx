import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BRAND} from '../utils';

const FavoritesEmptyState = () => {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={styles.circle}>
        <Text style={styles.heartIcon}>♡</Text>
      </View>
      <Text style={styles.title}>Oops! Nothing here.</Text>
      <Text style={styles.subtitle}>No bouquets saved right now.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heartIcon: {
    fontSize: 36,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.productTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default FavoritesEmptyState;
