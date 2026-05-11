import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import type {StackNavigationProp} from '@react-navigation/stack';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {SafeAreaView} from 'react-native-safe-area-context';

import {userRegister} from '../../app/api/auth';
import {IMG, ROUTES} from '../../utils';
import {USER_LOGIN_COMPLETE} from '../../app/actions';
import type {RootStackParamList} from '../../navigation/types';
import sign_in_with_google from '../../utils/firebase';
import {showSuccess} from '../../components/alert_messages';

type NavProp = StackNavigationProp<RootStackParamList>;

const MAROON = '#701104';
const BORDER = '#DDDDDD';
const SUBTITLE_BLACK = '#111111';
const PLACEHOLDER_GRAY = '#AAAAAA';
const MUTED_GRAY = '#666666';
const LINK_DARK = '#222222';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();

  const onRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Missing fields', 'Please fill in your first name, last name, and email.');
      return;
    }
    if (!password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password must match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }

    const trimmedEmail = email.trim();
    // Backend requires `username`; login uses email in the username field — keep them aligned.
    const username = trimmedEmail;

    setIsSubmitting(true);
    try {
      const data = (await userRegister({
        username,
        email: trimmedEmail,
        password,
      })) as {message?: string};

      const message =
        typeof data?.message === 'string' && data.message.length > 0
          ? data.message
          : 'Registration complete. You can sign in after verifying your email if required.';

      Alert.alert('Success', message, [
        {text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN)},
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      Alert.alert('Registration failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text style={styles.title}>REGISTER</Text>
          <Text style={styles.subtitle}>Please fill in the information below:</Text>

          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={PLACEHOLDER_GRAY}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor={PLACEHOLDER_GRAY}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={PLACEHOLDER_GRAY}
            value={email}
            onChangeText={setEmail}
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
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.toggleWrap}
              onPress={() => setShowPassword(v => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
              <Text style={styles.toggleIcon} importantForAccessibility="no">
                {showPassword ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.toggleWrap}
              onPress={() => setShowConfirmPassword(v => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
              }
              hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
              <Text style={styles.toggleIcon} importantForAccessibility="no">
                {showConfirmPassword ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={() => void onRegister()}
            disabled={isSubmitting}
            accessibilityState={{disabled: isSubmitting}}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>CREATE MY ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            disabled={isGoogleLoading || isSubmitting}
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
                  message: 'Welcome!',
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
            <Text style={styles.footerMuted}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    fontSize: 28,
    fontWeight: '400',
    color: MAROON,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: undefined,
    }),
  },
  subtitle: {
    fontSize: 15,
    color: SUBTITLE_BLACK,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
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
    marginBottom: 16,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
  },
  toggleWrap: {
    paddingRight: 14,
    paddingLeft: 6,
    justifyContent: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: MAROON,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
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
    fontSize: 15,
    color: MUTED_GRAY,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: LINK_DARK,
  },
});

export default Register;
