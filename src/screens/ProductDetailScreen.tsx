import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {getApiBaseCandidates} from '../app/api/auth';
import {extractBearerJwtFromAuthData, fetchProductById, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import {showInfo} from '../components/alert_messages';
import FavoriteHeartButton from '../components/FavoriteHeartButton';
import {useFavorites} from '../context/FavoritesContext';
import type {RootStackParamList} from '../navigation/types';
import type {Product} from '../types/product';
import {BRAND, ROUTES} from '../utils';

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

const H_PAD = 16;
const HERO_RADIUS = 20;
const TILE = 100;
const DESC_COLLAPSE_AT = 220;

type NavProp = StackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, typeof ROUTES.PRODUCT_DETAIL>;

function resolveRouteId(params: DetailRoute['params']): string | null {
  const fromProduct = params.product?.id?.trim();
  const fromParam = params.productId?.trim();
  return fromProduct || fromParam || null;
}

const ProductDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DetailRoute>();
  const insets = useSafeAreaInsets();
  const auth = useSelector((state: RootState) => state.auth);

  const params = route.params;
  const routeId = resolveRouteId(params);
  const fallbackBase = getApiBaseCandidates()[0] ?? '';

  const [product, setProduct] = useState<Product | null>(params.product ?? null);
  const [apiBaseUrl, setApiBaseUrl] = useState(
    params.apiBaseUrl?.trim() || fallbackBase,
  );
  const [loading, setLoading] = useState(!params.product);
  const [error, setError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const {setApiBaseUrl: setFavoritesApiBase} = useFavorites();

  const getToken = useCallback(() => extractBearerJwtFromAuthData(auth.data), [auth.data]);

  const fetchById = useCallback(async () => {
    if (!routeId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const {product: next, baseUrl} = await fetchProductById(routeId, getToken);
      setProduct(next);
      setApiBaseUrl(baseUrl);
      if (baseUrl.trim()) {
        setFavoritesApiBase(baseUrl);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not load product';
      setError(message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [getToken, routeId, setFavoritesApiBase]);

  useEffect(() => {
    if (!routeId) {
      setLoading(false);
      setError('Missing product');
      return;
    }
    if (params.product) {
      setProduct(params.product);
      const base = params.apiBaseUrl?.trim() || fallbackBase;
      setApiBaseUrl(base);
      if (base) {
        setFavoritesApiBase(base);
      }
      setLoading(false);
      setError(null);
      return;
    }
    fetchById();
  }, [routeId, params.product, params.apiBaseUrl, fallbackBase, fetchById, setFavoritesApiBase]);

  useEffect(() => {
    setDescExpanded(false);
  }, [routeId]);

  useEffect(() => {
    if (apiBaseUrl.trim()) {
      setFavoritesApiBase(apiBaseUrl);
    }
  }, [apiBaseUrl, setFavoritesApiBase]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(BRAND.pageMutedBg);
      }
      return () => {
        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(BRAND.maroonPrimary);
        }
      };
    }, []),
  );

  const description = product?.description?.trim() ?? '';
  const descLong = description.length > DESC_COLLAPSE_AT;
  const descShown =
    descExpanded || !descLong ? description : `${description.slice(0, DESC_COLLAPSE_AT).trim()}…`;

  const heroUri = product ? getProductImageUri(apiBaseUrl, product.image) : null;

  const related = useMemo(() => {
    const list = params.relatedProducts ?? [];
    if (!product) {
      return list;
    }
    return list.filter(p => p.id !== product.id);
  }, [params.relatedProducts, product]);

  const onAddToCart = useCallback(() => {
    showInfo({
      title: 'Cart',
      message: 'Cart coming next',
      position: 'bottom',
    });
  }, []);

  const openProduct = useCallback(
    (item: Product) => {
      navigation.push(ROUTES.PRODUCT_DETAIL, {
        product: item,
        apiBaseUrl,
        relatedProducts: params.relatedProducts,
      });
    },
    [apiBaseUrl, navigation, params.relatedProducts],
  );

  const renderRelated = useCallback(
    ({item}: {item: Product}) => {
      const uri = getProductImageUri(apiBaseUrl, item.image);
      return (
        <TouchableOpacity
          style={styles.relatedTileWrap}
          onPress={() => openProduct(item)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={item.name}>
          <View style={styles.relatedShell}>
            {uri ? (
              <Image source={{uri}} style={styles.relatedImage} resizeMode="cover" />
            ) : (
              <View style={[styles.relatedImage, styles.relatedPlaceholder]} />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [apiBaseUrl, openProduct],
  );

  const bottomInset = Math.max(insets.bottom, 12);

  if (!routeId) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>This product could not be opened.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !product) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND.maroonPrimary} />
        <Text style={styles.stateSubtext}>Loading product…</Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchById}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollInner,
          {paddingBottom: bottomInset + 88},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <View style={[styles.heroCard, {marginTop: insets.top + 8}]}>
            {heroUri ? (
              <Image
                source={{uri: heroUri}}
                style={styles.heroImage}
                resizeMode="cover"
                accessibilityLabel={product.name}
              />
            ) : (
              <View style={[styles.heroImage, styles.heroPlaceholder]} />
            )}
          </View>
          <View
            style={[styles.heroOverlayRow, {top: insets.top + 8}]}
            pointerEvents="box-none">
            <Pressable
              style={styles.circleBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <Text style={styles.backChevron}>‹</Text>
            </Pressable>
            <View style={styles.circleBtn}>
              <FavoriteHeartButton product={product} apiBaseUrl={apiBaseUrl} size="lg" />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>{priceFormatter.format(product.price)}</Text>

          <Text style={styles.sectionHeading}>Details</Text>
          {description ? (
            <View>
              <Text style={styles.bodyText}>{descShown}</Text>
              {descLong ? (
                <TouchableOpacity
                  onPress={() => setDescExpanded(e => !e)}
                  accessibilityRole="button"
                  hitSlop={{top: 6, bottom: 6, left: 4, right: 4}}>
                  <Text style={styles.readToggle}>{descExpanded ? 'Read less' : 'Read more'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <Text style={styles.bodyMuted}>No description for this bouquet yet.</Text>
          )}

          <View style={styles.moreSection}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionHeadingFlat}>More bouquets</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ROUTES.POPULAR_BOUQUETS, {
                    products:
                      (params.relatedProducts?.length ?? 0) > 0
                        ? params.relatedProducts
                        : undefined,
                    apiBaseUrl: apiBaseUrl.trim() ? apiBaseUrl : undefined,
                  })
                }
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityRole="button"
                accessibilityLabel="See all bouquets">
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {related.length > 0 ? (
              <FlatList
                horizontal
                data={related}
                keyExtractor={item => item.id}
                renderItem={renderRelated}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedRail}
                ItemSeparatorComponent={RelatedProductsListSeparator}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, {paddingBottom: bottomInset}]}>
        <View style={styles.bottomBarInner}>
          <View>
            <Text style={styles.bottomLabel}>Price</Text>
            <Text style={styles.bottomPrice}>{priceFormatter.format(product.price)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToCart}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Add to cart">
            <Text style={styles.addBtnText}>Add to cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.pageMutedBg,
  },
  scrollInner: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateSubtext: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
  },
  errorText: {
    fontSize: 15,
    color: '#a40000',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  heroBlock: {
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: HERO_RADIUS,
    overflow: 'hidden',
    backgroundColor: BRAND.productTileBg,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1.05,
    backgroundColor: BRAND.productTileBg,
  },
  heroPlaceholder: {
    opacity: 0.9,
  },
  heroOverlayRow: {
    position: 'absolute',
    left: H_PAD + 10,
    right: H_PAD + 10,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  backChevron: {
    fontSize: 28,
    color: '#444444',
    marginTop: -2,
    fontWeight: '300',
  },
  body: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  inlineError: {
    fontSize: 13,
    color: '#a40000',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.productTitle,
    letterSpacing: -0.3,
  },
  price: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.productPriceBold,
  },
  sectionHeading: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.productTitle,
  },
  sectionHeadingFlat: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.productTitle,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
  },
  bodyMuted: {
    fontSize: 15,
    lineHeight: 22,
    color: '#888888',
  },
  readToggle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.maroonPrimary,
  },
  moreSection: {
    marginTop: 28,
    marginBottom: 8,
  },
  relatedRail: {
    paddingRight: H_PAD,
  },
  relatedRailSep: {
    width: 12,
  },
  relatedTileWrap: {
    width: TILE,
  },
  relatedShell: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: BRAND.productTileBg,
  },
  relatedImage: {
    width: TILE,
    height: TILE,
    backgroundColor: BRAND.productTileBg,
  },
  relatedPlaceholder: {
    opacity: 0.85,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    paddingHorizontal: H_PAD,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 12,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#777777',
  },
  bottomPrice: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.productPriceBold,
  },
  addBtn: {
    flex: 1,
    backgroundColor: BRAND.maroonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

function RelatedProductsListSeparator() {
  return <View style={styles.relatedRailSep} />;
}

export default ProductDetailScreen;
