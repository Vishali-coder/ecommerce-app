import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import {
  MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon,
  ChevronLeftIcon, ChevronRightIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc',label: 'Top Rated' },
  { value: 'name-asc',   label: 'Name: A–Z' },
];

const PAGE_SIZE = 12;

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState(null);

  // Filters
  const [searchTerm, setSearchTerm]         = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand]   = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy]                 = useState('default');
  const [priceRange, setPriceRange]         = useState({ min: '', max: '' });
  const [showFilters, setShowFilters]       = useState(false);

  // Pagination
  const [currentPage, setCurrentPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalItems, setTotalItems]     = useState(0);

  // Filter options
  const [brands, setBrands]         = useState([]);
  const [categories, setCategories] = useState([]);

  // Sync search from URL
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) { setSearchTerm(q); setCurrentPage(0); }
  }, [searchParams]);

  // Fetch filter options once
  useEffect(() => {
    productAPI.getAllProducts()
      .then(r => {
        const data = r.data || [];
        setBrands([...new Set(data.map(p => p.brand).filter(Boolean))]);
      })
      .catch(() => {});
    productAPI.getCategories()
      .then(r => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  // Fetch paged products whenever filters or page change
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params = {
        page:     currentPage,
        size:     PAGE_SIZE,
        search:   searchTerm,
        brand:    selectedBrand,
        category: selectedCategory,
        minPrice: priceRange.min || 0,
        maxPrice: priceRange.max || 999999,
        sortBy,
      };
      const res = await productAPI.getProductsPaged(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      setApiError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedBrand, selectedCategory, priceRange, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(0); // reset to page 1 on filter change
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('default');
    setCurrentPage(0);
  };

  const hasActiveFilters = selectedBrand || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'default' || searchTerm;

  // ── Pagination controls ───────────────────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left  = Math.max(0, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    for (let i = left; i <= right; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1 mt-10">
        {/* Prev */}
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* First page */}
        {left > 0 && (
          <>
            <button onClick={() => setCurrentPage(0)} className="w-9 h-9 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">1</button>
            {left > 1 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p + 1}
          </button>
        ))}

        {/* Last page */}
        {right < totalPages - 1 && (
          <>
            {right < totalPages - 2 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => setCurrentPage(totalPages - 1)} className="w-9 h-9 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">{totalPages}</button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Welcome to ShopHub</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg">Discover amazing products at unbeatable prices.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => handleFilterChange(setSearchTerm)(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
              <select value={selectedBrand} onChange={e => handleFilterChange(setSelectedBrand)(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={selectedCategory} onChange={e => handleFilterChange(setSelectedCategory)(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceRange.min}
                  onChange={e => { setPriceRange(p => ({ ...p, min: e.target.value })); setCurrentPage(0); }}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <input type="number" placeholder="Max" value={priceRange.max}
                  onChange={e => { setPriceRange(p => ({ ...p, max: e.target.value })); setCurrentPage(0); }}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
              <select value={sortBy} onChange={e => handleFilterChange(setSortBy)(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                  <XMarkIcon className="h-4 w-4" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {apiError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm font-medium text-yellow-800">Connection Issue</p>
            <p className="text-sm text-yellow-700 mt-1">{apiError}</p>
            <button onClick={fetchProducts} className="mt-2 text-sm text-yellow-800 underline">Retry</button>
          </div>
        )}

        {/* Results header */}
        {!loading && !apiError && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory || selectedBrand || 'All Products'}
            </h2>
            <span className="text-gray-500 text-sm">
              {totalItems} product{totalItems !== 1 ? 's' : ''}
              {totalPages > 1 && ` · Page ${currentPage + 1} of ${totalPages}`}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination />
          </>
        )}
      </div>

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <div className="bg-white border-t border-gray-100 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
              </div>
              <button
                onClick={clearRecentlyViewed}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="aspect-square overflow-hidden bg-white">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/150'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{product.brand}</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-primary-600">${product.price}</span>
                      {product.averageRating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-500">
                          <StarIcon className="h-3 w-3 text-yellow-400" />
                          {product.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <p className="text-xs text-orange-500 mt-1">⚠ Only {product.quantity} left</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
