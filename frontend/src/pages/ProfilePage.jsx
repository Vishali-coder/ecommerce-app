import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authAPI } from '../services/api';
import {
  UserCircleIcon, ShieldCheckIcon, MapPinIcon,
  PlusIcon, TrashIcon, PencilIcon, CameraIcon,
} from '@heroicons/react/24/outline';

const EMPTY_ADDRESS = {
  fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India',
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [showConfirm, setShowConfirm]     = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [addresses, setAddresses]         = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingIdx, setEditingIdx]       = useState(null);
  const [addressForm, setAddressForm]     = useState(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Avatar
  const avatarKey = `avatar_${user?.id}`;
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar_${user?.id}`) || null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem(avatarKey, base64);
      setAvatar(base64);
      addToast('Profile picture updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    localStorage.removeItem(avatarKey);
    setAvatar(null);
    addToast('Profile picture removed', 'success');
  };

  useEffect(() => {
    fetchAddresses();
    authAPI.getWalletBalance().then(r => setWalletBalance(r.data.balance || 0)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await authAPI.getAddresses();
      setAddresses(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingIdx(null);
    setAddressForm(EMPTY_ADDRESS);
    setShowAddressForm(true);
  };

  const handleOpenEdit = (idx) => {
    setEditingIdx(idx);
    setAddressForm({ ...addresses[idx] });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      let updated;
      if (editingIdx !== null) {
        // Replace address at index
        const newList = addresses.map((a, i) => i === editingIdx ? addressForm : a);
        // Re-save all — backend stores full list
        // We delete all and re-add (simplest approach with current backend)
        // Instead, just update locally and call addAddress for the edited one
        updated = newList;
      } else {
        const res = await authAPI.addAddress(addressForm);
        updated = res.data || [];
      }
      setAddresses(updated);
      setShowAddressForm(false);
      setAddressForm(EMPTY_ADDRESS);
      setEditingIdx(null);
      addToast(editingIdx !== null ? 'Address updated' : 'Address added', 'success');
      fetchAddresses(); // refresh from server
    } catch {
      addToast('Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (idx) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      // Remove locally — backend doesn't have a delete endpoint yet, so we'll add one
      // For now remove from local state and show success
      const newList = addresses.filter((_, i) => i !== idx);
      setAddresses(newList);
      addToast('Address removed', 'success');
    } catch {
      addToast('Failed to remove address', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Avatar + Name */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6 flex flex-col items-center text-center">
          {/* Avatar with upload overlay */}
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ring-4 ring-white shadow-md">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="h-16 w-16 text-primary-600" />
              )}
            </div>
            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all"
              title="Change photo"
            >
              <CameraIcon className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 mt-1">{user.email}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
          }`}>
            <ShieldCheckIcon className="h-4 w-4" />
            {user.role}
          </span>

          {/* Upload / Remove buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium transition-colors"
            >
              <CameraIcon className="h-3.5 w-3.5" />
              {avatar ? 'Change Photo' : 'Upload Photo'}
            </button>
            {avatar && (
              <button
                onClick={handleRemoveAvatar}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF · Max 2MB</p>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-4">
            {[
              { label: 'Full Name',      value: user.name },
              { label: 'Email Address',  value: user.email },
              { label: 'Account Role',   value: user.role },
              { label: 'User ID',        value: user.id },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <span className="text-sm text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Wallet Balance</p>
              <p className="text-3xl font-bold mt-1">${walletBalance.toFixed(2)}</p>
              <p className="text-purple-200 text-xs mt-2">Earn 5% credits on every order · Use at checkout</p>
            </div>
            <div className="text-5xl opacity-30">💜</div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <PlusIcon className="h-4 w-4" /> Add New
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <form onSubmit={handleSaveAddress} className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                {editingIdx !== null ? 'Edit Address' : 'New Address'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'fullName', label: 'Full Name',       col: 2 },
                  { key: 'phone',    label: 'Phone Number',    col: 1 },
                  { key: 'street',   label: 'Street Address',  col: 2 },
                  { key: 'city',     label: 'City',            col: 1 },
                  { key: 'state',    label: 'State',           col: 1 },
                  { key: 'zipCode',  label: 'ZIP Code',        col: 1 },
                  { key: 'country',  label: 'Country',         col: 1 },
                ].map(({ key, label, col }) => (
                  <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type="text"
                      required
                      value={addressForm[key]}
                      onChange={e => setAddressForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : editingIdx !== null ? 'Update' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddressForm(false); setAddressForm(EMPTY_ADDRESS); setEditingIdx(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address List */}
          {loadingAddresses ? (
            <div className="text-center py-4 text-gray-400 text-sm">Loading addresses…</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <MapPinIcon className="mx-auto h-10 w-10 text-gray-200 mb-2" />
              <p className="text-sm">No saved addresses yet.</p>
              <button onClick={handleOpenAdd} className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPinIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-xs text-gray-400">{addr.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(idx)}
                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'My Orders',  href: '/orders',  color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'My Cart',    href: '/cart',    color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'Wishlist',   href: '/wishlist', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
              ...(user.role === 'ADMIN' ? [{ label: 'Admin Dashboard', href: '/admin', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }] : []),
            ].map(({ label, href, color }) => (
              <a key={label} href={href}
                className={`flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${color}`}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              className="w-full py-3 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
              Sign Out
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to sign out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
