import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {cancelOrder, OrderApiError} from '../app/api/orders';
import {extractBearerJwtFromAuthData, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import type {ProfileStackParamList} from '../navigation/types';
import type {Order, OrderLine} from '../types/order';
import {
  isOrderCancelled,
  isOrderCancellable,
  isOrderNonCancellableFinal,
} from '../types/order';
import {BRAND, ROUTES} from '../utils';
import {
  formatOrderDate,
  formatOrderStatusLabel,
  ORDER_PAYMENT_LABEL,
} from '../utils/orderDisplay';

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type DetailsRoute = RouteProp<ProfileStackParamList, typeof ROUTES.ORDER_DETAILS>;
type DetailsNavProp = StackNavigationProp<
  ProfileStackParamList,
  typeof ROUTES.ORDER_DETAILS
>;

type ItemRowProps = {
  line: OrderLine;
  imageUri: string | null;
};

function OrderItemRow({line, imageUri}: ItemRowProps) {
  const qtyLabel =
    line.quantity > 1
      ? `${line.quantity} × ${priceFormatter.format(line.unitPrice)}`
      : `Qty ${line.quantity}`;

  return (
    <View style={styles.itemCard}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.itemThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.itemThumb, styles.itemThumbPlaceholder]} />
      )}
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={2}>
          {line.product.name}
        </Text>
        <Text style={styles.itemMeta}>{qtyLabel}</Text>
        <Text style={styles.itemPrice}>{priceFormatter.format(line.subtotal)}</Text>
      </View>
    </View>
  );
}

const OrderDetailsScreen = () => {
  const navigation = useNavigation<DetailsNavProp>();
  const route = useRoute<DetailsRoute>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);

  const apiBaseUrl = route.params.apiBaseUrl?.trim() ?? '';
  const [order, setOrder] = useState<Order>(route.params.order);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const canCancel = isOrderCancellable(order.status);
  const showFinalNotice = isOrderNonCancellableFinal(order.status);
  const wasCancelled = isOrderCancelled(order.status);

  const renderLine = useCallback(
    (line: OrderLine, index: number) => {
      const imageUri = getProductImageUri(apiBaseUrl, line.product.imageUrl ?? null);
      return (
        <View key={`line-${index}`}>
          {index > 0 ? <View style={styles.itemGap} /> : null}
          <OrderItemRow line={line} imageUri={imageUri} />
        </View>
      );
    },
    [apiBaseUrl],
  );

  const onConfirmCancel = useCallback(async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const {order: updated} = await cancelOrder(order.id, getToken);
      setOrder(updated);
      setConfirmVisible(false);
      setCancelError(null);
      navigation.goBack();
    } catch (e) {
      const message =
        e instanceof OrderApiError
          ? e.bullets[0] ?? e.message
          : e instanceof Error
            ? e.message
            : 'Could not cancel order';
      setCancelError(message);
    } finally {
      setCancelling(false);
    }
  }, [getToken, navigation, order.id]);

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 28}]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.orderId}>{order.orderNumber}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{formatOrderStatusLabel(order.status)}</Text>
        </View>
        <Text style={styles.dateLine}>{formatOrderDate(order.createdAt)}</Text>
        <Text style={styles.totalLine}>
          {priceFormatter.format(order.total)} · {ORDER_PAYMENT_LABEL}
        </Text>

        {order.deliveryAddress.trim() ? (
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Delivery address</Text>
            <Text style={styles.addressValue}>{order.deliveryAddress}</Text>
          </View>
        ) : null}

        {order.notes?.trim() ? (
          <View style={styles.notesBlock}>
            <Text style={styles.addressLabel}>Notes</Text>
            <Text style={styles.addressValue}>{order.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.itemsHeading}>Items</Text>
        {order.lines.length > 0 ? (
          order.lines.map(renderLine)
        ) : (
          <Text style={styles.noItems}>No line items for this order.</Text>
        )}

        {canCancel ? (
          <View style={styles.cancelSection}>
            <Text style={styles.cancelHint}>
              You can cancel while this order is still pending or being processed. Once it
              ships, cancellation is no longer available in the app.
            </Text>
            {cancelError ? <Text style={styles.cancelError}>{cancelError}</Text> : null}
            <Pressable
              style={({pressed}) => [
                styles.cancelBtn,
                pressed && styles.cancelBtnPressed,
                cancelling && styles.cancelBtnDisabled,
              ]}
              onPress={() => {
                setCancelError(null);
                setConfirmVisible(true);
              }}
              disabled={cancelling}
              accessibilityRole="button"
              accessibilityLabel="Cancel order">
              <Text style={styles.cancelBtnText}>Cancel order</Text>
            </Pressable>
          </View>
        ) : null}

        {showFinalNotice ? (
          <View style={styles.finalNoticeSection}>
            <Text style={styles.finalNoticeText}>
              This order has shipped or been completed. Cancellation is no longer available
              in the app.
            </Text>
          </View>
        ) : null}

        {wasCancelled ? (
          <View style={styles.finalNoticeSection}>
            <Text style={styles.finalNoticeText}>This order was cancelled.</Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !cancelling && setConfirmVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => !cancelling && setConfirmVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close dialog">
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Cancel order?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel order {order.orderNumber}? This cannot be undone.
            </Text>
            {cancelError && confirmVisible ? (
              <Text style={styles.modalError}>{cancelError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                style={({pressed}) => [styles.modalBtnSecondary, pressed && styles.modalBtnPressed]}
                onPress={() => setConfirmVisible(false)}
                disabled={cancelling}
                accessibilityRole="button"
                accessibilityLabel="Keep order">
                <Text style={styles.modalBtnSecondaryText}>Keep order</Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  styles.modalBtnPrimary,
                  pressed && styles.modalBtnPressed,
                  cancelling && styles.cancelBtnDisabled,
                ]}
                onPress={onConfirmCancel}
                disabled={cancelling}
                accessibilityRole="button"
                accessibilityLabel="Confirm cancel order">
                {cancelling ? (
                  <ActivityIndicator color={BRAND.maroonPrimary} size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Cancel order</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  orderId: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.5,
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(110, 15, 15, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  dateLine: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  totalLine: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  addressBlock: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  notesBlock: {
    marginTop: 14,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  addressValue: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#111111',
  },
  itemsHeading: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: BRAND.pageMutedBg,
    borderRadius: 14,
    padding: 12,
  },
  itemGap: {
    height: 12,
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  itemThumbPlaceholder: {
    opacity: 0.85,
  },
  itemBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    minHeight: 72,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  itemPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  noItems: {
    fontSize: 15,
    color: '#6b7280',
  },
  cancelSection: {
    marginTop: 28,
    backgroundColor: BRAND.pageMutedBg,
    borderRadius: 14,
    padding: 16,
  },
  cancelHint: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    textAlign: 'center',
  },
  cancelError: {
    marginTop: 10,
    fontSize: 13,
    color: '#a40000',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 200,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND.maroonPrimary,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelBtnPressed: {
    opacity: 0.9,
  },
  cancelBtnDisabled: {
    opacity: 0.6,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
  finalNoticeSection: {
    marginTop: 28,
    backgroundColor: BRAND.pageMutedBg,
    borderRadius: 14,
    padding: 16,
  },
  finalNoticeText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },
  modalMessage: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'center',
  },
  modalError: {
    marginTop: 10,
    fontSize: 13,
    color: '#a40000',
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND.maroonPrimary,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalBtnPressed: {
    opacity: 0.9,
  },
  modalBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
  },
});

export default OrderDetailsScreen;
