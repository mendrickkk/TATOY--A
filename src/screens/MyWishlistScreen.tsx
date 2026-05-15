import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ProfileEmptyStateBox from '../components/ProfileEmptyStateBox';
import {BRAND} from '../utils';

const MyWishlistScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {paddingBottom: insets.bottom + 24},
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>MY WISHLIST</Text>
      <Text style={styles.subtitle}>Saved flower arrangements.</Text>
      <View style={styles.divider} />
      <ProfileEmptyStateBox>
        Nothing saved yet. Wishlist items will show here when that feature is
        connected.
      </ProfileEmptyStateBox>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
  },
  divider: {
    marginTop: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
});

export default MyWishlistScreen;
