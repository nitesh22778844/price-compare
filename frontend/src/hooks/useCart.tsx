import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../lib/types";
import { api } from "../lib/api";

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Add a product to the cart (no-op if its name is already present). */
  add: (item: CartItem) => void;
  /** Remove a product by name. */
  remove: (name: string) => void;
  /** Whether a product name is already in the cart. */
  has: (name: string) => boolean;
  clear: () => void;
  /** POST every cart item's name to the backend; clears the cart on success. */
  checkout: () => Promise<void>;
  submitting: boolean;
  error: string | null;
  /** Confirmation message from the last successful checkout, else null. */
  success: string | null;
  /** Reset transient checkout status (e.g. when the drawer closes). */
  resetStatus: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const has = useCallback(
    (name: string) => items.some((i) => sameName(i.name, name)),
    [items],
  );

  const add = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => sameName(i.name, item.name)) ? prev : [...prev, item],
    );
    setSuccess(null);
    setError(null);
  }, []);

  const remove = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => !sameName(i.name, name)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const checkout = useCallback(async () => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await api.checkoutCart({ products: items.map((i) => i.name) });
      setSuccess(resp.detail);
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  }, [items, submitting]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      add,
      remove,
      has,
      clear,
      checkout,
      submitting,
      error,
      success,
      resetStatus,
    }),
    [items, add, remove, has, clear, checkout, submitting, error, success, resetStatus],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
