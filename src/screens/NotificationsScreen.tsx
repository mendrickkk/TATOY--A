import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BRAND} from '../utils';

const NotificationsScreen = () => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Your updates</Text>
      <Text style={styles.body}>
        You do not have any notifications yet. When orders or promotions arrive, they will
        appear here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
});

export default NotificationsScreen;
