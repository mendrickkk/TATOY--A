import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useCart} from '../context/CartContext';
import type {HomeStackParamList, MainTabParamList} from '../navigation/types';
import {BRAND, ROUTES} from '../utils';

type NavProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.ORDER_SUCCESS>;
type SuccessRoute = RouteProp<HomeStackParamList, typeof ROUTES.ORDER_SUCCESS>;
type TabNavProp = BottomTabNavigationProp<MainTabParamList>;

const OrderSuccessScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<SuccessRoute>();
  const insets = useSafeAreaInsets();
  const {clearCart} = useCart();
  const orderNumber = route.params?.orderNumber?.trim();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const goMyOrders = useCallback(() => {
    const tabNav = navigation.getParent<TabNavProp>();
    if (tabNav) {
      tabNav.navigate(ROUTES.TAB_PROFILE, {screen: ROUTES.MY_ORDERS});
      return;
    }
    navigation.navigate(ROUTES.HOME);
  }, [navigation]);

  const goHome = useCallback(() => {
    const tabNav = navigation.getParent<TabNavProp>();
    if (tabNav) {
      tabNav.navigate(ROUTES.TAB_HOME, {screen: ROUTES.HOME});
      return;
    }
    navigation.navigate(ROUTES.HOME);
  }, [navigation]);

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20}]}>
      <View style={styles.card}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.subtitle}>
          Your order was submitted. Pay on delivery.
        </Text>
        {orderNumber ? (
          <Text style={styles.orderRef}>Order #{orderNumber}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goMyOrders}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="View my orders">
          <Text style={styles.primaryBtnText}>View my orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={goHome}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Continue shopping">
          <Text style={styles.secondaryBtnText}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  card: {
    marginTop: 48,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 36,
    fontWeight: '700',
    color: '#16a34a',
    lineHeight: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9ca3af',
    textAlign: 'center',
  },
  orderRef: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
});

export default OrderSuccessScreen;
