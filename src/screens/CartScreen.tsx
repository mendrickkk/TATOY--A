import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {getProductImageUri} from '../app/api/products';
import {useCart} from '../context/CartContext';
import type {MainTabParamList} from '../navigation/types';
import type {CartLine} from '../types/cart';
import {BRAND, ROUTES} from '../utils';

const SHIPPING_COST = 10;
const DISCOUNT = 2;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type TabNav = BottomTabNavigationProp<MainTabParamList>;

type CartLineRowProps = {
  line: CartLine;
  imageUri: string | null;
  onRemove: (productId: string) => void;
  onChangeQty: (productId: string, quantity: number) => void;
};

function CartLineRow({line, imageUri, onRemove, onChangeQty}: CartLineRowProps) {
  const {product, quantity} = line;

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.removeBtn}
        onPress={() => onRemove(product.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${product.name}`}>
        <Text style={styles.removeIcon}>🗑</Text>
      </Pressable>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unitPrice}>{priceFormatter.format(product.price)}</Text>
        <View style={styles.stepperRow}>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperBtnMuted}
              onPress={() => onChangeQty(product.id, quantity - 1)}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity">
              <Text style={styles.stepperBtnTextMuted}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable
              style={styles.stepperBtnPrimary}
              onPress={() => onChangeQty(product.id, quantity + 1)}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity">
              <Text style={styles.stepperBtnTextPrimary}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const CartScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNav>();
  const {
    lines,
    subtotal,
    apiBaseUrl,
    hydrated,
    loadError,
    updateQuantity,
    removeItem,
  } = useCart();

  const isEmpty = lines.length === 0;
  const total = useMemo(
    () => Math.max(0, subtotal + SHIPPING_COST - DISCOUNT),
    [subtotal],
  );

  const onCheckout = useCallback(() => {
    navigation.navigate(ROUTES.TAB_HOME, {screen: ROUTES.CHECKOUT});
  }, [navigation]);

  const goHome = useCallback(() => {
    navigation.navigate(ROUTES.TAB_HOME, {screen: ROUTES.HOME});
  }, [navigation]);

  const renderItem = useCallback(
    ({item}: {item: CartLine}) => (
      <CartLineRow
        line={item}
        imageUri={getProductImageUri(apiBaseUrl, item.product.image)}
        onRemove={removeItem}
        onChangeQty={updateQuantity}
      />
    ),
    [apiBaseUrl, removeItem, updateQuantity],
  );

  if (!hydrated) {
    return (
      <View style={[styles.root, styles.centered, {paddingTop: Math.max(insets.top, 16)}]}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
        <Text style={styles.loadingText}>Loading cart…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, {paddingTop: Math.max(insets.top, 12)}]}>
      <Text style={styles.screenTitle}>Cart</Text>

      {loadError ? <Text style={styles.bannerError}>{loadError}</Text> : null}

      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.homeLink}
            onPress={goHome}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Go to Home">
            <Text style={styles.homeLinkText}>Browse bouquets on Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={item => item.product.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              {paddingBottom: 220 + insets.bottom},
            ]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={CartListSeparator}
          />

          <View style={[styles.summarySheet, {paddingBottom: Math.max(insets.bottom, 12)}]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryValue}>{priceFormatter.format(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Cost</Text>
              <Text style={styles.summaryValue}>{priceFormatter.format(SHIPPING_COST)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>{priceFormatter.format(DISCOUNT)}</Text>
            </View>
            <View style={styles.dottedRule} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>{priceFormatter.format(total)}</Text>
            </View>
            <TouchableOpacity
              style={styles.paymentBtn}
              onPress={onCheckout}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Proceed to checkout">
              <Text style={styles.paymentBtnText}>Payment</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

function CartListSeparator() {
  return <View style={styles.listSep} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  bannerError: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 13,
    color: '#a40000',
    textAlign: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  homeLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  homeLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listSep: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: BRAND.productTileBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  removeIcon: {
    fontSize: 18,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  thumbPlaceholder: {
    opacity: 0.85,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 28,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    paddingRight: 8,
  },
  unitPrice: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperBtnMuted: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(110, 15, 15, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPrimary: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND.maroonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnTextMuted: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    lineHeight: 22,
  },
  stepperBtnTextPrimary: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 22,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  summarySheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  dottedRule: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  paymentBtn: {
    marginTop: 14,
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CartScreen;
