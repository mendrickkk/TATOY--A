import React, {useCallback} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {authLogout} from '../app/actions';
import type {RootState} from '../app/reducers';
import AppHeader from '../components/AppHeader';
import HeroCarousel from '../components/HeroCarousel';
import ShopSearchBar from '../components/ShopSearchBar';
import type {RootStackParamList} from '../navigation/types';
import {BRAND, ROUTES} from '../utils';
import {getUserDisplayName} from '../utils/userDisplayName';

type NavProp = StackNavigationProp<RootStackParamList>;

const DEMO_BADGE: number | boolean = true;

const HomeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const displayName = getUserDisplayName(auth.data);
  const heroContainerStyle = [styles.hero, {paddingTop: Math.max(insets.top, 12)}];

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(BRAND.maroonPrimary);
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#ffffff');
        }
      };
    }, []),
  );

  return (
    <View style={styles.screen}>
      <View style={heroContainerStyle}>
        <AppHeader
          userDisplayName={displayName}
          onPressNotifications={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          notificationBadge={DEMO_BADGE}
        />
        <ShopSearchBar style={styles.searchSpacing} />
      </View>

      <View style={styles.body}>
        <HeroCarousel />
        <View style={styles.bodySpacer} />
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <Text style={styles.link}>Profile</Text>
          </TouchableOpacity>
          <Text style={styles.sep}>·</Text>
          <TouchableOpacity
            onPress={() => dispatch(authLogout())}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <Text style={styles.link}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  hero: {
    backgroundColor: BRAND.maroonPrimary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchSpacing: {
    marginTop: 14,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'stretch',
  },
  bodySpacer: {
    flex: 1,
    minHeight: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    textDecorationLine: 'underline',
  },
  sep: {
    fontSize: 18,
    color: '#aaaaaa',
  },
});

export default HomeScreen;
