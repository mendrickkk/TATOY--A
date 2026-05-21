import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {fetchCategoryLabelMap} from '../app/api/categories';
import {extractBearerJwtFromAuthData, fetchProducts, getProductImageUri} from '../app/api/products';
import {isSessionExpiredError} from '../app/api/session';
import type {RootState} from '../app/reducers';
import FavoriteHeartButton from '../components/FavoriteHeartButton';
import HomeChipScroller from '../components/home/HomeChipScroller';
import ShopSearchBar from '../components/ShopSearchBar';
import {useFavorites} from '../context/FavoritesContext';
import type {ShopStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, FONTS, ROUTES} from '../utils';
import {
  mergeCategoryLabelMaps,
  mergeCategoryLabelsFromProducts,
  type CategoryLabelMap,
} from '../utils/categoryDisplay';
import {buildBrowseChips, filterHomeCatalog} from '../utils/homeCatalog';

const H_PAD = 16;
const COL_GAP = 12;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type NavProp = StackNavigationProp<ShopStackParamList>;

const ShopScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const {width: windowW} = useWindowDimensions();
  const auth = useSelector((state: RootState) => state.auth);
  const {setApiBaseUrl: setFavoritesApiBase} = useFavorites();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryLabelMap, setCategoryLabelMap] = useState<CategoryLabelMap>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [chipFilter, setChipFilter] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const loadCatalog = useCallback(
    async (mode: 'initial' | 'refresh' | 'retry') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const [{products: next, baseUrl, categoryLabels: fromProducts}, fromApi] =
          await Promise.all([fetchProducts(getToken), fetchCategoryLabelMap(getToken)]);
        const labels = mergeCategoryLabelMaps(fromApi, fromProducts);
        mergeCategoryLabelsFromProducts(labels, next);
        setProducts(next);
        setCategoryLabelMap(labels);
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
      }
    },
    [getToken, setFavoritesApiBase],
  );

  useEffect(() => {
    loadCatalog('initial');
  }, [loadCatalog]);

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

  const browseChips = useMemo(() => buildBrowseChips(categoryLabelMap), [categoryLabelMap]);

  const displayProducts = useMemo(
    () =>
      filterHomeCatalog(products, {
        searchQuery,
        chipId: chipFilter,
        categoryLabelMap,
      }),
    [products, searchQuery, chipFilter, categoryLabelMap],
  );

  const activeChipLabel = useMemo(
    () => browseChips.find(c => c.id === chipFilter)?.label,
    [browseChips, chipFilter],
  );

  const resultSummary = useMemo(() => {
    const count = displayProducts.length;
    const noun = count === 1 ? 'bouquet' : 'bouquets';
    if (searchQuery.trim()) {
      return `${count} ${noun} for “${searchQuery.trim()}”`;
    }
    if (chipFilter && activeChipLabel) {
      return `${count} ${noun} · ${activeChipLabel}`;
    }
    return `${count} ${noun} in catalog`;
  }, [activeChipLabel, chipFilter, displayProducts.length, searchQuery]);

  const cellW = useMemo(
    () => Math.max(120, Math.floor((windowW - H_PAD * 2 - COL_GAP) / 2)),
    [windowW],
  );

  const openDetail = useCallback(
    (item: Product) => {
      navigation.navigate(ROUTES.PRODUCT_DETAIL, {
        product: item,
        apiBaseUrl,
        relatedProducts: displayProducts,
      });
    },
    [apiBaseUrl, displayProducts, navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Product}) => {
      const uri = getProductImageUri(apiBaseUrl, item.image);
      return (
        <Pressable
          style={[styles.cell, {width: cellW}]}
          onPress={() => openDetail(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${priceFormatter.format(item.price)}`}>
          <View style={styles.card}>
            <View style={styles.imageShell}>
              {uri ? (
                <Image source={{uri}} style={[styles.image, {width: cellW, height: cellW}]} />
              ) : (
                <View style={[styles.image, styles.placeholder, {width: cellW, height: cellW}]} />
              )}
              <FavoriteHeartButton
                product={item}
                apiBaseUrl={apiBaseUrl}
                size="sm"
                style={styles.tileHeart}
              />
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>{priceFormatter.format(item.price)}</Text>
          </View>
        </Pressable>
      );
    },
    [apiBaseUrl, cellW, openDetail],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.filterLabel}>Shop by occasion</Text>
        <HomeChipScroller
          chips={browseChips}
          selectedId={chipFilter}
          onSelect={setChipFilter}
          topSpacing={8}
        />
        <Text style={styles.resultSummary}>{resultSummary}</Text>
      </View>
    ),
    [browseChips, chipFilter, resultSummary],
  );

  const emptyBlock = useMemo(() => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
          <Text style={styles.emptyHint}>Loading catalog…</Text>
        </View>
      );
    }
    if (error && products.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Could not load shop</Text>
          <Text style={styles.emptyHint}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadCatalog('retry')}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No bouquets found</Text>
        <Text style={styles.emptyHint}>
          {searchQuery.trim() || chipFilter
            ? 'Try another occasion or clear your search.'
            : 'Pull down to refresh the catalog.'}
        </Text>
      </View>
    );
  }, [chipFilter, error, loadCatalog, loading, products.length, searchQuery]);

  const headerPaddingTop = Math.max(insets.top, 12);

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, {paddingTop: headerPaddingTop}]}>
        <Text style={styles.heroTitle}>Shop</Text>
        <Text style={styles.heroSub}>Browse every bouquet in our collection</Text>
        <ShopSearchBar
          style={styles.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bouquets…"
        />
      </View>

      <FlatList
        data={displayProducts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          displayProducts.length === 0 ? styles.listContentEmpty : null,
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyBlock}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCatalog('refresh')}
            tintColor={BRAND.maroonPrimary}
            colors={[BRAND.maroonPrimary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  hero: {
    backgroundColor: BRAND.maroonPrimary,
    paddingHorizontal: H_PAD,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: FONTS.body,
    marginTop: 4,
    fontSize: 13,
    color: BRAND.headerTextMuted,
    lineHeight: 18,
  },
  search: {
    marginTop: 14,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 28,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    paddingTop: 18,
    paddingBottom: 8,
  },
  filterLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#6b7280',
  },
  resultSummary: {
    fontFamily: FONTS.body,
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: COL_GAP,
  },
  cell: {
    alignItems: 'stretch',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageShell: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: BRAND.productTileBg,
  },
  image: {
    backgroundColor: BRAND.productTileBg,
  },
  placeholder: {
    opacity: 0.85,
  },
  tileHeart: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
  },
  name: {
    fontFamily: FONTS.body,
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.productTitle,
    lineHeight: 18,
    minHeight: 36,
  },
  price: {
    fontFamily: FONTS.body,
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.productPriceBold,
  },
  emptyWrap: {
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.body,
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: FONTS.body,
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryText: {
    fontFamily: FONTS.body,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ShopScreen;
