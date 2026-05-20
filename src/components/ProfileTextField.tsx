import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {BRAND, FONTS} from '../utils';

const BORDER = '#e5e7eb';
const PLACEHOLDER_GRAY = '#9ca3af';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  readOnlyHint?: string;
} & Pick<
  TextInputProps,
  'autoCapitalize' | 'keyboardType' | 'autoFocus' | 'onSubmitEditing' | 'returnKeyType'
>;

const ProfileTextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  readOnlyHint,
  autoCapitalize,
  keyboardType,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
}: Props) => {
  const displayValue = value.trim() || '—';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={PLACEHOLDER_GRAY}
          autoCapitalize={autoCapitalize ?? 'words'}
          autoCorrect={false}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
      ) : (
        <View style={[styles.input, styles.readOnlyBox]}>
          <Text style={styles.readOnlyValue}>{displayValue}</Text>
        </View>
      )}
      {readOnlyHint ? <Text style={styles.hint}>{readOnlyHint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: BRAND.maroonPrimary,
    marginBottom: 8,
  },
  input: {
    fontFamily: FONTS.body,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: BRAND.productTitle,
    minHeight: 48,
  },
  readOnlyBox: {
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  readOnlyValue: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: '#6b7280',
  },
  hint: {
    marginTop: 6,
    fontFamily: FONTS.body,
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 17,
  },
});

export default ProfileTextField;
