import {createStackNavigator} from '@react-navigation/stack';

import {ROUTES} from '../utils';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
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
    </Stack.Navigator>
  );
};

export default MainNavigation;
