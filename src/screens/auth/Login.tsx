import {useEffect, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import type {StackNavigationProp} from '@react-navigation/stack';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';


import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import {IMG, ROUTES} from '../../utils';
import {authLogin, USER_LOGIN_COMPLETE} from '../../app/actions';
import type {RootState} from '../../app/reducers';
import type {RootStackParamList} from '../../navigation/types';
import sign_in_with_google from '../../utils/firebase';
import {showSuccess} from '../../components/alert_messages';

type NavProp = StackNavigationProp<RootStackParamList>;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Login failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={IMG.LOGO}
        style={{width: 240, height: 80, marginBottom: 40}}
        resizeMode="contain"
      />

      <View style={{width: '100%'}}>
        <CustomTextInput
          label="Username"
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
      </View>

      <CustomButton
        label="LOGIN"
        containerStyle={{
          backgroundColor: '#1E3A8A',
          borderRadius: 10,
          marginVertical: 20,
          width: '85%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={() => {
          if (username === '' || password === '') {
            Alert.alert(
              'Invalid Credentials',
              'Please enter valid username and password',
            );
            return;
          }

          dispatch(
            authLogin({
              username,
              password,
            }),
          );
        }}
      />

      <GoogleSigninButton
        style={{width: '85%', height: 48, marginBottom: 10}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        disabled={isGoogleLoading}
        onPress={async () => {
          if (isGoogleLoading) {
            return;
          }

          setIsGoogleLoading(true);
          try {
            const response = await sign_in_with_google();
            if (!response) {
              return;
            }

            dispatch({
              type: USER_LOGIN_COMPLETE,
              payload: {
                provider: 'google',
                userInfo: response.userInfo,
              },
            });

            showSuccess({
              title: 'Google Sign-In successful',
              message: 'Welcome back!',
              type: 'success',
              position: 'top',
              visibilityTime: 3000,
            });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Google sign-in failed';
            Alert.alert('Google sign-in failed', message);
          } finally {
            setIsGoogleLoading(false);
          }
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>Create an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{color: 'green', marginLeft: 5, fontWeight: 'bold'}}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
