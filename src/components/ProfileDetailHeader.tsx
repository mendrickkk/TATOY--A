import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {IconPencil} from './ProfileMenuIcons';

type Props = {
  title?: string;
  onBack: () => void;
  onEdit: () => void;
};

/** Centered title with circular back / edit actions (Profile Info reference). */
const ProfileDetailHeader = ({title = 'My Profile', onBack, onEdit}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, {paddingTop: insets.top + 8}]}>
      <View style={styles.row}>
        <Pressable
          style={styles.circleBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <Pressable
          style={styles.circleBtn}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit profile">
          <IconPencil color="#444444" size={18} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 26,
    color: '#444444',
    marginTop: -2,
    fontWeight: '300',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginHorizontal: 8,
  },
});

export default ProfileDetailHeader;
