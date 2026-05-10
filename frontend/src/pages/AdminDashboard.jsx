 
import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, orderAPI, couponAPI, authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import {
  PlusIcon, TrashIcon, ChartBarIcon, ShoppingBagIcon, CubeIcon,
  PencilIcon, TagIcon, CheckIcon, XMarkIcon, UsersIcon,
  Bars3Icon, XCircleIcon, MagnifyingGlassIcon, EyeIcon,
  ArrowTrendingUpIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  PLACED:    'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-yellow-100 text-yellow-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const Badge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, color = '#6366f1', height = 160 }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm text-center py-8">No data yet</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = 100 / data.length;
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ minWidth: 300 }} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 30);
          const x = i * barW + barW * 0.1;
          const w = barW * 0.8;
          const y = height - 20 - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={Math.max(barH, 0.5)} fill={color} rx="1" opacity="0.85" />
              <text x={x + w / 2} y={height - 5} textAnchor="middle" fontSize="3.5" fill="#6b7280">
                {d.label.slice(5)}
              </text>
              {d.value > 0 && (
                <text x={x + w / 2} y={Math.max(y - 2, 4)} textAnchor="middle" fontSize="3.5" fill="#374151">
                  ${d.value.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
const DonutChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-gray-400 text-sm text-center">No data</p>;
  const colors = ['#6366f1', '#22c55e', '#3b82f6', '#ef4444'];
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const r = 40, cx = 50, cy = 50;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i % colors.length] };
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#374151">{total}</text>
      </svg>
      <div className="space-y-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }}></span>
            <span className="text-gray-700">{s.label}</span>
            <span className="text-gray-500 ml-auto pl-4">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, sub }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const EMPTY_PRODUCT = { name: '', description: '', price: '', brand: '', category: '', quantity: '', imageUrl: '', images: '' };
const EMPTY_COUPON  = { code: '', type: 'PERCENT', value: '', minOrderAmount: '0', active: true };


