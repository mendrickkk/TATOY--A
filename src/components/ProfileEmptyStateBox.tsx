import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {FONTS} from '../utils';

type Props = {
  children: string;
};

/** Dashed empty-state panel used on Orders / Wishlist placeholders. */
const ProfileEmptyStateBox = ({children}: Props) => {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingVertical: 28,
    minHeight: 100,
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProfileEmptyStateBox;
