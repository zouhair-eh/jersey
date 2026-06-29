/**
 * @file cart-context.tsx
 * @description React Context for global shopping cart state.
 *              Maintains items, quantities, size choices, and custom names/numbers.
 *              Persists items to localStorage and handles visibility of Cart Drawer.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  cartId:       string; // unique identifier: product_id + '_' + size + '_' + name + '_' + number
  productId:    string;
  title:        { ar: string; fr: string; en: string };
  price:        number;
  currency:     string;
  imageUrl:     string;
  size:         string;
  customName?:  string;
  customNumber?: string;
  quantity:     number;
}

interface CartContextType {
  cartItems:      CartItem[];
  isOpen:         boolean;
  setIsOpen:      (open: boolean) => void;
  addToCart:      (item: Omit<CartItem, 'quantity' | 'cartId'>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart:      () => void;
  itemCount:      number;
  totalAmount:    number;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Helper to generate unique cart key ──────────────────────────────────────

function getCartId(productId: string, size: string, name = '', number = ''): string {
  const cleanName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanNum  = number.trim().replace(/[^0-9]/g, '');
  return `${productId}_${size}_${cleanName || 'none'}_${cleanNum || 'none'}`;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen]       = useState(false);
  const [hydrated, setHydrated]   = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jm_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setHydrated(true);
  }, []);

  // Save to localStorage when cartItems change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('jm_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems, hydrated]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity' | 'cartId'>) => {
    setCartItems((prev) => {
      const cartId = getCartId(
        newItem.productId,
        newItem.size,
        newItem.customName,
        newItem.customNumber
      );

      const existingIndex = prev.findIndex((item) => item.cartId === cartId);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { ...newItem, quantity: 1, cartId }];
    });

    // Auto-open cart drawer on add
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
