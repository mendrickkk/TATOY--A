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

import {showInfo} from '../components/alert_messages';
import QuantityStepper from '../components/QuantityStepper';
import {getProductImageUri} from '../app/api/products';
import {useCart} from '../context/CartContext';
import type {MainTabParamList} from '../navigation/types';
import type {CartLine} from '../types/cart';
import {BRAND, ROUTES} from '../utils';
import {
  cartLineStockHint,
  getMaxPurchasable,
  getStockIssues,
  lineExceedsStock,
} from '../utils/stock';

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
  exceedsStock: boolean;
  stockHint: string | null;
  maxStock?: number;
  onRemove: (productId: string) => void;
  onChangeQty: (productId: string, quantity: number) => void;
  onIncreaseAtMax: (max: number) => void;
};

function CartLineRow({
  line,
  imageUri,
  exceedsStock,
  stockHint,
  maxStock,
  onRemove,
  onChangeQty,
  onIncreaseAtMax,
}: CartLineRowProps) {
  const {product, quantity} = line;

  return (
    <View style={[styles.card, exceedsStock && styles.cardError]}>
      {exceedsStock ? (
        <View style={styles.rowErrorStrip}>
          <Text style={styles.rowErrorText} accessibilityRole="alert">
            Not enough stock — reduce quantity
          </Text>
        </View>
      ) : null}
      <View style={styles.cardRow}>
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
        {stockHint ? (
          <Text style={styles.stockHint} accessibilityLabel={stockHint}>
            {stockHint}
          </Text>
        ) : null}
        <View style={styles.stepperRow}>
          <QuantityStepper
            value={quantity}
            onDecrease={() => onChangeQty(product.id, quantity - 1)}
            onIncrease={() => {
              if (maxStock !== undefined && quantity >= maxStock) {
                onIncreaseAtMax(maxStock);
                return;
              }
              onChangeQty(product.id, quantity + 1);
            }}
            max={maxStock}
            accessibilityPrefix={`${product.name} quantity`}
          />
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
  const stockIssues = useMemo(() => getStockIssues(lines), [lines]);
  const hasStockProblems = stockIssues.length > 0;
  const total = useMemo(
    () => Math.max(0, subtotal + SHIPPING_COST - DISCOUNT),
    [subtotal],
  );

  const onIncreaseAtMax = useCallback((max: number) => {
    showInfo({
      title: 'Maximum available',
      message: `Maximum available: ${max}`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, []);

  const onCheckout = useCallback(() => {
    if (hasStockProblems) {
      return;
    }
    navigation.navigate(ROUTES.TAB_HOME, {screen: ROUTES.CHECKOUT});
  }, [hasStockProblems, navigation]);

  const goHome = useCallback(() => {
    navigation.navigate(ROUTES.TAB_HOME, {screen: ROUTES.HOME});
  }, [navigation]);

  const renderItem = useCallback(
    ({item}: {item: CartLine}) => (
      <CartLineRow
        line={item}
        imageUri={getProductImageUri(apiBaseUrl, item.product.image)}
        exceedsStock={lineExceedsStock(item)}
        stockHint={cartLineStockHint(item)}
        maxStock={getMaxPurchasable(item.product)}
        onRemove={removeItem}
        onChangeQty={updateQuantity}
        onIncreaseAtMax={onIncreaseAtMax}
      />
    ),
    [apiBaseUrl, onIncreaseAtMax, removeItem, updateQuantity],
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
      <Text style={styles.screenTitle}>Your bag</Text>

      {loadError ? <Text style={styles.bannerError}>{loadError}</Text> : null}

      {isEmpty ? (
        <CartEmptyState onStartShopping={goHome} />
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
            {hasStockProblems ? (
              <Text
                style={styles.checkoutBlockedHint}
                accessibilityRole="text"
                accessibilityLabel="Fix quantities above before checkout">
                Fix quantities above before checkout
              </Text>
            ) : null}
            <TouchableOpacity
              style={[styles.paymentBtn, hasStockProblems && styles.paymentBtnDisabled]}
              onPress={onCheckout}
              disabled={hasStockProblems}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Proceed to checkout"
              accessibilityState={{disabled: hasStockProblems}}>
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

const EMPTY_BAG_COLOR = '#c8c8c8';

/** Outline shopping bag for empty-state illustration (reference mockup). */
function EmptyBagIcon({size = 52}: {size?: number}) {
  const handleW = size * 0.42;
  const handleH = size * 0.22;
  return (
    <View style={{width: size, height: size * 1.05, alignItems: 'center'}}>
      <View
        style={{
          width: handleW,
          height: handleH,
          borderWidth: 2.5,
          borderColor: EMPTY_BAG_COLOR,
          borderBottomWidth: 0,
          borderTopLeftRadius: handleW * 0.5,
          borderTopRightRadius: handleW * 0.5,
          marginBottom: -handleH * 0.35,
        }}
      />
      <View
        style={{
          width: size * 0.88,
          height: size * 0.78,
          borderWidth: 2.5,
          borderColor: EMPTY_BAG_COLOR,
          borderRadius: 8,
        }}
      />
    </View>
  );
}

type CartEmptyStateProps = {
  onStartShopping: () => void;
};

function CartEmptyState({onStartShopping}: CartEmptyStateProps) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle} accessibilityElementsHidden>
        <EmptyBagIcon />
      </View>
      <Text style={styles.emptyHeadline}>Your bag is empty</Text>
      <Text style={styles.emptySubtitle}>
        When you add bouquets, they'll show up here.
      </Text>
      <TouchableOpacity
        style={styles.startShoppingBtn}
        onPress={onStartShopping}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Start shopping">
        <Text style={styles.startShoppingBtnText}>Start shopping</Text>
      </TouchableOpacity>
    </View>
  );
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
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'left',
    letterSpacing: -0.5,
    marginBottom: 8,
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
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  emptyIconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emptyHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 32,
  },
  startShoppingBtn: {
    alignSelf: 'stretch',
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: BRAND.maroonDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startShoppingBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listSep: {
    height: 12,
  },
  card: {
    backgroundColor: BRAND.productTileBg,
    borderRadius: 16,
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardError: {
    borderWidth: 1,
    borderColor: 'rgba(110, 15, 15, 0.35)',
  },
  rowErrorStrip: {
    width: '100%',
    backgroundColor: 'rgba(110, 15, 15, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  rowErrorText: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
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
  stockHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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
  checkoutBlockedHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    textAlign: 'center',
  },
  paymentBtn: {
    marginTop: 14,
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentBtnDisabled: {
    opacity: 0.45,
  },
  paymentBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CartScreen;
