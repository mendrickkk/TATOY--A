import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import FavoritesPanel from '../components/FavoritesPanel';

const FavoriteScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, {paddingTop: Math.max(insets.top, 12)}]}>
      <FavoritesPanel />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default FavoriteScreen;
