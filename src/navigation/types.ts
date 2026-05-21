import type {NavigatorScreenParams} from '@react-navigation/native';

import {ROUTES} from '../utils';
import type {CategoryLabelMap} from '../utils/categoryDisplay';
import type {Order} from '../types/order';
import type {Product} from '../types/product';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
};

export type ShopStackParamList = {
  [ROUTES.SHOP]: undefined;
  [ROUTES.PRODUCT_DETAIL]: {
    apiBaseUrl?: string;
    product?: Product;
    productId?: string;
    relatedProducts?: Product[];
  };
};

export type HomeStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.PRODUCT_DETAIL]: {
    apiBaseUrl?: string;
    product?: Product;
    productId?: string;
    relatedProducts?: Product[];
  };
  [ROUTES.POPULAR_BOUQUETS]: {
    products?: Product[];
    apiBaseUrl?: string;
    /** When set, catalog list is filtered client-side (e.g. from Home search). */
    initialSearchQuery?: string;
    /** Occasion chip from Home (e.g. wedding) — list shows only matching bouquets. */
    chipFilterId?: string;
    chipFilterLabel?: string;
    categoryLabelMap?: CategoryLabelMap;
    /** Home rail section from admin category (Popular bouquet / Fresh picks). */
    sectionFilterId?: 'popular' | 'fresh-picks';
  };
  [ROUTES.CHECKOUT]: undefined;
  [ROUTES.ORDER_SUCCESS]: {
    orderNumber?: string;
    orderId?: string;
  };
};

export type ProfileStackParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.PROFILE_INFO]: undefined;
  [ROUTES.MY_ORDERS]: undefined;
  [ROUTES.ORDER_DETAILS]: {
    order: Order;
    apiBaseUrl?: string;
  };
  [ROUTES.MY_WISHLIST]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
};

export type MainTabParamList = {
  [ROUTES.TAB_HOME]: NavigatorScreenParams<HomeStackParamList> | undefined;
  [ROUTES.TAB_SHOP]: NavigatorScreenParams<ShopStackParamList> | undefined;
  [ROUTES.TAB_FAVORITE]: undefined;
  [ROUTES.TAB_CART]: undefined;
  [ROUTES.TAB_PROFILE]: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/** Home stack screens (product list, detail, etc.) */
export type RootStackParamList = HomeStackParamList;
