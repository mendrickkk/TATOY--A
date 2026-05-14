import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {authLogout} from '../app/actions';
import {extractBearerJwtFromAuthData, fetchProducts, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import AppHeader from '../components/AppHeader';
import HeroCarousel from '../components/HeroCarousel';
import ShopSearchBar from '../components/ShopSearchBar';
import type {RootStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, ROUTES} from '../utils';
import {getUserDisplayName} from '../utils/userDisplayName';

type NavProp = StackNavigationProp<RootStackParamList>;

const DEMO_BADGE: number | boolean = true;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

const HomeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const displayName = getUserDisplayName(auth.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const loadProducts = useCallback(
    async (mode: 'initial' | 'refresh' | 'retry') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const {products: next, baseUrl} = await fetchProducts(getToken);
        setProducts(next);
        setApiBaseUrl(baseUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load products');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    loadProducts('initial');
  }, [loadProducts]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(BRAND.maroonPrimary);
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#ffffff');
        }
      };
    }, []),
  );

  const listHeader = useMemo(() => {
    const paddingTop = Math.max(insets.top, 12);
    return (
      <View>
        <View style={[styles.hero, {paddingTop}]}>
          <AppHeader
            userDisplayName={displayName}
            onPressNotifications={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            notificationBadge={DEMO_BADGE}
          />
          <ShopSearchBar style={styles.searchSpacing} />
        </View>
      </View>
    );
  }, [displayName, insets.top, navigation]);

  const listFooter = useMemo(
    () => (
      <View style={styles.footerWrap}>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <Text style={styles.link}>Profile</Text>
          </TouchableOpacity>
          <Text style={styles.sep}>·</Text>
          <TouchableOpacity
            onPress={() => dispatch(authLogout())}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <Text style={styles.link}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [dispatch, navigation],
  );

  const openProductDetail = useCallback(
    (item: Product) => {
      navigation.navigate(ROUTES.PRODUCT_DETAIL, {
        product: item,
        apiBaseUrl,
        relatedProducts: products,
      });
    },
    [apiBaseUrl, navigation, products],
  );

  const renderProductTile = useCallback(
    ({item}: {item: Product}) => {
      const uri = getProductImageUri(apiBaseUrl, item.image);
      return (
        <Pressable
          style={({pressed}) => [styles.tileWrap, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${priceFormatter.format(item.price)}`}
          onPress={() => openProductDetail(item)}
          android_ripple={{color: 'rgba(110, 15, 15, 0.12)', borderless: false}}>
          <View style={styles.tileImageShell}>
            {uri ? (
              <View style={styles.tileImage} pointerEvents="none">
                <Image
                  source={{uri}}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                  accessibilityLabel={item.name}
                />
              </View>
            ) : (
              <View style={[styles.tileImage, styles.tileImagePlaceholder]} />
            )}
          </View>
          <Text style={styles.tilePrice}>{priceFormatter.format(item.price)}</Text>
        </Pressable>
      );
    },
    [apiBaseUrl, openProductDetail],
  );

  const productRail = useMemo(() => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.railState} accessibilityLabel="Loading products">
          <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
          <Text style={styles.stateSubtext}>Loading products…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.railState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadProducts('retry')}
            accessibilityRole="button"
            accessibilityLabel="Retry loading products">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (products.length === 0) {
      return (
        <View style={styles.railState}>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.stateSubtext}>Check back later or pull down to refresh.</Text>
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railScrollContent}
        keyboardShouldPersistTaps="always">
        {products.map((item, index) => (
          <React.Fragment key={`${item.id}-${index}`}>
            {index > 0 ? <View style={styles.railSep} /> : null}
            {renderProductTile({item})}
          </React.Fragment>
        ))}
      </ScrollView>
    );
  }, [error, loading, loadProducts, products, renderProductTile]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts('refresh')}
            tintColor={BRAND.maroonPrimary}
            colors={[BRAND.maroonPrimary]}
          />
        }>
        {listHeader}
        <View style={styles.bodyTop}>
          <HeroCarousel />
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitlePopular}>Popular bouquets</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.POPULAR_BOUQUETS, {
                  products: products.length > 0 ? products : undefined,
                  apiBaseUrl: apiBaseUrl.trim() ? apiBaseUrl : undefined,
                })
              }
              accessibilityRole="button"
              accessibilityLabel="See all bouquets"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {productRail}
        </View>
        {listFooter}
      </ScrollView>
    </View>
  );
};

const TILE_SIZE = 132;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: BRAND.maroonPrimary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchSpacing: {
    marginTop: 14,
  },
  bodyTop: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
  },
  sectionTitlePopular: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.productTitle,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  railScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 4,
    paddingBottom: 4,
  },
  railSep: {
    width: 14,
  },
  tilePressed: {
    opacity: 0.92,
  },
  railState: {
    minHeight: 160,
    paddingVertical: 28,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileWrap: {
    width: TILE_SIZE,
  },
  tileImageShell: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: BRAND.productTileBg,
  },
  tileImage: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: BRAND.productTileBg,
  },
  tileImagePlaceholder: {
    opacity: 0.85,
  },
  tilePrice: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.productPriceBold,
    textAlign: 'center',
  },
  stateSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#a40000',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },
  footerWrap: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
    textDecorationLine: 'underline',
  },
  sep: {
    fontSize: 18,
    color: '#aaaaaa',
  },
});

export default HomeScreen;
