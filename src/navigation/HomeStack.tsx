import {createStackNavigator} from '@react-navigation/stack';

import {BRAND, ROUTES} from '../utils';
import CheckoutScreen from '../screens/CheckoutScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import PopularBouquetsScreen from '../screens/PopularBouquetsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import type {HomeStackParamList} from './types';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{title: 'Notifications'}}
      />
      <Stack.Screen
        name={ROUTES.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.POPULAR_BOUQUETS}
        component={PopularBouquetsScreen}
        options={{
          title: 'Popular bouquets',
          headerTintColor: BRAND.maroonPrimary,
          headerTitleStyle: {fontWeight: '700', color: BRAND.productTitle},
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.CHECKOUT}
        component={CheckoutScreen}
        options={{
          title: 'Checkout',
          headerTintColor: BRAND.maroonPrimary,
          headerTitleStyle: {fontWeight: '700', color: BRAND.productTitle},
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.ORDER_SUCCESS}
        component={OrderSuccessScreen}
        options={{
          title: 'Order confirmed',
          headerBackVisible: false,
          gestureEnabled: false,
          headerTintColor: BRAND.maroonPrimary,
          headerTitleStyle: {fontWeight: '700', color: BRAND.productTitle},
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: {backgroundColor: BRAND.pageMutedBg},
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
