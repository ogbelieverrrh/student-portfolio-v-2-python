import React, { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Mail, Zap } from 'lucide-react';

const LoginPage = ({
  darkMode,
  toggleDarkMode,
  showNotification,
  signupEnabled,
  handleSignup,
  handleLogin,
  handleResendVerification,
  handleMagicLink,
  showUnverifiedEmailNotification,
  unverifiedEmail,
  isLoggingIn,
}) => {
  const [loginMode, setLoginMode] = useState('login'); // 'login', 'signup', 'magic'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [localShowUnverified, setLocalShowUnverified] = useState(showUnverifiedEmailNotification);
  const [sendingMagic, setSendingMagic] = useState(false);

  useEffect(() => {
    setLocalShowUnverified(showUnverifiedEmailNotification);
  }, [showUnverifiedEmailNotification]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center p-2 sm:p-4 animate-fade-in`}>
      {!darkMode && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 sm:top-40 right-4 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative z-10 animate-scale-in`}>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:scale-110 transition-transform`}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center animate-float">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className={`text-xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Student Portfolio
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 sm:mt-2 text-sm sm:text-base`}>Showcase your work beautifully</p>
        </div>

        {localShowUnverified && (
          <div className={`mb-3 sm:mb-4 p-2 sm:p-3 ${darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm`}>
            <p>Your email is not verified. Please check your inbox for a confirmation link.</p>
            <button
              onClick={() => handleResendVerification(unverifiedEmail)}
              className="font-semibold underline text-xs sm:text-sm"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {/* Three tabs: Login, Magic Link, Sign Up */}
        <div className={`flex mb-4 sm:mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
          <button
            onClick={() => {
              setLoginMode('login');
              setLocalShowUnverified(false);
            }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 text-xs sm:text-sm ${loginMode === 'login' ? (darkMode ? 'bg-gray-600 shadow-md text-white' : 'bg-white shadow-md text-indigo-600') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
          >
            <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Login</span>
            <span className="sm:hidden">Log</span>
          </button>
          <button
            onClick={() => {
              setLoginMode('magic');
              setLocalShowUnverified(false);
            }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 text-xs sm:text-sm ${loginMode === 'magic' ? (darkMode ? 'bg-gray-600 shadow-md text-white' : 'bg-white shadow-md text-indigo-600') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Magic Link</span>
            <span className="sm:inline">Magic</span>
          </button>
          <button
            onClick={() => {
              setLoginMode('signup');
              setLocalShowUnverified(false);
            }}
            disabled={!signupEnabled}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 text-xs sm:text-sm ${loginMode === 'signup' ? (darkMode ? 'bg-gray-600 shadow-md text-white' : 'bg-white shadow-md text-indigo-600') : (darkMode ? 'text-gray-300' : 'text-gray-600')} ${!signupEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sign Up</span>
            <span className="sm:hidden">Sign</span>
          </button>
        </div>

        {!signupEnabled && loginMode === 'signup' && (
          <div className={`mb-4 p-3 ${darkMode ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'} border rounded-lg flex items-center gap-2 text-sm`}>
            <Lock className="w-4 h-4" />
            Student signup is currently disabled
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {/* Sign Up Form */}
          {loginMode === 'signup' && signupEnabled && (
            <div className="animate-slide-down">
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full p-2 sm:p-3 border-2 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          {/* Email - always shown */}
          <div className="relative">
            <Mail className={`absolute left-2 sm:left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 sm:p-3 pl-8 sm:pl-10 border-2 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password - only for login and signup */}
          {loginMode !== 'magic' && (
            <div className="animate-slide-down">
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-2 sm:p-3 border-2 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={async () => {
              if (loginMode === 'signup' && signupEnabled) {
                const success = await handleSignup(formData.name, formData.email, formData.password, 'student', false);
                if (success) {
                  setFormData({ name: '', email: '', password: '' });
                  setLoginMode('login');
                }
              } else if (loginMode === 'login') {
                handleLogin(formData.email, formData.password);
              } else if (loginMode === 'magic') {
                setSendingMagic(true);
                await handleMagicLink(formData.email);
                setSendingMagic(false);
              }
            }}
            disabled={(loginMode === 'signup' && !signupEnabled) || sendingMagic || isLoggingIn}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 sm:p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {sendingMagic || isLoggingIn ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Loading...</span>
                <span className="sm:hidden">Loading</span>
              </>
            ) : loginMode === 'login' ? (
              'Sign In'
            ) : loginMode === 'magic' ? (
              <>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Send Magic Link</span>
                <span className="sm:hidden">Send Link</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Magic Link Help */}
          {loginMode === 'magic' && (
            <div className={`text-center text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>We'll send you a one-time login link to your email.</p>
              <p className="mt-1">No password needed! ✨</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
