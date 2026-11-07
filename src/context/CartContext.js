"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStoreData } from "@/context/StoreDataContext";

const STORAGE_KEY = "aura-cart";
const CartContext = createContext(null);

function colorKey(color) {
  return color?.fr || color?.ar || "";
}

function lineKey(productId, selectedSize, selectedColor) {
  return `${productId}:${selectedSize}:${colorKey(selectedColor)}`;
}

function serialize(items) {
  return items.map((item) => ({
    productId: item.product.id,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
    quantity: item.quantity,
  }));
}

function hydrate(raw, catalog) {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    const quantity = Number(item.quantity);
    if (!product || !item.selectedSize || !item.selectedColor || quantity < 1) {
      return [];
    }
    return [
      {
        product,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: Math.min(product.stock, quantity),
      },
    ];
  });
}

export function CartProvider({ children }) {
  const { products, ready: catalogReady } = useStoreData();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!catalogReady || hydrated.current) return;
    hydrated.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setItems(stored ? hydrate(JSON.parse(stored), products) : []);
    } catch {
      setItems([]);
    }
    setReady(true);
  }, [catalogReady, products]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(items)));
  }, [items, ready]);

  const addToCart = useCallback((product, selectedSize, selectedColor, quantity = 1) => {
    const nextQuantity = Math.max(1, Math.min(product.stock, quantity));
    setItems((current) => {
      const key = lineKey(product.id, selectedSize, selectedColor);
      const existing = current.find(
        (item) => lineKey(item.product.id, item.selectedSize, item.selectedColor) === key,
      );
      if (!existing) {
        return [
          ...current,
          { product, selectedSize, selectedColor, quantity: nextQuantity },
        ];
      }
      return current.map((item) => {
        if (lineKey(item.product.id, item.selectedSize, item.selectedColor) !== key) {
          return item;
        }
        return {
          ...item,
          quantity: Math.min(product.stock, item.quantity + nextQuantity),
        };
      });
    });
  }, []);

  const removeFromCart = useCallback((productId, selectedSize, selectedColor) => {
    const key = lineKey(productId, selectedSize, selectedColor);
    setItems((current) =>
      current.filter(
        (item) => lineKey(item.product.id, item.selectedSize, item.selectedColor) !== key,
      ),
    );
  }, []);

  const updateQuantity = useCallback((productId, selectedSize, selectedColor, quantity) => {
    const key = lineKey(productId, selectedSize, selectedColor);
    setItems((current) =>
      current.flatMap((item) => {
        if (lineKey(item.product.id, item.selectedSize, item.selectedColor) !== key) {
          return [item];
        }
        if (quantity < 1) return [];
        return [{ ...item, quantity: Math.min(item.product.stock, quantity) }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
