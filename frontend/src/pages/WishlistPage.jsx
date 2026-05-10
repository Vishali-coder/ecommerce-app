import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { wishlistAPI, cartAPI } from '../services/api';
import { TrashIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';

const WishlistPage = () => {
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data?.items || []);
    } catch (error) {
      addToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      addToast('Removed from wishlist', 'success');
    } catch (error) {
      addToast('Failed to remove item', 'error');
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      await cartAPI.addToCart({ productId: product.id, quantity: 1 });
      await wishlistAPI.removeFromWishlist(product.id);
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      addToast('Moved to cart!', 'success');
    } catch (error) {
      addToast('Failed to move to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist & Saved Items</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing saved yet</h3>
            <p className="text-gray-500 mb-6">Save items from your cart or wishlist to find them here.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/300x200'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-primary-600">${product.price}</span>
                      <span className={`text-xs font-medium ${
                        product.quantity === 0 ? 'text-red-600'
                        : product.quantity <= 5 ? 'text-orange-500'
                        : 'text-green-600'
                      }`}>
                        {product.quantity === 0 ? 'Out of Stock'
                        : product.quantity <= 5 ? `⚠ Only ${product.quantity} left`
                        : 'In Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.quantity === 0}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        {product.quantity === 0 ? 'Out of Stock' : 'Move to Cart'}
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="p-2 text-red-500 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/" className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
