import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import type {StackNavigationProp} from '@react-navigation/stack';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {SafeAreaView} from 'react-native-safe-area-context';

import {FONTS, IMG, ROUTES} from '../../utils';
import {authLogin, USER_LOGIN_COMPLETE} from '../../app/actions';
import type {RootState} from '../../app/reducers';
import type {AuthStackParamList} from '../../navigation/types';
import sign_in_with_google from '../../utils/firebase';
import {showSuccess} from '../../components/alert_messages';

type NavProp = StackNavigationProp<AuthStackParamList>;

const MAROON = '#701104';
const BORDER = '#DDDDDD';
const SUBTEXT_GRAY = '#444444';
const PLACEHOLDER_GRAY = '#AAAAAA';
const MUTED_GRAY = '#666666';
const LINK_DARK = '#222222';

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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Image
            source={IMG.LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="KT logo"
          />
          <Text style={styles.title}>LOGIN</Text>
          <Text style={styles.subtitle}>
            Please enter your e-mail and password:
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={PLACEHOLDER_GRAY}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() =>
                Alert.alert(
                  'Forgot password?',
                  'Password recovery is not available in the app yet. Please contact support if you need help.',
                )
              }
              hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, auth.isLoading && styles.primaryDisabled]}
            disabled={auth.isLoading}
            onPress={() => {
              if (username === '' || password === '') {
                Alert.alert(
                  'Invalid Credentials',
                  'Please enter your e-mail and password.',
                );
                return;
              }

              dispatch(
                authLogin({
                  username,
                  password,
                }),
              );
            }}>
            {auth.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            disabled={isGoogleLoading || auth.isLoading}
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

          <View style={styles.footerRow}>
            <Text style={styles.footerMuted}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  logo: {
    width: 240,
    height: 80,
    alignSelf: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: '300',
    color: MAROON,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: SUBTEXT_GRAY,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    fontFamily: FONTS.body,
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
    marginBottom: 16,
  },
  passwordRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
    minHeight: 48,
  },
  passwordInput: {
    fontFamily: FONTS.body,
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
  },
  forgotWrap: {
    paddingRight: 12,
    paddingLeft: 4,
    justifyContent: 'center',
  },
  forgotText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: MUTED_GRAY,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: MAROON,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    fontFamily: FONTS.body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 4,
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 28,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerMuted: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: MUTED_GRAY,
  },
  footerLink: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: '700',
    color: LINK_DARK,
  },
});

export default Login;
