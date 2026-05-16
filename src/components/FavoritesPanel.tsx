import React, {useCallback, useEffect} from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {getApiBaseCandidates} from '../app/api/auth';
import {extractBearerJwtFromAuthData, fetchProducts, getProductImageUri} from '../app/api/products';
import type {RootState} from '../app/reducers';
import {useFavorites} from '../context/FavoritesContext';
import FavoriteHeartButton from './FavoriteHeartButton';
import FavoritesEmptyState from './FavoritesEmptyState';
import type {Product} from '../types/product';
import {BRAND, ROUTES} from '../utils';

const H_PAD = 16;
const COL_GAP = 12;

const priceFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type FavoritesPanelProps = {
  showTitle?: boolean;
};

const FavoritesPanel = ({showTitle = false}: FavoritesPanelProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {width: windowW} = useWindowDimensions();
  const auth = useSelector((state: RootState) => state.auth);
  const {favorites, apiBaseUrl, hydrated, setApiBaseUrl} = useFavorites();

  const fallbackBase = getApiBaseCandidates()[0] ?? '';
  const imageBase = apiBaseUrl.trim() || fallbackBase;

  const cellW = Math.max(120, Math.floor((windowW - H_PAD * 2 - COL_GAP) / 2));

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

  useEffect(() => {
    if (apiBaseUrl.trim() || favorites.length === 0) {
      return;
    }
    const token = extractBearerJwtFromAuthData(auth.data);
    fetchProducts(() => token)
      .then(({baseUrl}) => {
        if (baseUrl.trim()) {
          setApiBaseUrl(baseUrl);
        }
      })
      .catch(() => {});
  }, [apiBaseUrl, auth.data, favorites.length, setApiBaseUrl]);

  const openDetail = useCallback(
    (item: Product) => {
      const tabNav = navigation.getParent() ?? navigation;
      tabNav.navigate(ROUTES.TAB_HOME, {
        screen: ROUTES.PRODUCT_DETAIL,
        params: {
          product: item,
          apiBaseUrl: imageBase,
          relatedProducts: favorites,
        },
      });
    },
    [favorites, imageBase, navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Product}) => {
      const uri = getProductImageUri(imageBase, item.image);
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
              apiBaseUrl={imageBase}
              filled
              size="sm"
              style={styles.heartOverlay}
            />
          </View>
          <Text style={styles.price}>{priceFormatter.format(item.price)}</Text>
        </Pressable>
      );
    },
    [cellW, imageBase, openDetail],
  );

  if (!hydrated) {
    return <View style={styles.screen} />;
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.screen}>
        {showTitle ? <Text style={styles.headerTitle}>My Wishlist</Text> : null}
        <FavoritesEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {showTitle ? <Text style={styles.headerTitle}>My Wishlist</Text> : null}
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND.maroonPrimary,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 4,
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
  heartOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
  },
  price: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.productPriceBold,
    textAlign: 'center',
  },
});

export default FavoritesPanel;
