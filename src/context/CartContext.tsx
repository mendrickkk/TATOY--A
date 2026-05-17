import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {CartLine} from '../types/cart';
import type {Product} from '../types/product';

const STORAGE_KEY = '@tatoy/cart_v1';

type PersistedCart = {
  lines: CartLine[];
  apiBaseUrl?: string;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  apiBaseUrl: string;
  hydrated: boolean;
  loadError: string | null;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setApiBaseUrl: (url: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isValidLine(entry: unknown): entry is CartLine {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  const line = entry as CartLine;
  const p = line.product;
  return (
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    Boolean(p && typeof p.id === 'string' && typeof p.name === 'string')
  );
}

async function loadPersisted(): Promise<{data: PersistedCart; error: string | null}> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {data: {lines: []}, error: null};
    }
    const parsed = JSON.parse(raw) as PersistedCart;
    if (!parsed || !Array.isArray(parsed.lines)) {
      return {data: {lines: []}, error: null};
    }
    return {
      data: {
        lines: parsed.lines.filter(isValidLine).map(l => ({
          product: l.product,
          quantity: Math.max(1, Math.floor(l.quantity)),
        })),
        apiBaseUrl: typeof parsed.apiBaseUrl === 'string' ? parsed.apiBaseUrl : '',
      },
      error: null,
    };
  } catch {
    return {data: {lines: []}, error: 'Could not load your cart'};
  }
}

async function savePersisted(data: PersistedCart): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore persistence errors for v1
  }
}

export function CartProvider({children}: {children: React.ReactNode}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [apiBaseUrl, setApiBaseUrlState] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {data, error} = await loadPersisted();
      if (cancelled) {
        return;
      }
      setLines(data.lines);
      if (data.apiBaseUrl?.trim()) {
        setApiBaseUrlState(data.apiBaseUrl.trim());
      }
      setLoadError(error);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((nextLines: CartLine[], baseUrl: string) => {
    savePersisted({lines: nextLines, apiBaseUrl: baseUrl || undefined});
  }, []);

  const setApiBaseUrl = useCallback(
    (url: string) => {
      const next = url.trim();
      if (!next || next === apiBaseUrl) {
        return;
      }
      setApiBaseUrlState(next);
      if (lines.length > 0) {
        persist(lines, next);
      }
    },
    [apiBaseUrl, lines, persist],
  );

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      const qty = Math.max(1, Math.floor(quantity));
      setLines(prev => {
        const idx = prev.findIndex(l => l.product.id === product.id);
        const next =
          idx >= 0
            ? prev.map((l, i) =>
                i === idx ? {...l, quantity: l.quantity + qty} : l,
              )
            : [...prev, {product, quantity: qty}];
        persist(next, apiBaseUrl);
        return next;
      });
    },
    [apiBaseUrl, persist],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const qty = Math.floor(quantity);
      setLines(prev => {
        const next =
          qty <= 0
            ? prev.filter(l => l.product.id !== productId)
            : prev.map(l =>
                l.product.id === productId ? {...l, quantity: qty} : l,
              );
        persist(next, apiBaseUrl);
        return next;
      });
    },
    [apiBaseUrl, persist],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setLines(prev => {
        const next = prev.filter(l => l.product.id !== productId);
        persist(next, apiBaseUrl);
        return next;
      });
    },
    [apiBaseUrl, persist],
  );

  const clearCart = useCallback(() => {
    setLines([]);
    persist([], apiBaseUrl);
  }, [apiBaseUrl, persist]);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      apiBaseUrl,
      hydrated,
      loadError,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setApiBaseUrl,
    }),
    [
      lines,
      itemCount,
      subtotal,
      apiBaseUrl,
      hydrated,
      loadError,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setApiBaseUrl,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
