import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ProfileEmptyStateBox from '../components/ProfileEmptyStateBox';
import {BRAND} from '../utils';

const MyOrdersScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {paddingBottom: insets.bottom + 24},
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>MY ORDERS</Text>
      <Text style={styles.subtitle}>
        Order history, status, and reference for tracking.
      </Text>
      <View style={styles.divider} />
      <ProfileEmptyStateBox>
        No orders yet. When you place an order linked to your account, it will show
        here.
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

export default MyOrdersScreen;
