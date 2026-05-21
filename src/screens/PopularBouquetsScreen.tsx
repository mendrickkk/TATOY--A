import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
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
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSelector} from 'react-redux';

import {fetchCategoryLabelMap} from '../app/api/categories';
import {extractBearerJwtFromAuthData, fetchProducts, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import FavoriteHeartButton from '../components/FavoriteHeartButton';
import {useFavorites} from '../context/FavoritesContext';
import type {RootStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, ROUTES} from '../utils';
import {
  mergeCategoryLabelMaps,
  mergeCategoryLabelsFromProducts,
  type CategoryLabelMap,
} from '../utils/categoryDisplay';
import {
  filterHomeCatalog,
  merchandisingCatalogTitle,
  occasionCatalogTitle,
  productMatchesMerchandisingSection,
} from '../utils/homeCatalog';

const H_PAD = 16;
const COL_GAP = 12;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type NavProp = StackNavigationProp<RootStackParamList>;
type CatalogRoute = RouteProp<RootStackParamList, typeof ROUTES.POPULAR_BOUQUETS>;

const PopularBouquetsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<CatalogRoute>();
  const {width: windowW} = useWindowDimensions();
  const auth = useSelector((state: RootState) => state.auth);
  const {setApiBaseUrl: setFavoritesApiBase} = useFavorites();

  const initialProducts = route.params?.products;
  const initialBase = route.params?.apiBaseUrl?.trim() ?? '';
  const initialSearchQuery = route.params?.initialSearchQuery?.trim() ?? '';
  const chipFilterId = route.params?.chipFilterId ?? null;
  const chipFilterLabel = route.params?.chipFilterLabel;
  const sectionFilterId = route.params?.sectionFilterId;
  const initialCategoryLabelMap = route.params?.categoryLabelMap ?? {};

  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [categoryLabelMap, setCategoryLabelMap] =
    useState<CategoryLabelMap>(initialCategoryLabelMap);
  const [apiBaseUrl, setApiBaseUrl] = useState(initialBase);
  const [loading, setLoading] = useState(!initialProducts?.length);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cellW = useMemo(
    () => Math.max(120, Math.floor((windowW - H_PAD * 2 - COL_GAP) / 2)),
    [windowW],
  );

  const displayProducts = useMemo(() => {
    let list = filterHomeCatalog(products, {
      searchQuery: initialSearchQuery,
      chipId: chipFilterId,
      categoryLabelMap,
    });
    if (sectionFilterId && !chipFilterId) {
      list = list.filter(p =>
        productMatchesMerchandisingSection(p, sectionFilterId, categoryLabelMap),
      );
    }
    return list;
  }, [
    products,
    initialSearchQuery,
    chipFilterId,
    sectionFilterId,
    categoryLabelMap,
  ]);

  const screenTitle = useMemo(() => {
    if (chipFilterId) {
      return occasionCatalogTitle(chipFilterId, chipFilterLabel);
    }
    if (initialSearchQuery) {
      return 'Search results';
    }
    if (sectionFilterId) {
      return merchandisingCatalogTitle(sectionFilterId);
    }
    return 'Popular bouquets';
  }, [chipFilterId, chipFilterLabel, initialSearchQuery, sectionFilterId]);

  useLayoutEffect(() => {
    navigation.setOptions({title: screenTitle});
  }, [navigation, screenTitle]);

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const loadProducts = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else if (!initialProducts?.length) {
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
        setError(e instanceof Error ? e.message : 'Could not load products');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken, initialProducts?.length, setFavoritesApiBase],
  );

  useEffect(() => {
    loadProducts('initial');
  }, [loadProducts]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#ffffff');
      }
      return () => {
        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(BRAND.maroonPrimary);
        }
      };
    }, []),
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
          accessibilityLabel={`${item.name}, ${priceFormatter.format(item.price)}`}
          android_ripple={{color: 'rgba(110, 15, 15, 0.1)', borderless: false}}>
          <View style={styles.imageShell}>
            {uri ? (
              <View style={[styles.image, {width: cellW, height: cellW}]} pointerEvents="none">
                <Image
                  source={{uri}}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                  accessibilityLabel={item.name}
                />
              </View>
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
        </Pressable>
      );
    },
    [apiBaseUrl, cellW, openDetail],
  );

  const emptyMessage = useMemo(() => {
    if (initialSearchQuery) {
      return {title: 'No bouquets found', hint: 'Try a different name'};
    }
    if (chipFilterId) {
      return {
        title: `No ${chipFilterLabel ?? 'matching'} bouquets`,
        hint: 'Try another occasion on Home or pull down to refresh.',
      };
    }
    if (sectionFilterId === 'fresh-picks') {
      return {
        title: 'No fresh picks yet',
        hint: 'Assign products to the Fresh Picks category in admin.',
      };
    }
    if (sectionFilterId === 'popular') {
      return {
        title: 'No popular bouquets yet',
        hint: 'Assign products to the Popular Bouquet category in admin.',
      };
    }
    return {title: 'No bouquets to show', hint: 'Pull down to refresh.'};
  }, [chipFilterId, chipFilterLabel, initialSearchQuery, sectionFilterId]);

  if (loading && displayProducts.length === 0 && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
        <Text style={styles.hint}>Loading bouquets…</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retry} onPress={() => loadProducts('initial')}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={displayProducts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts('refresh')}
            tintColor={BRAND.maroonPrimary}
            colors={[BRAND.maroonPrimary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
            <Text style={styles.hint}>{emptyMessage.hint}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 28,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: COL_GAP,
  },
  cell: {
    alignItems: 'center',
  },
  imageShell: {
    borderRadius: 14,
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
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: BRAND.productTitle,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 4,
  },
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.productPriceBold,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  hint: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  error: {
    fontSize: 15,
    color: '#a40000',
    textAlign: 'center',
    lineHeight: 22,
  },
  retry: {
    marginTop: 18,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PopularBouquetsScreen;
