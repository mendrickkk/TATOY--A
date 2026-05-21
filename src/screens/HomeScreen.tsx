import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {fetchCategoryLabelMap} from '../app/api/categories';
import {
  getProductCategoryLabel,
  mergeCategoryLabelMaps,
  mergeCategoryLabelsFromProducts,
  type CategoryLabelMap,
} from '../utils/categoryDisplay';
import {extractBearerJwtFromAuthData, fetchProducts} from '../app/api/products';
import {isSessionExpiredError} from '../app/api/session';
import type {RootState} from '../app/reducers';
import AppHeader from '../components/AppHeader';
import HeroCarousel from '../components/HeroCarousel';
import HomeChipScroller from '../components/home/HomeChipScroller';
import HomeProductRail from '../components/home/HomeProductRail';
import HomePromoBanner from '../components/home/HomePromoBanner';
import HomeQuickActions from '../components/home/HomeQuickActions';
import HomeSectionHeader from '../components/home/HomeSectionHeader';
import HomeTrustStrip from '../components/home/HomeTrustStrip';
import ShopSearchBar from '../components/ShopSearchBar';
import {useFavorites} from '../context/FavoritesContext';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, FONTS, ROUTES} from '../utils';
import {
  buildBrowseChips,
  filterHomeCatalog,
  pickFreshPicks,
  pickPopularProducts,
  productMatchesMerchandisingSection,
} from '../utils/homeCatalog';
import {getUserDisplayName} from '../utils/userDisplayName';

type NavProp = StackNavigationProp<RootStackParamList>;
type TabNavProp = BottomTabNavigationProp<MainTabParamList>;

const DEMO_BADGE: number | boolean = true;

const HomeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);
  const {setApiBaseUrl: setFavoritesApiBase} = useFavorites();
  const displayName = getUserDisplayName(auth.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chipFilter, setChipFilter] = useState<string | null>(null);
  const [categoryLabelMap, setCategoryLabelMap] = useState<CategoryLabelMap>({});
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
        const [{products: next, baseUrl, categoryLabels: fromProducts}, fromApi] =
          await Promise.all([fetchProducts(getToken), fetchCategoryLabelMap(getToken)]);
        const labels = mergeCategoryLabelMaps(fromApi, fromProducts);
        mergeCategoryLabelsFromProducts(labels, next);
        setProducts(next);
        setCategoryLabelMap(labels);
        if (__DEV__) {
          const fresh = next.filter(p =>
            productMatchesMerchandisingSection(p, 'fresh-picks', labels),
          );
          console.log(
            '[Home] Fresh picks:',
            fresh.length,
            fresh.map(p => ({
              name: p.name,
              category: p.category,
              resolved: getProductCategoryLabel(p, labels),
            })),
          );
        }
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
    }, [loadProducts]),
  );

  const browseChips = useMemo(
    () => buildBrowseChips(categoryLabelMap),
    [categoryLabelMap],
  );

  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length > 0;
  const hasChipFilter = chipFilter !== null;
  const hasCatalogFilters = hasChipFilter || isSearchActive;

  const catalogProducts = useMemo(
    () =>
      filterHomeCatalog(products, {
        searchQuery,
        chipId: chipFilter,
        categoryLabelMap,
      }),
    [products, searchQuery, chipFilter, categoryLabelMap],
  );

  const popularProducts = useMemo(() => {
    if (hasCatalogFilters) {
      return catalogProducts;
    }
    return pickPopularProducts(products, categoryLabelMap);
  }, [catalogProducts, categoryLabelMap, hasCatalogFilters, products]);

  const freshPicks = useMemo(
    () => pickFreshPicks(products, categoryLabelMap),
    [products, categoryLabelMap],
  );

  const activeChipLabel = useMemo(
    () => browseChips.find(c => c.id === chipFilter)?.label,
    [browseChips, chipFilter],
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

  const navigateSeeAll = useCallback(
    (
      list: Product[],
      sectionFilterId?: 'popular' | 'fresh-picks',
    ) => {
      navigation.navigate(ROUTES.POPULAR_BOUQUETS, {
        products: list.length > 0 ? list : undefined,
        apiBaseUrl: apiBaseUrl.trim() ? apiBaseUrl : undefined,
        categoryLabelMap,
        ...(isSearchActive ? {initialSearchQuery: trimmedSearch} : {}),
        ...(hasChipFilter && chipFilter
          ? {
              chipFilterId: chipFilter,
              chipFilterLabel: activeChipLabel,
            }
          : {}),
        ...(sectionFilterId && !hasChipFilter ? {sectionFilterId} : {}),
      });
    },
    [
      activeChipLabel,
      apiBaseUrl,
      categoryLabelMap,
      chipFilter,
      hasChipFilter,
      isSearchActive,
      navigation,
      trimmedSearch,
    ],
  );

  const openMyOrders = useCallback(() => {
    navigation.getParent<TabNavProp>()?.navigate(ROUTES.TAB_PROFILE, {
      screen: ROUTES.MY_ORDERS,
    });
  }, [navigation]);

  const openShop = useCallback(() => {
    navigation.getParent<TabNavProp>()?.navigate(ROUTES.TAB_SHOP, {screen: ROUTES.SHOP});
  }, [navigation]);

  const railEmpty = useMemo(() => {
    if (isSearchActive) {
      return {title: 'No bouquets found', subtitle: 'Try a different name or clear filters.'};
    }
    if (hasChipFilter) {
      return {
        title: 'No matches',
        subtitle: 'Try another occasion.',
      };
    }
    return {
      title: 'No popular bouquets yet',
      subtitle: 'Assign products to the Popular Bouquet category in admin.',
    };
  }, [hasChipFilter, isSearchActive]);

  const freshEmpty = useMemo(
    () => ({
      title: 'No fresh picks yet',
      subtitle: 'Assign products to the Fresh Picks category in admin.',
    }),
    [],
  );

  const sectionSubtitle = useMemo(() => {
    if (isSearchActive) {
      return `${catalogProducts.length} match${catalogProducts.length === 1 ? '' : 'es'}`;
    }
    if (hasChipFilter && activeChipLabel) {
      return `${catalogProducts.length} match${catalogProducts.length === 1 ? '' : 'es'} · ${activeChipLabel}`;
    }
    return 'Customer favorites this week';
  }, [activeChipLabel, catalogProducts.length, hasChipFilter, isSearchActive]);

  const listHeader = useMemo(() => {
    const paddingTop = Math.max(insets.top, 12);
    return (
      <View style={[styles.hero, {paddingTop}]}>
        <AppHeader
          userDisplayName={displayName}
          onPressNotifications={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          notificationBadge={DEMO_BADGE}
        />
        <Text style={styles.tagline}>Fresh blooms, crafted for every occasion</Text>
        <ShopSearchBar
          style={styles.searchSpacing}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    );
  }, [displayName, insets.top, navigation, searchQuery]);

  const showBrowseSections = !isSearchActive;

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

        <View style={styles.body}>
          <HeroCarousel onOrderNow={openShop} />

          {showBrowseSections ? (
            <>
              <HomeQuickActions onPressOrders={openMyOrders} />

              <HomePromoBanner />

              <View style={[styles.section, styles.filterSection]}>
                <HomeSectionHeader
                  title="Shop by occasion"
                  subtitle="Find the right bouquet"
                  compact
                />
                <HomeChipScroller
                  chips={browseChips}
                  selectedId={chipFilter}
                  onSelect={setChipFilter}
                  topSpacing={10}
                />
              </View>
            </>
          ) : null}

          <View style={styles.section}>
            <HomeSectionHeader
              title={
                isSearchActive
                  ? 'Search results'
                  : hasChipFilter
                    ? 'Filtered bouquets'
                    : 'Popular bouquets'
              }
              subtitle={sectionSubtitle}
              onSeeAll={
                popularProducts.length > 0
                  ? () =>
                      navigateSeeAll(
                        popularProducts,
                        hasChipFilter ? undefined : 'popular',
                      )
                  : undefined
              }
            />
            <HomeProductRail
              products={popularProducts}
              apiBaseUrl={apiBaseUrl}
              loading={loading && products.length === 0}
              error={error}
              emptyTitle={railEmpty.title}
              emptySubtitle={railEmpty.subtitle}
              onRetry={() => loadProducts('retry')}
              onPressProduct={openProductDetail}
            />
          </View>

          {showBrowseSections && !hasCatalogFilters && !loading ? (
            <View style={styles.section}>
              <HomeSectionHeader
                title="Fresh picks"
                subtitle="From our Fresh Picks collection"
                onSeeAll={
                  freshPicks.length > 0
                    ? () => navigateSeeAll(freshPicks, 'fresh-picks')
                    : undefined
                }
              />
              <HomeProductRail
                products={freshPicks}
                apiBaseUrl={apiBaseUrl}
                emptyTitle={freshEmpty.title}
                emptySubtitle={freshEmpty.subtitle}
                onPressProduct={openProductDetail}
              />
            </View>
          ) : null}

          {showBrowseSections ? <HomeTrustStrip /> : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: BRAND.maroonPrimary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tagline: {
    fontFamily: FONTS.body,
    marginTop: 4,
    fontSize: 13,
    color: BRAND.headerTextMuted,
    lineHeight: 18,
  },
  searchSpacing: {
    marginTop: 12,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  section: {
    marginBottom: 22,
  },
  filterSection: {
    marginBottom: 26,
  },
});

export default HomeScreen;
