import {createStackNavigator} from '@react-navigation/stack';

import {BRAND, ROUTES} from '../utils';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PopularBouquetsScreen from '../screens/PopularBouquetsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
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
    </Stack.Navigator>
  );
};

export default MainNavigation;
