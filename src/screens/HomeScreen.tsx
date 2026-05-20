import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useSelector} from 'react-redux';

import {extractBearerJwtFromAuthData, fetchProducts, getProductImageUri} from '../app/api/products';
import {isSessionExpiredError} from '../app/api/session';
import type {RootState} from '../app/reducers';
import AppHeader from '../components/AppHeader';
import FavoriteHeartButton from '../components/FavoriteHeartButton';
import HeroCarousel from '../components/HeroCarousel';
import ShopSearchBar from '../components/ShopSearchBar';
import {useFavorites} from '../context/FavoritesContext';
import type {RootStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, FONTS, ROUTES} from '../utils';
import {filterProductsByQuery} from '../utils/productSearch';
import {lowStockLabel} from '../utils/stock';
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
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const {setApiBaseUrl: setFavoritesApiBase} = useFavorites();
  const displayName = getUserDisplayName(auth.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

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
        if (baseUrl.trim()) {
          setFavoritesApiBase(baseUrl);
        }
      } catch (e) {
        if (isSessionExpiredError(e)) {
          setError(null);
          return;
        }
        setError(e instanceof Error ? e.message : 'Could not load products');
      } finally {
        setLoading(false);
        setRefreshing(false);
        hasLoadedOnce.current = true;
      }
    },
    [getToken, setFavoritesApiBase],
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
      if (hasLoadedOnce.current) {
        loadProducts('refresh');
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#ffffff');
        }
      };
    },     [loadProducts]),
  );

  const filteredProducts = useMemo(
    () => filterProductsByQuery(products, searchQuery),
    [products, searchQuery],
  );

  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length > 0;

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
          <ShopSearchBar
            style={styles.searchSpacing}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    );
  }, [displayName, insets.top, navigation, searchQuery]);

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
      const scarcity = lowStockLabel(item);
      return (
        <Pressable
          style={({pressed}) => [styles.tileWrap, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${priceFormatter.format(item.price)}${scarcity ? `, ${scarcity}` : ''}`}
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
            {scarcity ? (
              <View style={styles.lowStockBadge} pointerEvents="none">
                <Text style={styles.lowStockText}>{scarcity}</Text>
              </View>
            ) : null}
            <FavoriteHeartButton
              product={item}
              apiBaseUrl={apiBaseUrl}
              size="sm"
              style={styles.tileHeart}
            />
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
    if (isSearchActive && filteredProducts.length === 0) {
      return (
        <View style={styles.railState}>
          <Text style={styles.emptyTitle}>No bouquets found</Text>
          <Text style={styles.stateSubtext}>Try a different name</Text>
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
        {filteredProducts.map((item, index) => (
          <React.Fragment key={`${item.id}-${index}`}>
            {index > 0 ? <View style={styles.railSep} /> : null}
            {renderProductTile({item})}
          </React.Fragment>
        ))}
      </ScrollView>
    );
  }, [
    error,
    filteredProducts,
    isSearchActive,
    loading,
    loadProducts,
    products.length,
    renderProductTile,
  ]);

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
              onPress={() => {
                const listForSeeAll =
                  products.length > 0
                    ? isSearchActive
                      ? filteredProducts
                      : products
                    : undefined;
                navigation.navigate(ROUTES.POPULAR_BOUQUETS, {
                  products: listForSeeAll,
                  apiBaseUrl: apiBaseUrl.trim() ? apiBaseUrl : undefined,
                  ...(isSearchActive ? {initialSearchQuery: trimmedSearch} : {}),
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="See all bouquets"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {productRail}
        </View>
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
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.productTitle,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontFamily: FONTS.body,
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
  tileHeart: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
  },
  lowStockBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    maxWidth: '90%',
    backgroundColor: 'rgba(110, 15, 15, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowStockText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  tilePrice: {
    fontFamily: FONTS.body,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.productPriceBold,
    textAlign: 'center',
  },
  stateSubtext: {
    fontFamily: FONTS.body,
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: FONTS.body,
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
    fontFamily: FONTS.body,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
});

export default HomeScreen;
