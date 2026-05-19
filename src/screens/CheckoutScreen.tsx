import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {cartLinesToOrderRequest, createOrder, OrderApiError} from '../app/api/orders';
import {extractBearerJwtFromAuthData, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import CheckoutErrorCard from '../components/CheckoutErrorCard';
import {useCart} from '../context/CartContext';
import type {HomeStackParamList} from '../navigation/types';
import type {CartLine} from '../types/cart';
import {BRAND, ROUTES} from '../utils';
import {
  cartLineStockHint,
  getStockIssues,
  stockIssueMessage,
} from '../utils/stock';

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type NavProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.CHECKOUT>;

type SummaryLineProps = {
  line: CartLine;
  imageUri: string | null;
};

function SummaryLine({line, imageUri}: SummaryLineProps) {
  const lineTotal = line.product.price * line.quantity;
  const hint = cartLineStockHint(line);
  return (
    <View style={styles.lineCard}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.lineBody}>
        <Text style={styles.lineName} numberOfLines={2}>
          {line.product.name}
        </Text>
        <Text style={styles.lineMeta}>
          {priceFormatter.format(line.product.price)} × {line.quantity}
        </Text>
        {hint ? <Text style={styles.lineStockHint}>{hint}</Text> : null}
        <Text style={styles.lineTotal}>{priceFormatter.format(lineTotal)}</Text>
      </View>
    </View>
  );
}

const CheckoutScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const {lines, subtotal, apiBaseUrl, clearCart} = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorBullets, setErrorBullets] = useState<string[]>([]);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const stockIssues = useMemo(() => getStockIssues(lines), [lines]);
  const stockIssueMessages = useMemo(
    () => stockIssues.map(stockIssueMessage),
    [stockIssues],
  );

  useEffect(() => {
    if (lines.length === 0) {
      navigation.replace(ROUTES.HOME);
    }
  }, [lines.length, navigation]);

  const onPlaceOrder = useCallback(async () => {
    const address = deliveryAddress.trim();
    if (!address) {
      setErrorBullets(['Delivery address is required.']);
      return;
    }
    if (lines.length === 0) {
      setErrorBullets(['Your cart is empty.']);
      return;
    }
    if (stockIssueMessages.length > 0) {
      setErrorBullets(stockIssueMessages);
      return;
    }

    setSubmitting(true);
    setErrorBullets([]);
    try {
      const body = cartLinesToOrderRequest(lines, address, notes);
      const {order} = await createOrder(body, getToken);
      clearCart();
      navigation.replace(ROUTES.ORDER_SUCCESS, {
        orderNumber: order.orderNumber,
      });
    } catch (e) {
      if (e instanceof OrderApiError) {
        setErrorBullets(e.bullets);
      } else {
        const message = e instanceof Error ? e.message : 'Could not place order';
        setErrorBullets([message]);
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    clearCart,
    deliveryAddress,
    getToken,
    lines,
    navigation,
    notes,
    stockIssueMessages,
  ]);

  if (lines.length === 0) {
    return (
      <View style={[styles.centered, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
      </View>
    );
  }

  const hasBlockingStock = stockIssueMessages.length > 0;
  const canSubmit =
    deliveryAddress.trim().length > 0 && !submitting && !hasBlockingStock;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 100},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {errorBullets.length > 0 ? (
          <CheckoutErrorCard bullets={errorBullets} />
        ) : null}

        <Text style={styles.sectionTitle}>Order summary</Text>
        {lines.map(line => (
          <SummaryLine
            key={line.product.id}
            line={line}
            imageUri={getProductImageUri(apiBaseUrl, line.product.image)}
          />
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{priceFormatter.format(subtotal)}</Text>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionGap]}>Delivery</Text>
        <Text style={styles.fieldLabel}>
          Delivery address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={deliveryAddress}
          onChangeText={t => {
            setDeliveryAddress(t);
            if (errorBullets.length > 0) {
              setErrorBullets([]);
            }
          }}
          placeholder="e.g. Cebu City"
          placeholderTextColor="#9ca3af"
          multiline
          accessibilityLabel="Delivery address"
        />

        <Text style={[styles.fieldLabel, styles.fieldGap]}>Notes (optional)</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Gate code, delivery time, etc."
          placeholderTextColor="#9ca3af"
          multiline
          accessibilityLabel="Order notes"
        />

        <Text style={[styles.sectionTitle, styles.sectionGap]}>Payment</Text>
        <View style={styles.codBox}>
          <Text style={styles.codTitle}>Payment method</Text>
          <Text style={styles.codValue}>Cash on delivery (pay when delivered)</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: Math.max(insets.bottom, 12)}]}>
        <TouchableOpacity
          style={[styles.placeBtn, !canSubmit && styles.placeBtnDisabled]}
          onPress={onPlaceOrder}
          disabled={!canSubmit}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Place order"
          accessibilityState={{disabled: !canSubmit}}>
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.placeBtnText}>Place order</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.productTitle,
    marginBottom: 12,
  },
  sectionGap: {
    marginTop: 24,
  },
  lineCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.productTileBg,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e8e8',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  thumbPlaceholder: {opacity: 0.85},
  lineBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  lineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  lineMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  lineStockHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  lineTotal: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: BRAND.maroonPrimary,
  },
  fieldGap: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111111',
    minHeight: 48,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
  },
  codBox: {
    backgroundColor: BRAND.productTileBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e8e8',
  },
  codTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  codValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  placeBtn: {
    backgroundColor: BRAND.maroonPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeBtnDisabled: {
    opacity: 0.55,
  },
  placeBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
