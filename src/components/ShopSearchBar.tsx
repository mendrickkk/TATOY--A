import React from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {AppAlert} from './app_alert';
import {BRAND, FONTS} from '../utils';
import {IconScanner, IconSearch, IconSliders} from './ShopHeaderIcons';

export type ShopSearchBarProps = {
  style?: StyleProp<ViewStyle>;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.searchSurface,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    fontFamily: FONTS.body,
    flex: 1,
    marginLeft: 6,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  clearBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  clearText: {
    fontSize: 22,
    lineHeight: 24,
    color: '#6e6e6e',
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND.searchSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ShopSearchBar = ({
  style,
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = 'Search',
}: ShopSearchBarProps) => {
  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmitEditing?.();
  };

  return (
    <View style={[styles.row, style]}>
      <View style={styles.pill}>
        <IconSearch color={BRAND.iconTint} size={22} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9a9a9a"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Search bouquets by name"
        />
        {value.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onChangeText('')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() =>
            AppAlert.alert('Scanner', 'Barcode scanning is coming soon.')
          }
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityRole="button"
          accessibilityLabel="Scan barcode">
          <IconScanner color={BRAND.iconTint} size={22} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.filterBtn}
        onPress={() =>
          AppAlert.alert('Filters', 'Product filters are coming soon.')
        }
        accessibilityRole="button"
        accessibilityLabel="Filter products">
        <IconSliders color={BRAND.iconTint} size={22} />
      </TouchableOpacity>
    </View>
  );
};

export default ShopSearchBar;
