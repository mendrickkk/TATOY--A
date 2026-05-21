import {createStackNavigator} from '@react-navigation/stack';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ShopScreen from '../screens/ShopScreen';
import {ROUTES} from '../utils';
import type {ShopStackParamList} from './types';

const Stack = createStackNavigator<ShopStackParamList>();

const ShopStack = () => (
  <Stack.Navigator initialRouteName={ROUTES.SHOP}>
    <Stack.Screen name={ROUTES.SHOP} component={ShopScreen} options={{headerShown: false}} />
    <Stack.Screen
      name={ROUTES.PRODUCT_DETAIL}
      component={ProductDetailScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

export default ShopStack;
