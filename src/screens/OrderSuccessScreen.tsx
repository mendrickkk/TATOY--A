import React, {useCallback, useEffect} from 'react';
import {
  BackHandler,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
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
    const task = InteractionManager.runAfterInteractions(() => {
      clearCart();
    });
    return () => task.cancel();
  }, [clearCart]);

  const resetHomeStackToBrowse = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: ROUTES.HOME}],
      }),
    );
  }, [navigation]);

  const goMyOrders = useCallback(() => {
    resetHomeStackToBrowse();
    const tabNav = navigation.getParent<TabNavProp>();
    if (tabNav) {
      tabNav.navigate(ROUTES.TAB_PROFILE, {screen: ROUTES.MY_ORDERS});
      return;
    }
    navigation.navigate(ROUTES.HOME);
  }, [navigation, resetHomeStackToBrowse]);

  const goHome = useCallback(() => {
    resetHomeStackToBrowse();
    const tabNav = navigation.getParent<TabNavProp>();
    if (tabNav) {
      tabNav.navigate(ROUTES.TAB_HOME, {screen: ROUTES.HOME});
      return;
    }
    navigation.navigate(ROUTES.HOME);
  }, [navigation, resetHomeStackToBrowse]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [goHome]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {paddingBottom: insets.bottom + 24},
      ]}
      bounces={false}
      showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Order placed</Text>
        {orderNumber ? (
          <Text style={styles.orderRef}>Order #{orderNumber}</Text>
        ) : null}
        <Text style={styles.body}>
          Thank you for shopping with LaMendrickFlowerShop. You can view your order
          status in My orders.
        </Text>
        <Text style={styles.codLine}>Pay on delivery when your order arrives.</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goMyOrders}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="View order">
          <Text style={styles.primaryBtnText}>View order</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 32,
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
    borderColor: BRAND.maroonPrimary,
    backgroundColor: '#faf5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 36,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    lineHeight: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.productTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  orderRef: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 10,
  },
  codLine: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
});

export default OrderSuccessScreen;
