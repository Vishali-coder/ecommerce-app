import { useState, useEffect } from 'react';

const KEY = 'recentlyViewed';
const MAX = 5;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  const addToRecentlyViewed = (product) => {
    if (!product?.id) return;
    setRecentlyViewed(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          brand: product.brand,
          averageRating: product.averageRating,
          quantity: product.quantity,
        },
        ...filtered,
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem(KEY);
    setRecentlyViewed([]);
  };

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
};
