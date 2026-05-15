import type {NavigatorScreenParams} from '@react-navigation/native';

import {ROUTES} from '../utils';
import type {Product} from '../types/product';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
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
  };
};

export type MainTabParamList = {
  [ROUTES.TAB_HOME]: NavigatorScreenParams<HomeStackParamList> | undefined;
  [ROUTES.TAB_FAVORITE]: undefined;
  [ROUTES.TAB_CART]: undefined;
  [ROUTES.TAB_PROFILE]: undefined;
};

/** Home stack screens (product list, detail, etc.) */
export type RootStackParamList = HomeStackParamList;
