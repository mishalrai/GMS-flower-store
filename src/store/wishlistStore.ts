import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
  items: [],

  addItem: (product: Product) => {
    set((state) => {
      if (state.items.some((item) => item.id === product.id)) {
        return state;
      }
      return { items: [...state.items, product] };
    });
  },

  removeItem: (productId: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  toggleItem: (product: Product) => {
    const { items } = get();
    if (items.some((item) => item.id === product.id)) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },

  isInWishlist: (productId: number) => {
    return get().items.some((item) => item.id === productId);
  },
    }),
    {
      name: 'gmn-wishlist',
    }
  )
);
