import {createStackNavigator} from '@react-navigation/stack';

import {ROUTES} from '../utils';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import type {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
