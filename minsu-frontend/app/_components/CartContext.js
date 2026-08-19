"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();
const STORAGE_KEY = "fieldstay-cart";

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({ id: Number(item.id), qty: Number(item.qty) }))
      .filter((item) => Number.isFinite(item.id) && item.qty > 0);
  } catch {
    return [];
  }
}

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // 先以空購物車 render，掛載後才讀 localStorage，避免 SSR/CSR 內容不一致
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 隱私模式或容量不足時忽略，購物車僅在本次瀏覽有效
    }
  }, [items, isLoaded]);

  // 同一個瀏覽器開多個分頁時保持同步
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((id, qty = 1) => {
    const productId = Number(id);
    const amount = Math.max(Number(qty) || 1, 1);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (!existing) return [...prev, { id: productId, qty: amount }];
      return prev.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + amount } : item
      );
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    const productId = Number(id);
    const amount = Number(qty);
    setItems((prev) =>
      amount <= 0
        ? prev.filter((item) => item.id !== productId)
        : prev.map((item) =>
            item.id === productId ? { ...item, qty: amount } : item
          )
    );
  }, []);

  const removeItem = useCallback((id) => {
    const productId = Number(id);
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, isLoaded, addItem, setQty, removeItem, clearCart, totalCount }),
    [items, isLoaded, addItem, setQty, removeItem, clearCart, totalCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("Context was used outside provider");
  return context;
}

export { CartProvider, useCart };
