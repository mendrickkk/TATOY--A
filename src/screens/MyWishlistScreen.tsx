import React from 'react';
import {StyleSheet, View} from 'react-native';

import FavoritesPanel from '../components/FavoritesPanel';

/** Same favorites list as the Favorite tab — single source of truth. */
const MyWishlistScreen = () => {
  return (
    <View style={styles.root}>
      <FavoritesPanel showTitle />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default MyWishlistScreen;
