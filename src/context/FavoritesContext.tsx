import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {Product} from '../types/product';

const STORAGE_KEY = '@tatoy/favorites_v1';

type PersistedFavorites = {
  products: Product[];
  apiBaseUrl?: string;
};

type FavoritesContextValue = {
  favorites: Product[];
  apiBaseUrl: string;
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: Product, apiBaseUrl?: string) => void;
  setApiBaseUrl: (url: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

async function loadPersisted(): Promise<PersistedFavorites> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {products: []};
    }
    const parsed = JSON.parse(raw) as PersistedFavorites;
    if (!parsed || !Array.isArray(parsed.products)) {
      return {products: []};
    }
    return {
      products: parsed.products.filter(
        (p): p is Product =>
          Boolean(p && typeof p.id === 'string' && typeof p.name === 'string'),
      ),
      apiBaseUrl: typeof parsed.apiBaseUrl === 'string' ? parsed.apiBaseUrl : '',
    };
  } catch {
    return {products: []};
  }
}

async function savePersisted(data: PersistedFavorites): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore persistence errors for v1
  }
}

export function FavoritesProvider({children}: {children: React.ReactNode}) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [apiBaseUrl, setApiBaseUrlState] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadPersisted();
      if (cancelled) {
        return;
      }
      setFavorites(stored.products);
      if (stored.apiBaseUrl?.trim()) {
        setApiBaseUrlState(stored.apiBaseUrl.trim());
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((products: Product[], baseUrl: string) => {
    savePersisted({products, apiBaseUrl: baseUrl || undefined});
  }, []);

  const setApiBaseUrl = useCallback(
    (url: string) => {
      const next = url.trim();
      if (!next || next === apiBaseUrl) {
        return;
      }
      setApiBaseUrlState(next);
      if (favorites.length > 0) {
        persist(favorites, next);
      }
    },
    [apiBaseUrl, favorites, persist],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some(p => p.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (product: Product, baseUrl?: string) => {
      const nextBase = baseUrl?.trim() || apiBaseUrl;
      if (baseUrl?.trim()) {
        setApiBaseUrlState(baseUrl.trim());
      }
      setFavorites(prev => {
        const exists = prev.some(p => p.id === product.id);
        const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
        persist(next, nextBase);
        return next;
      });
    },
    [apiBaseUrl, persist],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      apiBaseUrl,
      hydrated,
      isFavorite,
      toggleFavorite,
      setApiBaseUrl,
    }),
    [favorites, apiBaseUrl, hydrated, isFavorite, toggleFavorite, setApiBaseUrl],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
