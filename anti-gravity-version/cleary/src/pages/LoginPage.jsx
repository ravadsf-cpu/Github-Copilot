import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import RippleGrid from '../components/RippleGrid';
import { useTheme } from '../contexts/ThemeContext';
import RippleButton from '../components/RippleButton';

const LoginPage = () => {
  const { loginWithGoogle, loginAsGuest, isDemoMode, loginLocal } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const springConfig = { stiffness: 300, damping: 30 };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Allow sign in with any email/password for now (demo/local mode)
      if (email && password) {
        await loginLocal({ email });
        navigate('/feed', { replace: true });
      } else {
        throw new Error('Please enter email and password');
      }
    } catch (e) {
      setError('Failed to log in: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/feed');
    } catch (e) {
      setError('Failed to sign in with Google: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsGuest();
      navigate('/feed');
    } catch (e) {
      setError('Unable to continue as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground mood="neutral">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <RippleGrid
          enableRainbow={false}
          gridColor={theme === 'dark' ? '#ffffff' : '#000000'}
          rippleIntensity={0.045}
          gridSize={9}
          gridThickness={14}
          mouseInteraction={false}
          opacity={theme === 'dark' ? 0.12 : 0.06}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', ...springConfig }}
          className="relative w-full max-w-md"
        >
          <div className="relative backdrop-blur-xl theme-panel rounded-2xl p-8 shadow-2xl">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 mb-6"
            >
              Sign in to continue to Cleary
            </motion.p>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-500/20 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl theme-input focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl theme-input focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RippleButton
                  type="submit"
                  disabled={loading}
                  className="theme-button w-full py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </RippleButton>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center my-6"
            >
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-white/10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl theme-panel text-current font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c+.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="mt-3"
            >
              <button
                type="button"
                onClick={handleGuest}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border border-black/10 text-black hover:bg-black/10'}`}
              >
                Continue as guest {isDemoMode ? '(demo mode)' : ''}
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-gray-400 text-sm mt-6 text-center"
            >
              Don't have an account?{' '}
              <Link to="/signup" className={`underline font-semibold ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}`}>
                Sign up
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default LoginPage;
