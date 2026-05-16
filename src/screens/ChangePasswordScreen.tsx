import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {changePassword} from '../app/api/auth';
import {extractBearerJwtFromAuthData} from '../app/api/products';
import type {RootState} from '../app/reducers';
import ProfileDetailHeader from '../components/ProfileDetailHeader';
import ProfilePasswordField from '../components/ProfilePasswordField';
import {showSuccess} from '../components/alert_messages';
import type {ProfileStackParamList} from '../navigation/types';
import {BRAND, ROUTES} from '../utils';

type NavProp = StackNavigationProp<ProfileStackParamList, typeof ROUTES.CHANGE_PASSWORD>;

function isGoogleSignIn(authData: unknown): boolean {
  return (
    !!authData &&
    typeof authData === 'object' &&
    !Array.isArray(authData) &&
    (authData as Record<string, unknown>).provider === 'google'
  );
}

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const googleAccount = useMemo(() => isGoogleSignIn(auth.data), [auth.data]);

  const onSave = useCallback(async () => {
    if (googleAccount) {
      Alert.alert(
        'Google account',
        'Password is managed by Google Sign-In. Use your Google account settings to change it.',
      );
      return;
    }

    if (!currentPassword.trim()) {
      Alert.alert('Missing field', 'Enter your current password.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Missing field', 'Enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Invalid password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'New password and confirm password must match.');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Same password', 'Choose a different password than your current one.');
      return;
    }

    const token = extractBearerJwtFromAuthData(auth.data);
    if (!token) {
      Alert.alert(
        'Not available',
        'Your session does not support password change. Try signing out and back in with email and password.',
      );
      return;
    }

    setSaving(true);
    try {
      await changePassword(token, {
        currentPassword: currentPassword.trim(),
        newPassword,
      });
      showSuccess({
        title: 'Password updated',
        message: 'Your password has been changed.',
        type: 'success',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.goBack();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not change password';
      Alert.alert('Change password failed', message);
    } finally {
      setSaving(false);
    }
  }, [
    auth.data,
    confirmPassword,
    currentPassword,
    googleAccount,
    navigation,
    newPassword,
  ]);

  return (
    <View style={styles.screen}>
      <ProfileDetailHeader
        title="Change Password"
        onBack={() => navigation.goBack()}
        showEdit={false}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + 100},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Enter your current password, then choose a new one.
          </Text>
          <View style={styles.divider} />

          {googleAccount ? (
            <Text style={styles.googleNote}>
              You signed in with Google. Password changes are handled in your Google
              account.
            </Text>
          ) : null}

          <ProfilePasswordField
            label="CURRENT PASSWORD"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            autoFocus
            returnKeyType="next"
          />
          <ProfilePasswordField
            label="NEW PASSWORD"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            returnKeyType="next"
          />
          <ProfilePasswordField
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            returnKeyType="done"
            onSubmitEditing={() => void onSave()}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.saveBar, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={() => void onSave()}
          disabled={saving}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save password"
          accessibilityState={{disabled: saving}}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveLabel}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
  },
  divider: {
    marginTop: 16,
    marginBottom: 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
  googleNote: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    marginBottom: 16,
  },
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 16,
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
});

export default ChangePasswordScreen;
