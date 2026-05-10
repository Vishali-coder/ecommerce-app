import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { productAPI, cartAPI, wishlistAPI, reviewAPI } from '../services/api';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import {
  ShoppingCartIcon, HeartIcon, ArrowLeftIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        className={readonly ? 'cursor-default' : 'cursor-pointer'}
      >
        {star <= value
          ? <StarSolidIcon className="h-5 w-5 text-yellow-400" />
          : <StarIcon className="h-5 w-5 text-gray-300" />}
      </button>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { refreshCartCount } = useCart();

  const { addToRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
      addToRecentlyViewed(response.data); // track view
    } catch {
      addToast('Failed to load product details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getProductReviews(id);
      setReviews(res.data || []);
    } catch {
      // silently fail
    }
  };

  const fetchRelated = async () => {
    try {
      const res = await productAPI.getRelatedProducts(id);
      setRelatedProducts(res.data || []);
    } catch {
      // silently fail
    }
  };

  const getImages = () => {
    if (!product) return [];
    const imgs = product.images && product.images.length > 0
      ? product.images
      : product.imageUrl ? [product.imageUrl] : [];
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/500'];
  };

  const handleAddToCart = async () => {
    if (!user) { addToast('Please login to add items to cart', 'warning'); navigate('/login'); return; }
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart({ productId: product.id, quantity });
      refreshCartCount();
      setAddedToCart(true);
      addToast(`${quantity} × ${product.name} added to cart!`, 'success');
    } catch (error) {
      const msg = error.response?.data || 'Failed to add to cart';
      addToast(typeof msg === 'string' ? msg : 'Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { addToast('Please login to continue', 'warning'); navigate('/login'); return; }
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart({ productId: product.id, quantity });
      refreshCartCount();
      navigate('/cart');
    } catch (error) {
      const msg = error.response?.data || 'Failed to process. Please try again.';
      addToast(typeof msg === 'string' ? msg : 'Failed to process', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) { addToast('Please login to manage wishlist', 'warning'); navigate('/login'); return; }
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
    } catch { addToast('Failed to update wishlist', 'error'); }
    finally { setIsTogglingWishlist(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please login to leave a review', 'warning'); navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await reviewAPI.addReview({ productId: id, rating: reviewRating, comment: reviewComment });
      addToast('Review submitted!', 'success');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      fetchProduct(); // refresh rating
    } catch (error) {
      addToast(error.response?.data || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      addToast('Review deleted', 'success');
      fetchReviews();
      fetchProduct();
    } catch { addToast('Failed to delete review', 'error'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!product) return null;

  const images = getImages();
  const maxQty = Math.min(10, product.quantity || 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Image Gallery */}
            <div className="flex flex-col gap-3 p-4 bg-gray-50">
              <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-primary-500' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
                  {product.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <StarRating value={Math.round(product.averageRating || 0)} readonly />
                  <span className="text-sm text-gray-600">
                    {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No ratings'}
                    {product.reviewCount > 0 && ` (${product.reviewCount} review${product.reviewCount !== 1 ? 's' : ''})`}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-600">${product.price}</span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.quantity === 0
                      ? 'bg-red-100 text-red-700'
                      : product.quantity <= 5
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.quantity === 0
                      ? 'Out of stock'
                      : product.quantity <= 5
                      ? `⚠ Only ${product.quantity} left!`
                      : `${product.quantity} in stock`}
                  </span>
                </div>

                {product.quantity > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {[...Array(maxQty)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addedToCart ? () => navigate('/cart') : handleAddToCart}
                  disabled={isAddingToCart || product.quantity === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {isAddingToCart
                    ? 'Adding...'
                    : addedToCart
                    ? 'Go to Cart →'
                    : product.quantity === 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>

                {product.quantity > 0 && (
                  <button
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    ⚡ Buy Now
                  </button>
                )}
                <button
                  onClick={handleWishlistToggle}
                  disabled={isTogglingWishlist}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  {isInWishlist ? <HeartSolidIcon className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                  {isInWishlist ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-8">          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Customer Reviews
            {reviews.length > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>}
          </h2>

          {/* Write a Review */}
          {user && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Write a Review</h3>
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Rating</label>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Share your experience with this product..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{review.userName}</span>
                        <StarRating value={review.rating} readonly />
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user && (user.email === review.userEmail || user.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-4"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={p.imageUrl || (p.images && p.images[0]) || 'https://via.placeholder.com/200'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{p.brand}</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold">${p.price}</span>
                      {p.averageRating > 0 && (
                        <span className="text-xs text-gray-500">⭐ {p.averageRating.toFixed(1)}</span>
                      )}
                    </div>
                    {p.quantity === 0 && (
                      <span className="text-xs text-red-500 mt-1 block">Out of stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
