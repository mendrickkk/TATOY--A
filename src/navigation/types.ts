import {ROUTES} from '../utils';
import type {Product} from '../types/product';

export type RootStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.HOME]: undefined;
  [ROUTES.PROFILE]: undefined;
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
