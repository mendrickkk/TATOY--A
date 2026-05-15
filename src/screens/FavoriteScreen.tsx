import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BRAND} from '../utils';

const FavoriteScreen = () => {
  const insets = useSafeAreaInsets();
  const [favorites] = useState<string[]>([]);

  return (
    <View style={[styles.root, {paddingTop: Math.max(insets.top, 16)}]}>
      <Text style={styles.title}>Favorite</Text>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    marginBottom: 12,
  },
  empty: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default FavoriteScreen;
