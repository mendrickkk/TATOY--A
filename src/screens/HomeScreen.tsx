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
  filterHomeCatalog,
  HOME_OCCASIONS,
  pickFreshPicks,
  pickPopularProducts,
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
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);
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
    }, [loadProducts]),
  );

  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length > 0;
  const hasCatalogFilters = Boolean(occasionFilter);

  const catalogProducts = useMemo(
    () =>
      filterHomeCatalog(products, {
        searchQuery,
        categoryId: null,
        occasionId: occasionFilter,
      }),
    [products, searchQuery, occasionFilter],
  );

  const popularProducts = useMemo(() => pickPopularProducts(catalogProducts), [catalogProducts]);
  const freshPicks = useMemo(() => pickFreshPicks(catalogProducts), [catalogProducts]);

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
    (list: Product[]) => {
      navigation.navigate(ROUTES.POPULAR_BOUQUETS, {
        products: list.length > 0 ? list : undefined,
        apiBaseUrl: apiBaseUrl.trim() ? apiBaseUrl : undefined,
        ...(isSearchActive ? {initialSearchQuery: trimmedSearch} : {}),
      });
    },
    [apiBaseUrl, isSearchActive, navigation, trimmedSearch],
  );

  const openMyOrders = useCallback(() => {
    navigation.getParent<TabNavProp>()?.navigate(ROUTES.TAB_PROFILE, {
      screen: ROUTES.MY_ORDERS,
    });
  }, [navigation]);

  const railEmpty = useMemo(() => {
    if (isSearchActive) {
      return {title: 'No bouquets found', subtitle: 'Try a different name or clear filters.'};
    }
    if (hasCatalogFilters) {
      return {title: 'No matches', subtitle: 'Try another occasion.'};
    }
    return {title: 'No products yet', subtitle: 'Check back later or pull down to refresh.'};
  }, [hasCatalogFilters, isSearchActive]);

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
          <HeroCarousel />

          {showBrowseSections ? (
            <>
              <HomeQuickActions onPressOrders={openMyOrders} />

              <View style={[styles.section, styles.filterSection]}>
                <HomeSectionHeader
                  title="Shop by occasion"
                  subtitle="Find the right bouquet"
                  compact
                />
                <HomeChipScroller
                  chips={HOME_OCCASIONS}
                  selectedId={occasionFilter}
                  onSelect={setOccasionFilter}
                  topSpacing={10}
                />
              </View>

              <HomePromoBanner />
            </>
          ) : null}

          <View style={styles.section}>
            <HomeSectionHeader
              title={
                isSearchActive
                  ? 'Search results'
                  : hasCatalogFilters
                    ? 'Filtered bouquets'
                    : 'Popular bouquets'
              }
              subtitle={
                isSearchActive
                  ? `${catalogProducts.length} match${catalogProducts.length === 1 ? '' : 'es'}`
                  : 'Customer favorites this week'
              }
              onSeeAll={
                catalogProducts.length > 0
                  ? () => navigateSeeAll(catalogProducts)
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

          {showBrowseSections && !hasCatalogFilters && !loading && catalogProducts.length > 1 ? (
            <View style={styles.section}>
              <HomeSectionHeader
                title="Fresh picks"
                subtitle="Recently added & seasonal"
                onSeeAll={() => navigateSeeAll(freshPicks)}
              />
              <HomeProductRail
                products={freshPicks}
                apiBaseUrl={apiBaseUrl}
                emptyTitle="More blooms coming soon"
                emptySubtitle="Pull down to refresh the catalog."
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
