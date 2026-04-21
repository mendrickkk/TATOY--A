import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';

import {authLogout} from '../app/actions';
import type {RootStackParamList} from '../navigation/types';
import {IMG, ROUTES} from '../utils';

type NavProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'red',
      }}>
      <Image source={IMG.LOGO} style={{width: 320, height: 100}} />
      <Text style={{fontSize: 20}}>HomeScreen</Text>

      <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE)}>
        <View
          style={{
            backgroundColor: 'green',
            padding: 10,
            borderRadius: 20,
            marginTop: 20,
          }}>
          <Text style={{fontSize: 24, color: 'white'}}>VISIT PROFILE</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(authLogout())}>
        <View
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 20,
            marginTop: 20,
          }}>
          <Text style={{fontSize: 24, color: 'white'}}>LOG OUT</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
