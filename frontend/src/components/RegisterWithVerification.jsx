import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EmailVerification from './EmailVerification';
import api from '../api/client';

const RegisterWithVerification = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  
  const [step, setStep] = useState('verification'); // 'verification' or 'register'
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleEmailVerified = (email) => {
    setVerifiedEmail(email);
    setStep('register');
    showMessage('Email verified! Please complete your registration.', 'success');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        email: verifiedEmail,
        username: formData.username.trim(),
        displayName: formData.displayName.trim() || formData.username.trim(),
        mobile: formData.mobile.trim() || undefined,
        password: formData.password
      });

      // Auto-login after successful registration
      await setAuthUser(response.data.token, response.data.user);
      
      showMessage('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/chat');
      }, 1500);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToVerification = () => {
    setStep('verification');
    setVerifiedEmail('');
    setFormData({
      username: '',
      displayName: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (step === 'verification') {
    return <EmailVerification onVerificationSuccess={handleEmailVerified} />;
  }

  return (
    <div className={`min-h-screen ${theme.colors.background} ${theme.colors.text} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${theme.colors.surface} rounded-lg shadow-lg p-8`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">SUGGO</h1>
          <h2 className="text-xl font-semibold mb-2">Complete Registration</h2>
          <p className={`${theme.colors.textSecondary} text-sm`}>
            Email: <span className="font-medium text-indigo-600">{verifiedEmail}</span>
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Your display name (optional)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Mobile number (optional)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleBackToVerification}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${theme.colors.border} border ${theme.colors.text} hover:bg-opacity-10`}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.password}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !formData.username || !formData.password
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className={`mt-8 text-center text-sm ${theme.colors.textSecondary}`}>
          <p>Already have an account? 
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithVerification;
