import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BRAND} from '../utils';

type Variant = 'outOfStock' | 'info';

type Props = {
  variant?: Variant;
  title: string;
  message?: string;
};

const StockBanner = ({variant = 'outOfStock', title, message}: Props) => {
  const isOos = variant === 'outOfStock';
  return (
    <View
      style={[styles.wrap, isOos ? styles.wrapOos : styles.wrapInfo]}
      accessibilityRole="text"
      accessibilityLabel={[title, message].filter(Boolean).join('. ')}>
      <Text style={[styles.title, isOos ? styles.titleOos : styles.titleInfo]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, isOos ? styles.messageOos : styles.messageInfo]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  wrapOos: {
    backgroundColor: 'rgba(110, 15, 15, 0.08)',
    borderColor: 'rgba(110, 15, 15, 0.2)',
  },
  wrapInfo: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  titleOos: {
    color: BRAND.maroonPrimary,
  },
  titleInfo: {
    color: '#374151',
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  messageOos: {
    color: '#6b7280',
  },
  messageInfo: {
    color: '#6b7280',
  },
});

export default StockBanner;
