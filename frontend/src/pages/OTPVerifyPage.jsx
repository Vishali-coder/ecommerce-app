import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authAPI } from '../services/api';

const OTPVerifyPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get email from localStorage (set during login)
    const loginEmail = localStorage.getItem('loginEmail');
    if (!loginEmail) {
      navigate('/login');
      return;
    }
    setEmail(loginEmail);
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        email: email,
        otp: otp
      });

      // Extract user data and token from response
      const { token, user } = response.data;
      
      // Login user with token and user data
      login(user, token);
      
      // Clear stored email
      localStorage.removeItem('loginEmail');
      
      addToast('Welcome back! Login successful.', 'success');
      navigate('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      const msg = error.response?.data || 'Invalid OTP. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email);
      addToast('OTP resent successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data || 'Failed to resend OTP', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit code to
        </p>
        <p className="text-center text-sm font-medium text-primary-600">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl tracking-widest`}
                  placeholder="000000"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Resend OTP
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerifyPage;