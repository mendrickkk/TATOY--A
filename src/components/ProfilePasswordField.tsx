import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';

import {BRAND} from '../utils';

const BORDER = '#DDDDDD';
const PLACEHOLDER_GRAY = '#AAAAAA';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
} & Pick<TextInputProps, 'autoFocus' | 'onSubmitEditing' | 'returnKeyType'>;

/**
 * Profile-area password field: maroon uppercase label (Profile Info) +
 * bordered row with visibility toggle (Register / Login).
 */
const ProfilePasswordField = ({
  label,
  value,
  onChangeText,
  placeholder,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
}: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={PLACEHOLDER_GRAY}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setVisible(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
          hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
          <Text style={styles.toggleIcon} importantForAccessibility="no">
            {visible ? '🙈' : '👁'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: BRAND.maroonPrimary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: BRAND.productTitle,
  },
  toggle: {
    paddingRight: 14,
    paddingLeft: 6,
    justifyContent: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
});

export default ProfilePasswordField;
