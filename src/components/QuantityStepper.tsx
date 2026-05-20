import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {BRAND, FONTS} from '../utils';

type Props = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  accessibilityPrefix?: string;
};

const QuantityStepper = ({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  max,
  disabled = false,
  accessibilityPrefix = 'Quantity',
}: Props) => {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <View style={styles.stepper}>
      <Pressable
        style={[styles.btnMuted, (atMin || disabled) && styles.btnDisabled]}
        onPress={onDecrease}
        disabled={atMin || disabled}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityPrefix}, decrease`}
        accessibilityState={{disabled: atMin || disabled}}>
        <Text style={styles.btnTextMuted}>−</Text>
      </Pressable>
      <Text
        style={styles.value}
        accessibilityRole="text"
        accessibilityLabel={`${accessibilityPrefix}, ${value}`}>
        {value}
      </Text>
      <Pressable
        style={[styles.btnPrimary, (atMax || disabled) && styles.btnPrimaryDisabled]}
        onPress={onIncrease}
        disabled={atMax || disabled}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityPrefix}, increase`}
        accessibilityState={{disabled: atMax || disabled}}>
        <Text style={styles.btnTextPrimary}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnMuted: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(110, 15, 15, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryDisabled: {
    opacity: 0.45,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnTextMuted: {
    fontFamily: FONTS.body,
    fontSize: 18,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    lineHeight: 22,
  },
  btnTextPrimary: {
    fontFamily: FONTS.body,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 22,
  },
  value: {
    fontFamily: FONTS.body,
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
});

export default QuantityStepper;
