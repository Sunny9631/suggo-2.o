import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

const EmailVerification = ({ onVerificationSuccess }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/email-verification/send-otp', { email });
      showMessage('OTP sent successfully to your email!', 'success');
      setStep('otp');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/email-verification/verify-otp', { email, otp });
      showMessage('Email verified successfully! Redirecting to registration...', 'success');
      
      // Wait a moment for user to see success message, then call parent callback
      setTimeout(() => {
        if (onVerificationSuccess) {
          onVerificationSuccess(email);
        }
      }, 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to verify OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage('');

    try {
      await api.post('/email-verification/send-otp', { email });
      showMessage('OTP resent successfully!', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setMessage('');
  };

  return (
    <div className={`min-h-screen ${theme.colors.background} ${theme.colors.text} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${theme.colors.surface} rounded-lg shadow-lg p-8`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">SUGGO</h1>
          <h2 className="text-xl font-semibold mb-2">
            {step === 'email' ? 'Verify Your Email' : 'Enter OTP'}
          </h2>
          <p className={`${theme.colors.textSecondary} text-sm`}>
            {step === 'email' 
              ? 'Enter your email address to receive a verification code'
              : 'Enter the 6-digit code sent to your email'
            }
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

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !email
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.colors.text}`}>
                Verification Code
              </label>
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(''));
                      
                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        const nextInput = e.target.parentElement.children[index + 1];
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    className={`w-12 h-12 text-center text-lg font-semibold rounded-lg border ${theme.colors.border} ${theme.colors.background} ${theme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    required
                  />
                ))}
              </div>
              <p className={`text-sm ${theme.colors.textSecondary} text-center`}>
                Code sent to: <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${theme.colors.border} border ${theme.colors.text} hover:bg-opacity-10`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : `${theme.colors.border} border ${theme.colors.text} hover:bg-opacity-10`
                  }`}
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

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

export default EmailVerification;
