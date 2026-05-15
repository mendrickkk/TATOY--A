import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {authLogout} from '../app/actions';
import type {RootState} from '../app/reducers';
import {BRAND} from '../utils';
import {getUserDisplayName} from '../utils/userDisplayName';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const displayName = getUserDisplayName(auth.data);

  return (
    <View style={[styles.root, {paddingTop: Math.max(insets.top, 16)}]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.name}>{displayName || 'Signed in'}</Text>
      <Text style={styles.hint}>Account settings and orders will appear here.</Text>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => dispatch(authLogout())}
        accessibilityRole="button"
        accessibilityLabel="Log out">
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND.productTitle,
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    marginBottom: 24,
  },
  logoutBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
});

export default ProfileScreen;
