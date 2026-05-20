import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {authProfileUpdate} from '../app/actions';
import {updateProfile} from '../app/api/auth';
import {extractBearerJwtFromAuthData} from '../app/api/products';
import type {RootState} from '../app/reducers';
import ProfileDetailHeader from '../components/ProfileDetailHeader';
import ProfileTextField from '../components/ProfileTextField';
import {AppAlert, showError, showSuccess} from '../components/alert_messages';
import type {ProfileStackParamList} from '../navigation/types';
import {
  getAuthProfileFields,
  isGoogleAuthProvider,
  mergeProfileIntoAuthData,
  preserveAuthSessionFields,
  profileFieldsToFormValues,
  type ProfileFormValues,
} from '../utils/authProfile';
import {BRAND, FONTS, ROUTES} from '../utils';

type NavProp = StackNavigationProp<ProfileStackParamList, typeof ROUTES.PROFILE_INFO>;

function ProfileSummaryCard({
  displayName,
  avatarInitial,
  email,
}: {
  displayName: string;
  avatarInitial: string;
  email: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryAvatar}>
        <Text style={styles.summaryAvatarLetter}>{avatarInitial}</Text>
      </View>
      <View style={styles.summaryText}>
        <Text style={styles.summaryName} numberOfLines={2}>
          {displayName}
        </Text>
        <Text style={styles.summaryEmail} numberOfLines={1}>
          {email}
        </Text>
      </View>
    </View>
  );
}

function ViewField({label, value}: {label: string; value: string}) {
  const display = value.trim() || '—';
  return (
    <View style={styles.viewField}>
      <Text style={styles.viewLabel}>{label}</Text>
      <Text style={styles.viewValue}>{display}</Text>
    </View>
  );
}

const ProfileInfoScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);

  const profile = useMemo(() => getAuthProfileFields(auth.data), [auth.data]);
  const googleAccount = useMemo(() => isGoogleAuthProvider(auth.data), [auth.data]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormValues>(() =>
    profileFieldsToFormValues(profile),
  );

  useEffect(() => {
    if (!editing) {
      setForm(profileFieldsToFormValues(profile));
    }
  }, [profile, editing]);

  const resetForm = useCallback(() => {
    setForm(profileFieldsToFormValues(getAuthProfileFields(auth.data)));
  }, [auth.data]);

  const exitEditMode = useCallback(() => {
    resetForm();
    setEditing(false);
  }, [resetForm]);

  const handleBack = useCallback(() => {
    if (!editing) {
      navigation.goBack();
      return;
    }
    AppAlert.alert('Discard changes?', 'Your edits have not been saved.', [
      {text: 'Keep editing', style: 'cancel'},
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          exitEditMode();
          navigation.goBack();
        },
      },
    ]);
  }, [editing, exitEditMode, navigation]);

  const onCancelEdit = useCallback(() => {
    AppAlert.alert('Discard changes?', 'Your edits have not been saved.', [
      {text: 'Keep editing', style: 'cancel'},
      {text: 'Discard', style: 'destructive', onPress: exitEditMode},
    ]);
  }, [exitEditMode]);

  const validateForm = useCallback((): string | null => {
    if (!form.firstName.trim()) {
      return 'First name is required.';
    }
    if (!form.lastName.trim()) {
      return 'Last name is required.';
    }
    if (!form.email.trim()) {
      return 'Email is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }
    if (!form.username.trim()) {
      return 'Username is required.';
    }
    return null;
  }, [form]);

  const onSave = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      AppAlert.alert('Check your details', validationError);
      return;
    }

    const token = extractBearerJwtFromAuthData(auth.data);
    setSaving(true);

    let serverSynced = false;
    try {
      if (token) {
        await updateProfile(token, form);
        serverSynced = true;
      }
    } catch (e) {
      const status =
        e && typeof e === 'object' && 'status' in e
          ? Number((e as {status: number}).status)
          : 0;
      const isMissingEndpoint = status === 404 || status === 405;
      if (!isMissingEndpoint && token) {
        const message = e instanceof Error ? e.message : 'Could not update profile';
        showError({title: 'Save failed', message});
        setSaving(false);
        return;
      }
    }

    const merged = preserveAuthSessionFields(
      auth.data,
      mergeProfileIntoAuthData(auth.data, form),
    );
    dispatch(authProfileUpdate(merged));
    setEditing(false);

    showSuccess({
      title: 'Profile saved',
      message: serverSynced
        ? 'Your profile has been updated.'
        : 'Saved on this device. Add a profile API on the server to sync across devices.',
      visibilityTime: 3500,
    });
    setSaving(false);
  }, [auth.data, dispatch, form, validateForm]);

  const patchForm = useCallback((key: keyof ProfileFormValues, value: string) => {
    setForm(prev => ({...prev, [key]: value}));
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileDetailHeader
        title="My Profile"
        onBack={handleBack}
        isEditing={editing}
        onEdit={() => setEditing(true)}
        onSave={onSave}
        saving={saving}
        showEdit={!editing}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + (editing ? 100 : 28)},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ProfileSummaryCard
          displayName={profile.displayName}
          avatarInitial={profile.avatarInitial}
          email={profile.email}
        />

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>
            {editing ? 'Edit your details' : 'Account details'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {editing
              ? 'Update your name and username. Email may be read-only for Google sign-in.'
              : 'Tap the pencil above to update your information.'}
          </Text>

          {editing ? (
            <>
              <ProfileTextField
                label="FIRST NAME"
                value={form.firstName}
                onChangeText={v => patchForm('firstName', v)}
                autoCapitalize="words"
                autoFocus
              />
              <ProfileTextField
                label="LAST NAME"
                value={form.lastName}
                onChangeText={v => patchForm('lastName', v)}
                autoCapitalize="words"
              />
              <ProfileTextField
                label="EMAIL"
                value={form.email}
                onChangeText={v => patchForm('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!googleAccount}
                readOnlyHint={
                  googleAccount ? 'Managed by your Google account.' : undefined
                }
              />
              <ProfileTextField
                label="USERNAME"
                value={form.username}
                onChangeText={v => patchForm('username', v)}
                autoCapitalize="none"
              />
            </>
          ) : (
            <>
              <ViewField label="FIRST NAME" value={profile.firstName} />
              <View style={styles.fieldSep} />
              <ViewField label="LAST NAME" value={profile.lastName} />
              <View style={styles.fieldSep} />
              <ViewField label="EMAIL" value={profile.email} />
              <View style={styles.fieldSep} />
              <ViewField label="USERNAME" value={profile.username} />
            </>
          )}
        </View>
      </ScrollView>

      {editing ? (
        <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
          <Pressable
            style={({pressed}) => [styles.footerCancel, pressed && styles.footerPressed]}
            onPress={onCancelEdit}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Cancel editing">
            <Text style={styles.footerCancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({pressed}) => [
              styles.footerSave,
              pressed && styles.footerPressed,
              saving && styles.footerSaveDisabled,
            ]}
            onPress={onSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save profile">
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.footerSaveText}>Save changes</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAvatarLetter: {
    fontFamily: FONTS.body,
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryText: {
    flex: 1,
    marginLeft: 14,
  },
  summaryName: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.productTitle,
  },
  summaryEmail: {
    marginTop: 4,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.productTitle,
  },
  cardSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#6b7280',
  },
  viewField: {
    paddingVertical: 12,
  },
  viewLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: BRAND.maroonPrimary,
    marginBottom: 6,
  },
  viewValue: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: BRAND.productTitle,
    lineHeight: 22,
  },
  fieldSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  footerCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  footerCancelText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  footerSave: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  footerSaveDisabled: {
    opacity: 0.75,
  },
  footerSaveText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerPressed: {
    opacity: 0.92,
  },
});

export default ProfileInfoScreen;
