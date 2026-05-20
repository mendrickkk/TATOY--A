import React, {useCallback} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {authLogout} from '../app/actions';
import type {RootState} from '../app/reducers';
import {
  IconProfileLock,
  IconProfileLogout,
  IconProfileOrders,
  IconProfilePerson,
  IconProfileWishlist,
} from '../components/ProfileMenuIcons';
import type {MainTabParamList, ProfileStackParamList} from '../navigation/types';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {getAuthProfileFields} from '../utils/authProfile';
import {BRAND, FONTS, ROUTES} from '../utils';

type NavProp = StackNavigationProp<ProfileStackParamList, typeof ROUTES.PROFILE>;
type TabNavProp = BottomTabNavigationProp<MainTabParamList>;

type MenuItem = {
  key: string;
  label: string;
  Icon: React.ComponentType<{color: string; size?: number}>;
  onPress: () => void;
};

const ProfileScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const {displayName, avatarInitial} = getAuthProfileFields(auth.data);

  const onChangePassword = useCallback(() => {
    navigation.navigate(ROUTES.CHANGE_PASSWORD);
  }, [navigation]);

  const onSignOut = useCallback(() => {
    dispatch(authLogout());
  }, [dispatch]);

  const openWishlist = useCallback(() => {
    const tabNav = navigation.getParent<TabNavProp>();
    if (tabNav) {
      tabNav.navigate(ROUTES.TAB_FAVORITE);
      return;
    }
    navigation.navigate(ROUTES.MY_WISHLIST);
  }, [navigation]);

  const menuItems: MenuItem[] = [
    {
      key: 'info',
      label: 'Profile Info',
      Icon: IconProfilePerson,
      onPress: () => navigation.navigate(ROUTES.PROFILE_INFO),
    },
    {
      key: 'orders',
      label: 'My Orders',
      Icon: IconProfileOrders,
      onPress: () => navigation.navigate(ROUTES.MY_ORDERS),
    },
    {
      key: 'wishlist',
      label: 'My Wishlist',
      Icon: IconProfileWishlist,
      onPress: openWishlist,
    },
    {
      key: 'password',
      label: 'Change Password',
      Icon: IconProfileLock,
      onPress: onChangePassword,
    },
    {
      key: 'logout',
      label: 'Sign out',
      Icon: IconProfileLogout,
      onPress: onSignOut,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 24},
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar} accessibilityLabel={`Avatar ${avatarInitial}`}>
          <Text style={styles.avatarLetter}>{avatarInitial}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <View key={item.key}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}>
              <item.Icon color={BRAND.maroonPrimary} size={22} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLetter: {
    fontFamily: FONTS.body,
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  displayName: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: '700',
    color: BRAND.productTitle,
    textAlign: 'center',
  },
  menuCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: '500',
    color: BRAND.productTitle,
  },
  chevron: {
    fontSize: 22,
    color: '#9ca3af',
    fontWeight: '300',
    marginRight: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
});

export default ProfileScreen;
