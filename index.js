/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);


// error screen
// import React from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// import { authLogout } from '../app/sagas/actions';
// import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

// export default function ErrorScreen() {
//   const dispatch = useDispatch();
//   const { isError, error } = useSelector((state) => state.auth || {});

//   if (!isError) return null;

//   const message = typeof error === 'string' && error.trim().length ? error.trim() : 'Something went wrong';

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.cardBackground }} edges={['top']}>
//       <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl }}>
//         <View
//           style={{
//             backgroundColor: COLORS.white,
//             borderRadius: RADIUS.xl,
//             padding: SPACING.xl,
//             ...SHADOWS.md,
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 22,
//               fontWeight: '700',
//               color: COLORS.text,
//               marginBottom: SPACING.sm,
//             }}
//           >
//             Error Screen
//           </Text>

//           <Text
//             style={{
//               color: '#c62828',
//               fontSize: 14,
//               fontWeight: '600',
//               marginBottom: SPACING.lg,
//             }}
//           >
//             {message}
//           </Text>

//           <TouchableOpacity
//             activeOpacity={0.85}
//             onPress={() => dispatch(authLogout())}
//             style={{
//               backgroundColor: COLORS.primary,
//               paddingVertical: SPACING.md,
//               paddingHorizontal: SPACING.xl,
//               borderRadius: RADIUS.md,
//               alignItems: 'center',
//               justifyContent: 'center',
//               ...SHADOWS.sm,
//             }}
//           >
//             <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>Back to Login</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );


//index.js 

// import { createStackNavigator } from '@react-navigation/stack';
// import { useSelector } from 'react-redux';

// // screens
// import HomeScreen from '../screens/HomeScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import Login from '../screens/auth/Login';
// import Register from '../screens/auth/Register';

// import ErrorScreen from './Error';

// // utils
// import { NavigationContainer } from '@react-navigation/native';
// import { ROUTES } from '../utils';
// import { COLORS } from '../utils/theme';

// const Stack = createStackNavigator();

// const screenOptions = {
//   headerStyle: {
//     backgroundColor: COLORS.white,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   headerTintColor: COLORS.text,
//   headerTitleStyle: {
//     fontWeight: '600',
//     fontSize: 18,
//   },
//   headerShadowVisible: false,
//   contentStyle: { backgroundColor: COLORS.cardBackground },
// };

// const AuthStack = () => (
//   <Stack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={screenOptions}>
//     <Stack.Screen name={ROUTES.LOGIN} component={Login} options={{ headerShown: false }} />
//     <Stack.Screen name={ROUTES.REGISTER} component={Register} options={{ title: 'Register' }} />
//   </Stack.Navigator>
// );

// const MainStack = () => (
//   <Stack.Navigator initialRouteName={ROUTES.HOME} screenOptions={screenOptions}>
//     <Stack.Screen
//       name={ROUTES.HOME}
//       component={HomeScreen}
//       options={{ headerShown: false }}
//     />
//     <Stack.Screen
//       name={ROUTES.PROFILE}
//       component={ProfileScreen}
//       options={{ headerShown: false }}
//     />
//   </Stack.Navigator>
// );

// const ErrorStack = () => (
//   <Stack.Navigator initialRouteName={ROUTES.ERROR} screenOptions={screenOptions}>
//     <Stack.Screen name={ROUTES.ERROR} component={ErrorScreen} options={{ headerShown: false }} />
//   </Stack.Navigator>
// );

// const MainNavigation = () => {
//   const { isError, data } = useSelector((state) => state.auth || {});
//   const isLoggedIn = data != null;

//   if (isError) return <ErrorStack />;
//   return isLoggedIn ? <MainStack /> : <AuthStack />;
// };

// export default () => {
//   return (
//     <NavigationContainer>
//       <MainNavigation />
//     </NavigationContainer>
//   );
// };

//login

//const { data: authData, isLoading } = useSelector((state) => state.auth);

