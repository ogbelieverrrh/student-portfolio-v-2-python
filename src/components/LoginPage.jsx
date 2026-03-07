import React, { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Mail, Zap, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';

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
  const [loginMode, setLoginMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [localShowUnverified, setLocalShowUnverified] = useState(showUnverifiedEmailNotification);
  const [sendingMagic, setSendingMagic] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    setLocalShowUnverified(showUnverifiedEmailNotification);
  }, [showUnverifiedEmailNotification]);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setSignupSuccess(false);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-950' : 'bg-slate-100'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-6000"></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 ${darkMode ? 'opacity-5' : 'opacity-30'}`}
          style={{
            backgroundImage: `linear-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}>
        </div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Student Portfolio
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text mb-8-gray-600'}`}>
            Showcase your work, collaborate with peers, and build your professional profile.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {['Upload Files', 'Share & Collaborate', 'Real-time Chat', 'Secure & Fast'].map((feature, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow-md`}>
                <CheckCircle className="w-4 h-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="absolute bottom-8 flex gap-8">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>10K+</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Students</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>50K+</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Files</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>99.9%</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uptime</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 border ${darkMode ? 'border-gray-800' : 'border-white/20'}`}>
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-yellow-400/20' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 mb-4 shadow-lg`}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Student Portfolio
            </h1>
          </div>

          {/* Verification Notice */}
          {localShowUnverified && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 ${
              darkMode 
                ? 'bg-red-900/20 border-red-500 text-red-300' 
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <p className="text-sm mb-2">Your email is not verified. Check your inbox for a confirmation link.</p>
              <button
                onClick={() => handleResendVerification(unverifiedEmail)}
                className="text-sm font-semibold underline hover:no-underline"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          {/* Success Message */}
          {signupSuccess && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 ${
              darkMode 
                ? 'bg-green-900/20 border-green-500 text-green-300' 
                : 'bg-green-50 border-green-500 text-green-700'
            }`}>
              <p className="text-sm font-medium">Account created! Please check your email to verify your account, then log in.</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex mb-8 rounded-2xl p-1.5 bg-gray-100 dark:bg-gray-800">
            {[
              { id: 'login', label: 'Sign In', icon: Lock },
              { id: 'magic', label: 'Magic Link', icon: Zap },
              { id: 'signup', label: 'Sign Up', icon: User },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setLoginMode(id);
                  setLocalShowUnverified(false);
                  resetForm();
                }}
                disabled={id === 'signup' && !signupEnabled}
                className={`flex-1 py-3 px-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
                  loginMode === id 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md' 
                    : `text-gray-500 dark:text-gray-400 ${id === 'signup' && !signupEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 dark:hover:text-gray-200'}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Signup Disabled Notice */}
          {!signupEnabled && loginMode === 'signup' && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              darkMode 
                ? 'bg-yellow-900/20 text-yellow-300' 
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              <Lock className="w-4 h-4" />
              Student signup is currently disabled
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {loginMode === 'signup' && signupEnabled && (
              <div className="animate-fade-in">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-base transition-all duration-300 outline-none ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-base transition-all duration-300 outline-none ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {loginMode !== 'magic' && (
              <div className="animate-fade-in">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-base transition-all duration-300 outline-none ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={async () => {
                if (loginMode === 'signup' && signupEnabled) {
                  const success = await handleSignup(formData.name, formData.email, formData.password, 'student', false);
                  if (success) {
                    setSignupSuccess(true);
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
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {sendingMagic || isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Please wait...
                </>
              ) : (
                <>
                  {loginMode === 'login' ? 'Sign In' : loginMode === 'magic' ? 'Send Magic Link' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Magic Link Help */}
            {loginMode === 'magic' && (
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                We'll send you a one-time login link to your email. No password needed! ✨
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              © 2024 Student Portfolio. Built with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
