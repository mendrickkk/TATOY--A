import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {AppAlert} from '../app_alert';
import {BRAND, FONTS} from '../../utils';
import {HOME_QUICK_ACTIONS} from '../../utils/homeCatalog';

type Props = {
  onPressOrders?: () => void;
};

const HomeQuickActions = ({onPressOrders}: Props) => (
  <View style={styles.wrap}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="always">
      {HOME_QUICK_ACTIONS.map(item => (
        <Pressable
          key={item.id}
          style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            if (item.id === 'orders' && onPressOrders) {
              onPressOrders();
              return;
            }
            AppAlert.alert(item.label, `${item.caption} — coming soon.`);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}, ${item.caption}`}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 2,
    paddingRight: 8,
  },
  card: {
    width: 96,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e4f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.productTitle,
    textAlign: 'center',
  },
  caption: {
    fontFamily: FONTS.body,
    marginTop: 2,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeQuickActions;
