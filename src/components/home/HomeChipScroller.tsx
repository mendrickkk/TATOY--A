import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import type {HomeChip} from '../../utils/homeCatalog';
import {BRAND, FONTS} from '../../utils';

type Props = {
  chips: HomeChip[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showAllChip?: boolean;
  /** Extra space above the chip row (below section title). */
  topSpacing?: number;
};

const HomeChipScroller = ({
  chips,
  selectedId,
  onSelect,
  showAllChip = true,
  topSpacing = 0,
}: Props) => {
  if (chips.length === 0 && !showAllChip) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, topSpacing > 0 ? {marginTop: topSpacing} : null]}
      keyboardShouldPersistTaps="always">
      {showAllChip ? (
        <Pressable
          style={[styles.chip, selectedId === null && styles.chipActive]}
          onPress={() => onSelect(null)}
          accessibilityRole="button"
          accessibilityState={{selected: selectedId === null}}>
          <Text style={[styles.chipText, selectedId === null && styles.chipTextActive]}>All</Text>
        </Pressable>
      ) : null}
      {chips.map(chip => {
        const active = selectedId === chip.id;
        return (
          <Pressable
            key={chip.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(active ? null : chip.id)}
            accessibilityRole="button"
            accessibilityState={{selected: active}}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
          </Pressable>
        );
      })}
      <View style={styles.trail} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingRight: 8,
  },
  trail: {
    width: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: BRAND.maroonPrimary,
    borderColor: BRAND.maroonPrimary,
  },
  chipText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#ffffff',
  },
});

export default HomeChipScroller;
