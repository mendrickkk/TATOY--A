import React, {useCallback, useEffect, useState} from 'react';
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

import {cartLinesToOrderRequest, createOrder} from '../app/api/orders';
import {extractBearerJwtFromAuthData, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import {useCart} from '../context/CartContext';
import type {HomeStackParamList} from '../navigation/types';
import type {CartLine} from '../types/cart';
import {BRAND, ROUTES} from '../utils';

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
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  useEffect(() => {
    if (lines.length === 0) {
      navigation.replace(ROUTES.HOME);
    }
  }, [lines.length, navigation]);

  const onPlaceOrder = useCallback(async () => {
    const address = deliveryAddress.trim();
    if (!address) {
      setError('Delivery address is required.');
      return;
    }
    if (lines.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body = cartLinesToOrderRequest(lines, address, notes);
      const {order} = await createOrder(body, getToken);
      clearCart();
      navigation.replace(ROUTES.ORDER_SUCCESS, {
        orderNumber: order.orderNumber,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not place order';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [clearCart, deliveryAddress, getToken, lines, navigation, notes]);

  if (lines.length === 0) {
    return (
      <View style={[styles.centered, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
      </View>
    );
  }

  const canSubmit = deliveryAddress.trim().length > 0 && !submitting;

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
            if (error) {
              setError(null);
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: Math.max(insets.bottom, 12)}]}>
        <TouchableOpacity
          style={[styles.placeBtn, !canSubmit && styles.placeBtnDisabled]}
          onPress={onPlaceOrder}
          disabled={!canSubmit}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Place order">
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
    paddingHorizontal: 20,
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
    color: '#a40000',
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
  },
  codBox: {
    backgroundColor: BRAND.productTileBg,
    borderRadius: 12,
    padding: 14,
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
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#a40000',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
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
