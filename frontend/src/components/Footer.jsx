import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold mb-3">ShopHub</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your one-stop destination for quality products at unbeatable prices. Shop with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white font-semibold mb-3">Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-gray-400">Free shipping over $50</span></li>
            <li><span className="text-gray-400">30-day return policy</span></li>
            <li><span className="text-gray-400">Secure payments</span></li>
            <li><span className="text-gray-400">24/7 support</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ShopHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
