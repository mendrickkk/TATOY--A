import {createStackNavigator} from '@react-navigation/stack';

import {BRAND, ROUTES} from '../utils';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import MyWishlistScreen from '../screens/MyWishlistScreen';
import ProfileInfoScreen from '../screens/ProfileInfoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type {ProfileStackParamList} from './types';

const Stack = createStackNavigator<ProfileStackParamList>();

const profileSubHeader = {
  headerTintColor: BRAND.maroonPrimary,
  headerTitleStyle: {fontWeight: '700' as const, color: BRAND.productTitle},
  headerStyle: {backgroundColor: '#ffffff'},
  headerShadowVisible: false,
};

const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.PROFILE}>
      <Stack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_INFO}
        component={ProfileInfoScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.MY_ORDERS}
        component={MyOrdersScreen}
        options={{title: 'My Orders', ...profileSubHeader}}
      />
      <Stack.Screen
        name={ROUTES.MY_WISHLIST}
        component={MyWishlistScreen}
        options={{title: 'My Wishlist', ...profileSubHeader}}
      />
      <Stack.Screen
        name={ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
