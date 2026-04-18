'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
  loyalty_points: number;
}

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  restaurant_id: number;
  restaurant_name: string;
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => { success: boolean; error?: string };
  removeFromCart: (menuItemId: number) => void;
  updateCartQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const addToCart = (item: CartItem): { success: boolean; error?: string } => {
    // Single restaurant rule (ORD-FR-01)
    if (cart.length > 0 && cart[0].restaurant_id !== item.restaurant_id) {
      return { success: false, error: 'You can order from only one restaurant at a time' };
    }

    // 100-item limit (ORD-FR-01.2)
    const currentCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
    if (currentCount + item.quantity > 100) {
      return { success: false, error: 'Maximum limit of 100 items per order is reached.' };
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.menu_item_id === item.menu_item_id);
      if (existing) {
        return prev.map((ci) =>
          ci.menu_item_id === item.menu_item_id
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci
        );
      }
      return [...prev, item];
    });
    return { success: true };
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => prev.filter((ci) => ci.menu_item_id !== menuItemId));
  };

  const updateCartQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    const otherCount = cart.filter(ci => ci.menu_item_id !== menuItemId).reduce((s, ci) => s + ci.quantity, 0);
    if (otherCount + quantity > 100) return;

    setCart((prev) =>
      prev.map((ci) =>
        ci.menu_item_id === menuItemId ? { ...ci, quantity } : ci
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  const cartItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <AppContext.Provider value={{ user, setUser, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemCount, loading, refreshUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
