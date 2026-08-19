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
// v2：購物車改以「規格」為單位，舊格式（以商品為單位）無法對應，換 key 讓它自然作廢
const STORAGE_KEY = "fieldstay-cart-v2";
const LEGACY_STORAGE_KEY = "fieldstay-cart";

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        variantId: Number(item.variantId),
        qty: Number(item.qty),
      }))
      .filter((item) => Number.isFinite(item.variantId) && item.qty > 0);
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
    // 清掉舊版購物車，避免殘留佔用空間
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // 忽略
    }
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
    const variantId = Number(id);
    const amount = Math.max(Number(qty) || 1, 1);
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (!existing) return [...prev, { variantId, qty: amount }];
      return prev.map((item) =>
        item.variantId === variantId ? { ...item, qty: item.qty + amount } : item
      );
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    const variantId = Number(id);
    const amount = Number(qty);
    setItems((prev) =>
      amount <= 0
        ? prev.filter((item) => item.variantId !== variantId)
        : prev.map((item) =>
            item.variantId === variantId ? { ...item, qty: amount } : item
          )
    );
  }, []);

  const removeItem = useCallback((id) => {
    const variantId = Number(id);
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
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
