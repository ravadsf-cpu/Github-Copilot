import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, BarChart2, Video, User, LogOut, Vote } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/command', label: 'Command', icon: BarChart2 },
    { path: '/elections', label: 'Elections', icon: Vote },
    { path: '/dashboard', label: 'Insights', icon: BarChart2 },
    { path: '/videos', label: 'Videos', icon: Video },
    { path: '/profile', label: 'Account', icon: User },
  ];

  const springConfig = { stiffness: 300, damping: 30 };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/10'}`}
    >
      <nav className="relative container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', ...springConfig }}
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-black border border-white/20' : 'bg-white border border-black/20'}`}>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold text-sm`}>C</span>
                </div>
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Cleary
              </span>
            </motion.div>
          </Link>

          {user && (
            <div className="flex items-center space-x-1">
              {navItems.map(({ path, label, icon: Icon }, index) => {
                const isActive = location.pathname === path;
                return (
                  <Link key={path} to={path}>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring', ...springConfig }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black')
                          : (theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black')
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}
                          transition={{ type: 'spring', ...springConfig }}
                        />
                      )}
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="hidden md:inline text-sm font-medium relative z-10">{label}</span>
                    </motion.div>
                  </Link>
                );
              })}
              
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', ...springConfig }}
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all ml-2 group"
              >
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 rounded-xl blur-md transition-all" />
                <LogOut className="w-4 h-4 relative z-10" />
                <span className="hidden md:inline text-sm font-medium relative z-10">Logout</span>
              </motion.button>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
