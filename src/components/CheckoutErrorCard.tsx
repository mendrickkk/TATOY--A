import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BRAND} from '../utils';

type Props = {
  title?: string;
  bullets: string[];
};

const CheckoutErrorCard = ({title = "Can't place order", bullets}: Props) => {
  if (bullets.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.card}
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${bullets.join(' ')}`}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>!</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {bullets.map(line => (
          <View key={line} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(110, 15, 15, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(110, 15, 15, 0.22)',
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: BRAND.maroonPrimary,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
});

export default CheckoutErrorCard;
