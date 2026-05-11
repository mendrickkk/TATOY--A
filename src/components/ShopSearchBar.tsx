import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {BRAND} from '../utils';
import {IconScanner, IconSearch, IconSliders} from './ShopHeaderIcons';

export type ShopSearchBarProps = {
  style?: StyleProp<ViewStyle>;
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
    flex: 1,
    marginLeft: 6,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
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

const ShopSearchBar = ({style}: ShopSearchBarProps) => {
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.row, style]}>
      <View style={styles.pill}>
        <IconSearch color={BRAND.iconTint} size={22} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor="#9a9a9a"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Scanner', 'Barcode scanning is coming soon.', [{text: 'OK'}])
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
          Alert.alert('Filters', 'Product filters are coming soon.', [{text: 'OK'}])
        }
        accessibilityRole="button"
        accessibilityLabel="Filter products">
        <IconSliders color={BRAND.iconTint} size={22} />
      </TouchableOpacity>
    </View>
  );
};

export default ShopSearchBar;
