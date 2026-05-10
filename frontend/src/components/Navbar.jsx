import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCartIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">ShopHub</span>
          </Link>

          {/* Search Bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Home
            </Link>

            {user ? (
              <>
                {/* Cart with badge */}
                <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 transition-colors">
                  <HeartIcon className="h-6 w-6" />
                </Link>

                <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Orders
                </Link>

                {isAdmin() && (
                  <Link to="/admin" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Admin
                  </Link>
                )}

                {/* User menu */}
                <div className="flex items-center gap-3 border-l pl-4">
                  <Link to="/profile" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                    {(() => {
                      const av = localStorage.getItem(`avatar_${user?.id}`);
                      return av
                        ? <img src={av} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-200" />
                        : <UserCircleIcon className="h-5 w-5" />;
                    })()}
                    <span className="font-medium">{user.name?.split(' ')[0] || user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-sm px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link to="/cart" className="relative text-gray-600">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-3 pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
              </div>
            </form>

            <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Home</Link>

            {user ? (
              <>
                <Link to="/cart" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Cart {cartCount > 0 && <span className="ml-1 text-primary-600 font-bold">({cartCount})</span>}
                </Link>
                <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                {isAdmin() && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <div className="px-4 py-2 border-t border-gray-100 mt-1">
                  <p className="text-xs text-gray-500 mb-2">Signed in as {user.email}</p>
                  <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 font-medium">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
