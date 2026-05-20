import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {AppAlert} from '../app_alert';
import {BRAND, FONTS} from '../../utils';

const HomePromoBanner = () => (
  <Pressable
    style={({pressed}) => [styles.banner, pressed && styles.bannerPressed]}
    onPress={() =>
      AppAlert.alert(
        'Weekend bouquet deal',
        'Ask our team about weekend bundles when you order.',
      )
    }
    accessibilityRole="button"
    accessibilityLabel="Weekend bouquet deal, learn more">
    <View style={styles.copy}>
      <Text style={styles.kicker}>WEEKEND SPECIAL</Text>
      <Text style={styles.title}>Bundle & save on bouquets</Text>
      <Text style={styles.sub}>Perfect for celebrations — limited slots daily.</Text>
    </View>
    <View style={styles.cta}>
      <Text style={styles.ctaText}>Learn more</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    overflow: 'hidden',
  },
  bannerPressed: {
    opacity: 0.94,
  },
  copy: {
    flex: 1,
    paddingRight: 10,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.75)',
  },
  title: {
    fontFamily: FONTS.display,
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
  },
  sub: {
    fontFamily: FONTS.body,
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  cta: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
});

export default HomePromoBanner;
