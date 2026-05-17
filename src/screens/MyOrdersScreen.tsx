import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {fetchMyOrders} from '../app/api/orders';
import {extractBearerJwtFromAuthData, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import ProfileEmptyStateBox from '../components/ProfileEmptyStateBox';
import {
  isActiveOrderStatus,
  isCompletedOrderStatus,
  type Order,
} from '../types/order';
import {BRAND} from '../utils';

type TabKey = 'active' | 'completed';

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

function formatStatus(status: string): string {
  const s = status.trim();
  if (!s) {
    return 'Unknown';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function primaryLine(order: Order) {
  return order.lines[0] ?? null;
}

type OrderCardProps = {
  order: Order;
  imageUri: string | null;
};

function OrderCard({order, imageUri}: OrderCardProps) {
  const line = primaryLine(order);
  const name = line?.product.name ?? 'Order';
  const extra = order.lines.length > 1 ? ` +${order.lines.length - 1} more` : '';

  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
          {extra}
        </Text>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
          </View>
          <Text style={styles.total}>{priceFormatter.format(order.total)}</Text>
        </View>
      </View>
    </View>
  );
}

const MyOrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState<TabKey>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await fetchMyOrders(getToken);
        setOrders(result.orders);
        setApiBaseUrl(result.baseUrl);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not load orders';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken],
  );

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (tab === 'completed') {
        return isCompletedOrderStatus(o.status);
      }
      return isActiveOrderStatus(o.status) || !isCompletedOrderStatus(o.status);
    });
  }, [orders, tab]);

  const renderItem = useCallback(
    ({item}: {item: Order}) => {
      const line = primaryLine(item);
      const imageUri = getProductImageUri(
        apiBaseUrl,
        line?.product.imageUrl ?? null,
      );
      return <OrderCard order={item} imageUri={imageUri} />;
    },
    [apiBaseUrl],
  );

  const emptyMessage =
    tab === 'active'
      ? 'No active orders. Place an order from the cart to see it here.'
      : 'No completed orders yet.';

  return (
    <View style={styles.screen}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>MY ORDERS</Text>
        <Text style={styles.subtitle}>
          Order history and status for your account.
        </Text>
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, tab === 'active' && styles.tabActive]}
            onPress={() => setTab('active')}
            accessibilityRole="button"
            accessibilityState={{selected: tab === 'active'}}>
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
              Active
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'completed' && styles.tabActive]}
            onPress={() => setTab('completed')}
            accessibilityRole="button"
            accessibilityState={{selected: tab === 'completed'}}>
            <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>
              Completed
            </Text>
          </Pressable>
        </View>
        <View style={styles.divider} />
      </View>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            {paddingBottom: insets.bottom + 24},
            filtered.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrders(true)}
              tintColor={BRAND.maroonPrimary}
              colors={[BRAND.maroonPrimary]}
            />
          }
          ListEmptyComponent={
            <ProfileEmptyStateBox>{emptyMessage}</ProfileEmptyStateBox>
          }
          ItemSeparatorComponent={OrderListSeparator}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

function OrderListSeparator() {
  return <View style={styles.listSep} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(110, 15, 15, 0.12)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: BRAND.maroonPrimary,
  },
  divider: {
    marginTop: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    fontSize: 13,
    color: '#a40000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  listSep: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: BRAND.productTileBg,
    borderRadius: 14,
    padding: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  thumbPlaceholder: {
    opacity: 0.85,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  orderNumber: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(110, 15, 15, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
});

export default MyOrdersScreen;
