import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {BRAND, FONTS} from '../../utils';

type Props = {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  /** Tighter bottom gap when chips sit directly below. */
  compact?: boolean;
};

const HomeSectionHeader = ({
  title,
  subtitle,
  onSeeAll,
  seeAllLabel = 'See all',
  compact = false,
}: Props) => (
  <View style={[styles.wrap, compact && styles.wrapCompact]}>
    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {onSeeAll ? (
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        accessibilityRole="button"
        accessibilityLabel={`${seeAllLabel}, ${title}`}>
        <Text style={styles.seeAll}>{seeAllLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  wrapCompact: {
    marginBottom: 4,
  },
  textBlock: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.productTitle,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FONTS.body,
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  seeAll: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
});

export default HomeSectionHeader;
