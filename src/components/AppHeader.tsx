import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {BRAND} from '../utils';
import {IconBell} from './ShopHeaderIcons';

export type AppHeaderProps = {
  /** Shown after “Hello,” — typically username from auth. */
  userDisplayName: string;
  onPressNotifications: () => void;
  /** If > 0, shows a red badge (numeric). If `true`, shows a dot only. */
  notificationBadge?: number | boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  greeting: {
    color: BRAND.headerTextMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    color: BRAND.headerText,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  nameBlock: {
    flex: 1,
    paddingRight: 12,
  },
  bellOuter: {
    position: 'relative',
    backgroundColor: BRAND.maroonDark,
    borderRadius: 14,
    padding: 10,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: '#e53935',
    borderWidth: 1.5,
    borderColor: BRAND.maroonDark,
  },
  badgeCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BRAND.maroonDark,
  },
  badgeCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

const AppHeader = ({
  userDisplayName,
  onPressNotifications,
  notificationBadge = true,
}: AppHeaderProps) => {
  const safeName = userDisplayName.trim() || 'Guest';
  const showNumeric = typeof notificationBadge === 'number' && notificationBadge > 0;
  const showDot = notificationBadge === true;

  return (
    <View style={styles.row}>
      <View style={styles.nameBlock} accessibilityRole="header">
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {safeName}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.bellOuter}
        onPress={onPressNotifications}
        accessibilityRole="button"
        accessibilityLabel="Notifications">
        <IconBell color={BRAND.headerText} size={24} />
        {showNumeric ? (
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>
              {notificationBadge > 9 ? '9+' : String(notificationBadge)}
            </Text>
          </View>
        ) : showDot ? (
          <View style={styles.badgeDot} />
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default AppHeader;
