import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { cartAPI, orderAPI, couponAPI, authAPI, wishlistAPI } from '../services/api';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TagIcon, MapPinIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CartPage = () => {
  const navigate = useNavigate();
  useAuth();
  const { addToast } = useToast();
  const { refreshCartCount } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Address
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India'
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Wallet
  const [walletBalance, setWalletBalance]     = useState(0);
  const [useWallet, setUseWallet]             = useState(false);
  const [walletCreditsToUse, setWalletCreditsToUse] = useState(0);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    fetchWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await authAPI.getWalletBalance();
      setWalletBalance(res.data.balance || 0);
    } catch { /* silently fail */ }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data || []);
    } catch {
      addToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await authAPI.getAddresses();
      setAddresses(res.data || []);
      if (res.data && res.data.length > 0) setSelectedAddress(0);
    } catch {
      // silently fail
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      refreshCartCount();
      addToast('Item removed from cart', 'success');
    } catch { addToast('Failed to remove item', 'error'); }
  };

  const handleSaveForLater = async (item) => {
    try {
      await wishlistAPI.addToWishlist(item.productId);
      await cartAPI.removeFromCart(item.productId);
      setCartItems(prev => prev.filter(i => i.productId !== item.productId));
      refreshCartCount();
      addToast(`"${item.name}" saved to wishlist`, 'success');
    } catch (error) {
      const msg = error.response?.data || 'Failed to save for later';
      addToast(typeof msg === 'string' ? msg : 'Failed to save for later', 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear your cart?')) return;
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      refreshCartCount();
      addToast('Cart cleared', 'success');
    } catch { addToast('Failed to clear cart', 'error'); }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) { handleRemoveItem(item.productId); return; }
    setCartItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: newQty } : i));
    try {
      if (delta > 0) {
        await cartAPI.addToCart({ productId: item.productId, quantity: 1 });
      } else {
        await cartAPI.removeFromCart(item.productId);
        if (newQty > 0) await cartAPI.addToCart({ productId: item.productId, quantity: newQty });
      }
    } catch (error) {
      fetchCart(); // revert optimistic update
      const msg = error.response?.data || 'Failed to update quantity';
      addToast(typeof msg === 'string' ? msg : 'Failed to update quantity', 'error');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validateCoupon(couponCode.trim(), subtotal);
      if (res.data.valid) {
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: res.data.discount });
        addToast(`Coupon applied! You save $${res.data.discount.toFixed(2)}`, 'success');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon code';
      addToast(msg, 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.addAddress(newAddress);
      setAddresses(res.data);
      setSelectedAddress(res.data.length - 1);
      setShowAddressForm(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India' });
      addToast('Address saved', 'success');
    } catch { addToast('Failed to save address', 'error'); }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { addToast('Your cart is empty', 'warning'); return; }
    if (!window.confirm('Place this order?')) return;

    setPlacingOrder(true);
    try {
      await orderAPI.placeOrder({
        couponCode: appliedCoupon?.code || null,
        shippingAddress: selectedAddress !== null ? addresses[selectedAddress] : null,
        paymentMethod: paymentMethod,
        walletCreditsUsed: useWallet ? walletCreditsToUse : 0,
      });
      addToast('Order placed successfully!', 'success');
      setCartItems([]);
      refreshCartCount();
      navigate('/orders');
    } catch (error) {
      const msg = error.response?.data || 'Failed to place order';
      addToast(typeof msg === 'string' ? msg : 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal   = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount   = appliedCoupon?.discount || 0;
  const walletDeduction = useWallet ? Math.min(walletCreditsToUse, Math.max(0, subtotal - discount)) : 0;
  const grandTotal = Math.max(0, subtotal - discount - walletDeduction);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button onClick={handleClearCart} className="text-red-600 hover:text-red-700 font-medium text-sm">
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.brand}</p>
                    <p className="text-primary-600 font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(item, -1)} className="p-1 rounded-md border border-gray-300 hover:bg-gray-100">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={item.quantity >= (item.stockQuantity || 99)}
                      className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={item.quantity >= (item.stockQuantity || 99) ? 'Max stock reached' : ''}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Save for later"
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                </div>

                {addresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {addresses.map((addr, idx) => (
                      <label key={idx} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === idx ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === idx}
                          onChange={() => setSelectedAddress(idx)}
                          className="mt-1"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{addr.fullName} · {addr.phone}</p>
                          <p className="text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-gray-500">{addr.country}</p>
                        </div>
                        {selectedAddress === idx && <CheckCircleIcon className="h-5 w-5 text-primary-600 ml-auto flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add new address
                </button>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'fullName', label: 'Full Name', col: 2 },
                      { key: 'phone', label: 'Phone', col: 1 },
                      { key: 'street', label: 'Street Address', col: 2 },
                      { key: 'city', label: 'City', col: 1 },
                      { key: 'state', label: 'State', col: 1 },
                      { key: 'zipCode', label: 'ZIP Code', col: 1 },
                      { key: 'country', label: 'Country', col: 1 },
                    ].map(({ key, label, col }) => (
                      <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type="text"
                          required
                          value={newAddress[key]}
                          onChange={(e) => setNewAddress(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                        Save Address
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-primary-600"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      </div>
                    </div>
                    {paymentMethod === 'COD' && (
                      <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">Selected</span>
                    )}
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed opacity-50">
                    <input type="radio" name="payment" value="ONLINE" disabled className="accent-primary-600" />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-medium text-gray-900">Online Payment</p>
                        <p className="text-sm text-gray-500">Coming soon — UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                {/* Coupon */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Coupon Code</span>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <span className="text-sm font-medium text-green-700">{appliedCoupon.code} applied!</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-3 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900 disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Wallet */}
                {walletBalance > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💜</span>
                        <div>
                          <p className="text-sm font-medium text-purple-800">Wallet Credits</p>
                          <p className="text-xs text-purple-600">Balance: ${walletBalance.toFixed(2)}</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={e => {
                            setUseWallet(e.target.checked);
                            if (e.target.checked) setWalletCreditsToUse(Math.min(walletBalance, subtotal - discount));
                            else setWalletCreditsToUse(0);
                          }}
                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs font-medium text-purple-700">Use</span>
                      </label>
                    </div>
                    {useWallet && (
                      <div>
                        <input
                          type="range"
                          min="0"
                          max={Math.min(walletBalance, Math.max(0, subtotal - discount))}
                          step="0.01"
                          value={walletCreditsToUse}
                          onChange={e => setWalletCreditsToUse(parseFloat(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-purple-600 mt-1">
                          <span>$0</span>
                          <span className="font-semibold">Using: ${walletCreditsToUse.toFixed(2)}</span>
                          <span>${Math.min(walletBalance, subtotal - discount).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  {walletDeduction > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Wallet Credits</span>
                      <span>-${walletDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary-600">${grandTotal.toFixed(2)}</span>
                  </div>
                  {grandTotal > 0 && (
                    <p className="text-xs text-purple-600 text-right">
                      🎁 You'll earn ${(grandTotal * 0.05).toFixed(2)} credits on this order
                    </p>
                  )}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full mt-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors disabled:opacity-50"
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
                <Link to="/" className="block w-full mt-3 py-3 text-center border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