const AdminDashboard = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts]       = useState([]);
  const [orders, setOrders]           = useState([]);
  const [coupons, setCoupons]         = useState([]);
  const [users, setUsers]             = useState([]);
  const [analytics, setAnalytics]     = useState(null);
  const [loading, setLoading]         = useState(false);

  // Notifications
  const [notifications, setNotifications]       = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrderCount, setLastOrderCount]       = useState(null);

  // Search / filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch]     = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [productForm, setProductForm]         = useState(EMPTY_PRODUCT);

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm]         = useState(EMPTY_COUPON);

  // Order detail
  const [viewingOrder, setViewingOrder] = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try { setLoading(true); const r = await productAPI.getAllProducts(); setProducts(r.data || []); }
    catch { addToast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = useCallback(async () => {
    try { setLoading(true); const r = await orderAPI.getAllOrders(); setOrders(r.data || []); }
    catch { addToast('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCoupons = useCallback(async () => {
    try { const r = await couponAPI.getAllCoupons(); setCoupons(r.data || []); }
    catch { addToast('Failed to load coupons', 'error'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const r = await orderAPI.getAnalytics(); setAnalytics(r.data); }
    catch { /* silently fail */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = useCallback(async () => {
    try { setLoading(true); const r = await authAPI.getAllUsers(); setUsers(r.data || []); }
    catch { addToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts(); fetchOrders(); fetchCoupons(); fetchAnalytics();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'products')  fetchProducts();
    else if (activeTab === 'orders')    fetchOrders();
    else if (activeTab === 'coupons')   fetchCoupons();
    else if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'users')     fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Notification polling ───────────────────────────────────────────────────
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const res = await orderAPI.getAllOrders();
        const allOrders = res.data || [];
        const count = allOrders.length;

        if (lastOrderCount === null) {
          // First load — just set baseline, no notification
          setLastOrderCount(count);
          return;
        }

        if (count > lastOrderCount) {
          const newOrders = allOrders.slice(0, count - lastOrderCount);
          const newNotifs = newOrders.map(o => ({
            id: o.id,
            message: `New order from ${o.userEmail}`,
            amount: `$${o.totalAmount?.toFixed(2)}`,
            time: new Date().toLocaleTimeString(),
            read: false,
          }));
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20));
          setLastOrderCount(count);
        }
      } catch { /* silently fail */ }
    };

    checkNewOrders();
    const interval = setInterval(checkNewOrders, 30000); // poll every 30s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOrderCount]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // ── Product handlers ───────────────────────────────────────────────────────
  const [selectedProducts, setSelectedProducts] = useState([]);

  const openAddProduct = () => { setEditingProduct(null); setProductForm(EMPTY_PRODUCT); setShowProductForm(true); };
  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '', description: p.description || '', price: p.price || '',
      brand: p.brand || '', category: p.category || '', quantity: p.quantity || '',
      imageUrl: p.imageUrl || '', images: (p.images || []).join(', '),
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      quantity: parseInt(productForm.quantity),
      images: productForm.images ? productForm.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, payload);
        addToast('Product updated!', 'success');
      } else {
        await productAPI.createProduct(payload);
        addToast('Product created!', 'success');
      }
      setShowProductForm(false);
      setProductForm(EMPTY_PRODUCT);
      fetchProducts();
    } catch { addToast('Failed to save product', 'error'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.deleteProduct(id); addToast('Product deleted', 'success'); fetchProducts(); }
    catch { addToast('Failed to delete product', 'error'); }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected product(s)? This cannot be undone.`)) return;
    try {
      await productAPI.bulkDeleteProducts(selectedProducts);
      addToast(`${selectedProducts.length} products deleted`, 'success');
      setSelectedProducts([]);
      fetchProducts();
    } catch { addToast('Failed to delete products', 'error'); }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // ── Order handlers ─────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      addToast('Order status updated', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { addToast('Failed to update order status', 'error'); }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      await orderAPI.updatePaymentStatus(orderId, 'PAID');
      addToast('Payment marked as paid', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'PAID' } : o));
    } catch { addToast('Failed to update payment status', 'error'); }
  };

  const handleProcessRefund = async (orderId, action) => {
    try {
      await orderAPI.processRefund(orderId, action);
      addToast(`Refund ${action.toLowerCase()}`, 'success');
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, refundStatus: action } : o
      ));
    } catch { addToast('Failed to process refund', 'error'); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await orderAPI.deleteOrder(orderId);
      addToast('Order deleted', 'success');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch { addToast('Failed to delete order', 'error'); }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) { addToast('No orders to export', 'warning'); return; }

    const headers = ['Order ID', 'Customer Email', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Order Date', 'Shipped Date', 'Delivered Date'];

    const rows = filteredOrders.map(o => [
      o.id,
      o.userEmail,
      (o.items || []).map(i => `${i.name} x${i.quantity}`).join(' | '),
      ((o.totalAmount || 0) + (o.discountAmount || 0)).toFixed(2),
      (o.discountAmount || 0).toFixed(2),
      (o.totalAmount || 0).toFixed(2),
      o.paymentMethod || 'COD',
      o.paymentStatus || 'PENDING',
      o.status || 'PLACED',
      o.orderDate ? new Date(o.orderDate).toLocaleString() : '',
      o.shippedDate ? new Date(o.shippedDate).toLocaleString() : '',
      o.deliveredDate ? new Date(o.deliveredDate).toLocaleString() : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${filteredOrders.length} orders to CSV`, 'success');
  };

  // ── Coupon handlers ────────────────────────────────────────────────────────
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await couponAPI.createCoupon({
        ...couponForm,
        value: parseFloat(couponForm.value),
        minOrderAmount: parseFloat(couponForm.minOrderAmount),
      });
      addToast('Coupon created!', 'success');
      setShowCouponForm(false);
      setCouponForm(EMPTY_COUPON);
      fetchCoupons();
    } catch { addToast('Failed to create coupon', 'error'); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await couponAPI.deleteCoupon(id); addToast('Coupon deleted', 'success'); fetchCoupons(); }
    catch { addToast('Failed to delete coupon', 'error'); }
  };

  // ── User handlers ──────────────────────────────────────────────────────────
  const [userOrdersModal, setUserOrdersModal] = useState(null); // { user, orders }
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  const handleViewUserOrders = async (user) => {
    setUserOrdersLoading(true);
    setUserOrdersModal({ user, orders: [] });
    try {
      const res = await orderAPI.getOrdersByUser(user.email);
      setUserOrdersModal({ user, orders: res.data || [] });
    } catch {
      addToast('Failed to load user orders', 'error');
      setUserOrdersModal(null);
    } finally {
      setUserOrdersLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    try {
      await authAPI.deleteUser(id);
      addToast('User deleted successfully', 'success');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      addToast(error.response?.data || 'Failed to delete user', 'error');
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const lowStockProducts = products.filter(p => p.quantity <= 5);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearch ||
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // ── Nav items ──────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'overview',   label: 'Overview',   icon: ChartBarIcon },
    { id: 'analytics',  label: 'Analytics',  icon: ArrowTrendingUpIcon },
    { id: 'products',   label: 'Products',   icon: CubeIcon,         badge: lowStockProducts.length > 0 ? lowStockProducts.length : null },
    { id: 'orders',     label: 'Orders',     icon: ShoppingBagIcon },
    { id: 'coupons',    label: 'Coupons',    icon: TagIcon },
    { id: 'users',      label: 'Users',      icon: UsersIcon },
  ];

  const navigate = (tab) => { setActiveTab(tab); setSidebarOpen(false); };


  // ── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }) => (
    <nav className={mobile
      ? 'flex flex-col h-full'
      : 'hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen fixed top-0 left-0 pt-16 z-10'
    }>
      <div className="px-4 py-6 flex-1">
        {!mobile && (
          <div className="mb-8 px-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</h2>
          </div>
        )}
        <ul className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <li key={id}>
              <button
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white h-full shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      <p>No notifications yet</p>
                      <p className="text-xs mt-1">New orders will appear here</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ShoppingBagIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium truncate">{n.message}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-xs font-semibold text-primary-600">{n.amount}</span>
                              <span className="text-xs text-gray-400">{n.time}</span>
                            </div>
                          </div>
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => { navigate('orders'); setShowNotifications(false); }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all orders →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">


          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard label="Total Products"  value={products.length}                      icon={CubeIcon}           iconBg="bg-blue-50"   iconColor="text-blue-600"   sub={`${lowStockProducts.length} low stock`} />
                <StatCard label="Total Orders"    value={orders.length}                        icon={ShoppingBagIcon}    iconBg="bg-green-50"  iconColor="text-green-600" sub={`${orders.filter(o => o.status === 'PLACED').length} pending`} />
                <StatCard label="Total Revenue"   value={`$${totalRevenue.toFixed(2)}`}        icon={CurrencyDollarIcon} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
                <StatCard label="Active Coupons"  value={coupons.filter(c => c.active).length} icon={TagIcon}            iconBg="bg-purple-50" iconColor="text-purple-600" sub={`${coupons.length} total`} />
              </div>

              {/* Low stock warning */}
              {lowStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">⚠ Low Stock Alert ({lowStockProducts.length} products)</h3>
                  <div className="flex flex-wrap gap-2">
                    {lowStockProducts.map(p => (
                      <span key={p.id} className="bg-white border border-red-200 text-red-600 text-xs px-2 py-1 rounded-md">
                        {p.name} — {p.quantity} left
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-600 hover:text-primary-700">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Customer', 'Total', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-700">{o.userEmail}</td>
                          <td className="px-6 py-3 text-sm font-semibold text-gray-900">${o.totalAmount?.toFixed(2)}</td>
                          <td className="px-6 py-3"><Badge status={o.status || 'PLACED'} /></td>
                          <td className="px-6 py-3 text-xs text-gray-500">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {!analytics ? (
                <div className="text-center py-16 text-gray-400">Loading analytics…</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-primary-600">${analytics.totalRevenue?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue — Last 7 Days</h3>
                    <BarChart
                      data={Object.entries(analytics.revenueByDay || {}).map(([label, value]) => ({ label, value }))}
                      color="#6366f1"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
                      <DonutChart
                        data={Object.entries(analytics.statusBreakdown || {}).map(([label, value]) => ({ label, value }))}
                      />
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
                      {!analytics.topProducts?.length ? (
                        <p className="text-gray-400 text-sm">No data yet</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.topProducts.map((p, i) => {
                            const maxRev = analytics.topProducts[0]?.revenue || 1;
                            const pct = (p.revenue / maxRev) * 100;
                            return (
                              <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700 truncate max-w-[70%]">{p.name}</span>
                                  <span className="font-semibold text-primary-600">${p.revenue.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}


          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {selectedProducts.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium whitespace-nowrap"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete ({selectedProducts.length})
                  </button>
                )}
                <button onClick={openAddProduct} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium whitespace-nowrap">
                  <PlusIcon className="h-4 w-4" /> Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <Modal title={editingProduct ? 'Edit Product' : 'Add New Product'} onClose={() => { setShowProductForm(false); setProductForm(EMPTY_PRODUCT); }}>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'name',     label: 'Name',     type: 'text',   colSpan: 2 },
                        { key: 'brand',    label: 'Brand',    type: 'text' },
                        { key: 'category', label: 'Category', type: 'text',   required: false },
                        { key: 'price',    label: 'Price ($)', type: 'number', step: '0.01' },
                        { key: 'quantity', label: 'Stock Qty', type: 'number' },
                      ].map(({ key, label, type, step, required = true, colSpan }) => (
                        <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type={type} step={step} required={required}
                            value={productForm[key]}
                            onChange={e => setProductForm(p => ({ ...p, [key]: e.target.value }))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image URL</label>
                      <input type="url" value={productForm.imageUrl}
                        onChange={e => setProductForm(p => ({ ...p, imageUrl: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images (comma-separated URLs)</label>
                      <input type="text" value={productForm.images}
                        onChange={e => setProductForm(p => ({ ...p, images: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea required rows={3} value={productForm.description}
                        onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowProductForm(false); setProductForm(EMPTY_PRODUCT); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </Modal>
              )}

              {loading ? (
                <div className="text-center py-16 text-gray-400">Loading…</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  {productSearch ? 'No products match your search' : 'No products found'}
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </th>
                          {['Product', 'Brand', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selectedProducts.includes(p.id) ? 'bg-primary-50' : ''}`}>
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(p.id)}
                                onChange={() => toggleSelectProduct(p.id)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.imageUrl || 'https://placehold.co/40x40?text=?'}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                                  onError={e => { e.target.src = 'https://placehold.co/40x40?text=?'; }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                  <p className="text-xs text-gray-400 line-clamp-1 max-w-[180px]">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{p.brand}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{p.category || '—'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-primary-600">${p.price}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`font-medium ${p.quantity === 0 ? 'text-red-600' : p.quantity <= 5 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                {p.quantity}
                              </span>
                              {p.quantity <= 5 && p.quantity > 0 && <span className="ml-1 text-xs text-yellow-500">low</span>}
                              {p.quantity === 0 && <span className="ml-1 text-xs text-red-500">out</span>}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {p.averageRating > 0 ? `⭐ ${p.averageRating} (${p.reviewCount})` : '—'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditProduct(p)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div>
              {/* Order detail modal */}
              {viewingOrder && (
                <Modal title={`Order Details — #${viewingOrder.id?.slice(-8)}`} onClose={() => setViewingOrder(null)} maxWidth="max-w-2xl">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Customer:</span> <span className="font-medium text-gray-900 ml-1">{viewingOrder.userEmail}</span></div>
                      <div><span className="text-gray-500">Status:</span> <span className="ml-1"><Badge status={viewingOrder.status || 'PLACED'} /></span></div>
                      <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900 ml-1">{viewingOrder.orderDate ? new Date(viewingOrder.orderDate).toLocaleString() : 'N/A'}</span></div>
                      <div><span className="text-gray-500">Total:</span> <span className="font-semibold text-primary-600 ml-1">${viewingOrder.totalAmount?.toFixed(2)}</span></div>
                      {viewingOrder.discountAmount > 0 && (
                        <div><span className="text-gray-500">Discount:</span> <span className="font-medium text-green-600 ml-1">-${viewingOrder.discountAmount?.toFixed(2)}</span></div>
                      )}
                      {viewingOrder.couponCode && (
                        <div><span className="text-gray-500">Coupon:</span> <span className="font-mono text-gray-900 ml-1">{viewingOrder.couponCode}</span></div>
                      )}
                    </div>

                    {viewingOrder.shippingAddress && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">Shipping Address</p>
                        <p className="text-gray-600">
                          {[viewingOrder.shippingAddress.street, viewingOrder.shippingAddress.city,
                            viewingOrder.shippingAddress.state, viewingOrder.shippingAddress.zipCode,
                            viewingOrder.shippingAddress.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-gray-700 mb-2 text-sm">Items ({viewingOrder.items?.length || 0})</p>
                      <div className="space-y-2">
                        {(viewingOrder.items || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <img
                              src={item.imageUrl || 'https://placehold.co/40x40?text=?'}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                              onError={e => { e.target.src = 'https://placehold.co/40x40?text=?'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Modal>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email or order ID…"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['ALL', 'PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                    <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                  ))}
                </select>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap"
                >
                  ⬇ Export CSV
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-gray-400">Loading…</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No orders found</div>
              ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Refund', 'Status', 'Date', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-xs font-mono text-gray-400 max-w-[80px] truncate" title={order.id}>
                              #{order.id?.slice(-8)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">{order.userEmail}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                            <td className="px-4 py-4 text-sm text-green-600">
                              {order.discountAmount > 0 ? `-$${order.discountAmount?.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-4">
                              {order.paymentStatus === 'PAID' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  ✓ Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkAsPaid(order.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                                >
                                  💵 Mark Paid
                                </button>
                              )}
                            </td>
                            {/* Refund column */}
                            <td className="px-4 py-4">
                              {!order.refundStatus ? (
                                <span className="text-xs text-gray-400">—</span>
                              ) : order.refundStatus === 'REQUESTED' ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-orange-600 font-medium mb-1">↩ Requested</span>
                                  {order.refundReason && (
                                    <span className="text-xs text-gray-500 italic max-w-[120px] truncate" title={order.refundReason}>
                                      "{order.refundReason}"
                                    </span>
                                  )}
                                  <div className="flex gap-1 mt-1">
                                    <button
                                      onClick={() => handleProcessRefund(order.id, 'APPROVED')}
                                      className="px-2 py-0.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() => handleProcessRefund(order.id, 'REJECTED')}
                                      className="px-2 py-0.5 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors"
                                    >
                                      ✗ Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  order.refundStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {order.refundStatus === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                                </span>
                              )}
                            </td>                            <td className="px-4 py-4">
                              <select
                                value={order.status || 'PLACED'}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                              >
                                {['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-500">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => setViewingOrder(order)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── COUPONS ── */}
          {activeTab === 'coupons' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
                <button onClick={() => setShowCouponForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                  <PlusIcon className="h-4 w-4" /> Add Coupon
                </button>
              </div>

              {showCouponForm && (
                <Modal title="Create Coupon" onClose={() => { setShowCouponForm(false); setCouponForm(EMPTY_COUPON); }} maxWidth="max-w-md">
                  <form onSubmit={handleCouponSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                      <input type="text" required value={couponForm.code}
                        onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SAVE10"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                      <select value={couponForm.type} onChange={e => setCouponForm(p => ({ ...p, type: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="PERCENT">Percentage (%)</option>
                        <option value="FLAT">Flat Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {couponForm.type === 'PERCENT' ? 'Discount %' : 'Discount Amount ($)'}
                      </label>
                      <input type="number" required min="1" step="0.01" value={couponForm.value}
                        onChange={e => setCouponForm(p => ({ ...p, value: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount ($)</label>
                      <input type="number" min="0" step="0.01" value={couponForm.minOrderAmount}
                        onChange={e => setCouponForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="coupon-active" checked={couponForm.active}
                        onChange={e => setCouponForm(p => ({ ...p, active: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="coupon-active" className="text-sm text-gray-700">Active</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowCouponForm(false); setCouponForm(EMPTY_COUPON); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">Create</button>
                    </div>
                  </form>
                </Modal>
              )}

              {coupons.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No coupons yet. Create one to offer discounts.</div>
              ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Code', 'Type', 'Value', 'Min Order', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-gray-900 text-sm">{c.code}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{c.type}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                              {c.type === 'PERCENT' ? `${c.value}%` : `$${c.value}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">${c.minOrderAmount}</td>
                            <td className="px-6 py-4">
                              {c.active
                                ? <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckIcon className="h-4 w-4" />Active</span>
                                : <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><XCircleIcon className="h-4 w-4" />Inactive</span>}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div>
              {/* User Orders Modal */}
              {userOrdersModal && (
                <Modal
                  title={`Orders — ${userOrdersModal.user.email}`}
                  onClose={() => setUserOrdersModal(null)}
                  maxWidth="max-w-3xl"
                >
                  {userOrdersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  ) : userOrdersModal.orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ShoppingBagIcon className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                      <p>No orders found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">{userOrdersModal.orders.length} order(s) total</p>
                      {userOrdersModal.orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Order header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div>
                              <p className="text-xs font-mono text-gray-400">#{order.id?.slice(-10).toUpperCase()}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                              </span>
                              <Badge status={order.status || 'PLACED'} />
                              <span className="text-sm font-bold text-primary-600">${order.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                          {/* Items */}
                          <div className="px-4 py-3 space-y-2">
                            {(order.items || []).map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl || 'https://placehold.co/36x36?text=?'}
                                  alt={item.name}
                                  className="w-9 h-9 rounded object-cover border border-gray-100 flex-shrink-0"
                                  onError={e => { e.target.src = 'https://placehold.co/36x36?text=?'; }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700 flex-shrink-0">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Modal>
              )}

              <div className="mb-6">
                <p className="text-sm text-gray-500">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
              </div>

              {loading ? (
                <div className="text-center py-16 text-gray-400">Loading…</div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No users found</div>
              ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Name', 'Email', 'Role', 'Addresses', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary-700 text-sm font-semibold">
                                    {(u.name || u.email || '?')[0].toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{u.name || '—'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {u.role || 'USER'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {u.addresses?.length > 0 ? `${u.addresses.length} address${u.addresses.length > 1 ? 'es' : ''}` : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewUserOrders(u)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <ShoppingBagIcon className="h-3.5 w-3.5" />
                                  Orders
                                </button>
                                {u.role !== 'ADMIN' ? (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Protected</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
