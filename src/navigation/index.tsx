import {NavigationContainer} from '@react-navigation/native';
import {Platform, StatusBar, useColorScheme} from 'react-native';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';

import type {RootState} from '../app/reducers';
import AuthNav from './AuthNav';
import MainNav from './MainNav';

const AppNavigation = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = !!auth?.data;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content', true);
    }
  }, [isDarkMode]);

  return (
    <NavigationContainer>{isLoggedIn ? <MainNav /> : <AuthNav />}</NavigationContainer>
  );
};

export default AppNavigation;
