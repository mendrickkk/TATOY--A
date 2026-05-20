import React, {useCallback} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import ProfileDetailHeader from '../components/ProfileDetailHeader';
import type {RootState} from '../app/reducers';
import type {ProfileStackParamList} from '../navigation/types';
import {getAuthProfileFields} from '../utils/authProfile';
import {BRAND, FONTS, ROUTES} from '../utils';

type NavProp = StackNavigationProp<ProfileStackParamList, typeof ROUTES.PROFILE_INFO>;

function InfoField({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const ProfileInfoScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const {firstName, lastName, email, username} = getAuthProfileFields(auth.data);

  const onEdit = useCallback(() => {
    Alert.alert('Edit profile', 'Coming soon');
  }, []);

  return (
    <View style={styles.screen}>
      <ProfileDetailHeader
        title="My Profile"
        onBack={() => navigation.goBack()}
        onEdit={onEdit}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        <InfoField label="FIRST NAME" value={firstName} />
        <View style={styles.divider} />
        <InfoField label="LAST NAME" value={lastName} />
        <View style={styles.divider} />
        <InfoField label="EMAIL" value={email} />
        <View style={styles.divider} />
        <InfoField label="USERNAME" value={username} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  field: {
    paddingVertical: 16,
  },
  fieldLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: BRAND.maroonPrimary,
    marginBottom: 6,
  },
  fieldValue: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: BRAND.productTitle,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
});

export default ProfileInfoScreen;
