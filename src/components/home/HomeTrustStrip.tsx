import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BRAND, FONTS} from '../../utils';

const TRUST_ITEMS = [
  {emoji: '🌸', title: 'Farm-fresh', line: 'Handpicked blooms'},
  {emoji: '🛵', title: 'Local delivery', line: 'Careful handling'},
  {emoji: '💵', title: 'COD available', line: 'Pay on delivery'},
] as const;

const HomeTrustStrip = () => (
  <View style={styles.wrap}>
    <Text style={styles.heading}>Why La Mendrick</Text>
    <View style={styles.row}>
      {TRUST_ITEMS.map(item => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.line}>{item.line}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  heading: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.productTitle,
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ebe6f0',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    textAlign: 'center',
  },
  line: {
    fontFamily: FONTS.body,
    marginTop: 3,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default HomeTrustStrip;
