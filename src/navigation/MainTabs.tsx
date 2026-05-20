import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  IconTabCart,
  IconTabFavorite,
  IconTabHome,
  IconTabProfile,
} from '../components/TabBarIcons';
import {useCart} from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import {BRAND, FONTS, ROUTES} from '../utils';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const INACTIVE = '#9ca3af';
const TAB_BAR_BASE_HEIGHT = 56;

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  Icon: React.ComponentType<{color: string; size?: number}>;
};

function TabBarIcon({focused, color, size, Icon}: TabIconProps) {
  return (
    <View style={styles.iconSlot}>
      {focused ? <View style={styles.activePill} /> : null}
      <Icon color={color} size={size} />
    </View>
  );
}

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const {itemCount} = useCart();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const cartBadge =
    itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : undefined;

  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: BRAND.maroonPrimary,
    tabBarInactiveTintColor: INACTIVE,
    tabBarStyle: {
      backgroundColor: '#ffffff',
      borderTopColor: '#e8e8e8',
      borderTopWidth: StyleSheet.hairlineWidth,
      height: tabBarHeight,
      paddingBottom: insets.bottom,
      paddingTop: 6,
    },
    tabBarLabelStyle: styles.tabLabel,
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused, color, size}) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={IconTabHome} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_FAVORITE}
        component={FavoriteScreen}
        options={{
          tabBarLabel: 'Favorite',
          tabBarIcon: ({focused, color, size}) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={IconTabFavorite} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_CART}
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: cartBadge,
          tabBarIcon: ({focused, color, size}) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={IconTabCart} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_PROFILE}
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused, color, size}) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={IconTabProfile} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  iconSlot: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(110, 15, 15, 0.1)',
    borderRadius: 16,
  },
});

export default MainTabs;
