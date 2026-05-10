import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { orderAPI } from '../services/api';
import { generateInvoice } from '../utils/generateInvoice';
import {
  ShoppingBagIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon as XCircleSolid,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/solid';

// ── Timeline step config ──────────────────────────────────────────────────────
const STEPS = [
  { key: 'PLACED',    label: 'Order Placed',  icon: ClockIcon,        color: 'text-blue-600',  bg: 'bg-blue-100',  ring: 'ring-blue-400'  },
  { key: 'SHIPPED',   label: 'Shipped',        icon: TruckIcon,        color: 'text-yellow-600', bg: 'bg-yellow-100', ring: 'ring-yellow-400' },
  { key: 'DELIVERED', label: 'Delivered',      icon: CheckCircleIcon,  color: 'text-green-600', bg: 'bg-green-100', ring: 'ring-green-400'  },
];

const CANCELLED_STEP = {
  key: 'CANCELLED', label: 'Cancelled', icon: XCircleSolid, color: 'text-red-600', bg: 'bg-red-100', ring: 'ring-red-400',
};

const STATUS_ORDER = ['PLACED', 'SHIPPED', 'DELIVERED'];

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Order Timeline Component ──────────────────────────────────────────────────
const OrderTimeline = ({ order }) => {
  const isCancelled = order.status === 'CANCELLED';
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  const dateFor = (key) => {
    switch (key) {
      case 'PLACED':    return order.orderDate;
      case 'SHIPPED':   return order.shippedDate;
      case 'DELIVERED': return order.deliveredDate;
      default:          return null;
    }
  };

  if (isCancelled) {
    return (
      <div className="flex items-center gap-4 py-4 px-2">
        {/* Placed (completed) */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-blue-400">
            <ClockIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-xs font-medium text-blue-600 mt-1">Placed</p>
          {order.orderDate && <p className="text-xs text-gray-400 mt-0.5 text-center max-w-[80px]">{formatDate(order.orderDate)}</p>}
        </div>
        <div className="flex-1 h-0.5 bg-red-200" />
        {/* Cancelled */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center ring-2 ring-red-400">
            <XCircleSolid className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs font-medium text-red-600 mt-1">Cancelled</p>
          {order.cancelledDate && <p className="text-xs text-gray-400 mt-0.5 text-center max-w-[80px]">{formatDate(order.cancelledDate)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-0 py-4 px-2 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const isCompleted = currentIdx >= idx;
        const isActive    = currentIdx === idx;
        const date        = dateFor(step.key);

        return (
          <React.Fragment key={step.key}>
            {/* Step */}
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isCompleted
                  ? `${step.bg} ring-2 ${step.ring}`
                  : 'bg-gray-100 ring-2 ring-gray-200'
              } ${isActive ? 'scale-110 shadow-md' : ''}`}>
                <step.icon className={`h-5 w-5 ${isCompleted ? step.color : 'text-gray-400'}`} />
              </div>
              <p className={`text-xs font-medium mt-1.5 text-center ${isCompleted ? step.color : 'text-gray-400'}`}>
                {step.label}
              </p>
              {date && isCompleted ? (
                <p className="text-xs text-gray-400 mt-0.5 text-center max-w-[80px] leading-tight">
                  {formatDate(date)}
                </p>
              ) : !isCompleted ? (
                <p className="text-xs text-gray-300 mt-0.5">Pending</p>
              ) : null}
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 mx-1 transition-all ${
                currentIdx > idx ? step.bg.replace('bg-', 'bg-').replace('100', '400') : 'bg-gray-200'
              }`} style={{ minWidth: 24 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main OrdersPage ───────────────────────────────────────────────────────────
const OrdersPage = () => {
  useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      setOrders(response.data || []);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await orderAPI.cancelOrder(orderId);
      addToast('Order cancelled successfully', 'success');
      fetchOrders();
    } catch (error) {
      addToast(error.response?.data || 'Failed to cancel order', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRequestRefund = async (orderId) => {
    const reason = window.prompt('Please describe your reason for the refund:');
    if (!reason || !reason.trim()) return;
    setRefundingId(orderId);
    try {
      await orderAPI.requestRefund(orderId, reason.trim());
      addToast('Refund request submitted successfully', 'success');
      fetchOrders();
    } catch (error) {
      addToast(error.response?.data || 'Failed to request refund', 'error');
    } finally {
      setRefundingId(null);
    }
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const isCancelled = order.status === 'CANCELLED';
              const isDelivered = order.status === 'DELIVERED';

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

                  {/* ── Header ── */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">#{order.id?.slice(-10).toUpperCase()}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Payment badge */}
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                      </span>
                      {/* Payment status */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                      {/* Download Invoice */}
                      <button
                        onClick={() => generateInvoice(order)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1 rounded-full transition-colors"
                        title="Download Invoice"
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        Invoice
                      </button>
                      {/* Cancel button */}
                      {!isCancelled && !isDelivered && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                          <XCircleIcon className="h-3.5 w-3.5" />
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}

                      {/* Refund button — only for delivered orders */}
                      {isDelivered && !order.refundStatus && (
                        <button
                          onClick={() => handleRequestRefund(order.id)}
                          disabled={refundingId === order.id}
                          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                          <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                          {refundingId === order.id ? 'Requesting...' : 'Request Refund'}
                        </button>
                      )}

                      {/* Refund status badge */}
                      {order.refundStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.refundStatus === 'APPROVED' ? 'bg-green-100 text-green-700'
                          : order.refundStatus === 'REJECTED' ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.refundStatus === 'REQUESTED' ? '↩ Refund Requested'
                          : order.refundStatus === 'APPROVED' ? '✓ Refund Approved'
                          : '✗ Refund Rejected'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Timeline ── */}
                  <div className="px-4 border-t border-gray-50 bg-gray-50">
                    <OrderTimeline order={order} />
                  </div>

                  {/* ── Order summary row ── */}
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-100"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Item thumbnails */}
                      <div className="flex -space-x-2">
                        {(order.items || []).slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={item.imageUrl || 'https://via.placeholder.com/40'}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-white"
                          />
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                        {order.couponCode && (
                          <p className="text-xs text-green-600">Coupon: {order.couponCode} (-${order.discountAmount?.toFixed(2)})</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-base font-bold text-primary-600">${order.totalAmount?.toFixed(2)}</p>
                      {isExpanded
                        ? <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        : <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* ── Expanded: items + address ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Items list */}
                      <div className="px-6 py-4 space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img
                              src={item.imageUrl || 'https://via.placeholder.com/56'}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.brand}</p>
                              <p className="text-xs text-gray-600 mt-0.5">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping address */}
                      {order.shippingAddress && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Shipping to</p>
                          <p className="text-sm text-gray-700">
                            {order.shippingAddress.fullName} · {order.shippingAddress.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
