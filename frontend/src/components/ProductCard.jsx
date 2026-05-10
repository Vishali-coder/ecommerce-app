import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { cartAPI, wishlistAPI } from '../services/api';
import { ShoppingCartIcon, HeartIcon, EyeIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product, onWishlistChange }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(product.isInWishlist || false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart({ productId: product.id, quantity: 1 });
      refreshCartCount();
      setAddedToCart(true);
      addToast(`${product.name} added to cart!`, 'success');
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      addToast('Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleGoToCart = (e) => {
    e.preventDefault();
    navigate('/cart');
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to manage wishlist', 'warning');
      navigate('/login');
      return;
    }
    setIsTogglingWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(product.id);
        setIsInWishlist(false);
        addToast('Removed from wishlist', 'success');
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsInWishlist(true);
        addToast('Added to wishlist!', 'success');
      }
      if (onWishlistChange) onWishlistChange();
    } catch {
      addToast('Failed to update wishlist', 'error');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link to={`/product/${product.id}`} className="relative block">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
        >
          {isInWishlist
            ? <HeartSolidIcon className="h-5 w-5 text-red-500" />
            : <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
          }
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-primary-600">${product.price}</span>
          <div className="flex items-center gap-2">
            <Link to={`/product/${product.id}`} className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <EyeIcon className="h-5 w-5" />
            </Link>
            {addedToCart ? (
              <button
                onClick={handleGoToCart}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.quantity === 0}
                className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {isAddingToCart ? '...' : 'Add'}
              </button>
            )}
          </div>
        </div>

        {product.quantity !== undefined && (
          <p className={`text-xs mt-2 font-medium ${
            product.quantity === 0
              ? 'text-red-600'
              : product.quantity <= 5
              ? 'text-orange-500'
              : 'text-green-600'
          }`}>
            {product.quantity === 0
              ? 'Out of stock'
              : product.quantity <= 5
              ? `⚠ Only ${product.quantity} left!`
              : `${product.quantity} in stock`}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
