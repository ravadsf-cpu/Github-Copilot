import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import RippleButton from '../components/RippleButton';

const SignupPage = () => {
  const { loginWithGoogle, loginAsGuest, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const springConfig = { stiffness: 300, damping: 30 };
  const organicEase = [0.17, 0.67, 0.83, 0.67];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Allow signup with any email/password for now
      if (name && email && password) {
        // Create a mock user session
        localStorage.setItem('cleary_user', JSON.stringify({
          email,
          displayName: name,
          uid: 'local-' + Date.now(),
          timestamp: Date.now()
        }));
        navigate('/feed');
      } else {
        throw new Error('Please fill in all fields');
      }
    } catch (e) {
      setError('Failed to sign up: ' + e.message);
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
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: organicEase,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', ...springConfig }}
          className="relative w-full max-w-md group"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            >
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 mb-6"
            >
              Join Cleary in seconds
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
              <label className="block text-gray-400 mb-2">Name</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-pink-600/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-gray-400 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-600/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-gray-400 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-pink-600/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RippleButton
                type="submit"
                disabled={loading}
                className="relative w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/40 disabled:opacity-50 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{loading ? 'Creating account...' : 'Sign Up'}</span>
              </RippleButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center my-6"
          >
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/10" />
          </motion.div>

          {/* Google Sign In */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Continue as guest */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="mt-3"
          >
            <button
              type="button"
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 disabled:opacity-50 transition-all"
            >
              Continue as guest {isDemoMode ? '(demo mode)' : ''}
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-gray-400 text-sm mt-6 text-center"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-pink-300 hover:text-pink-200 underline font-semibold">
              Sign in
            </Link>
          </motion.p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default SignupPage;
