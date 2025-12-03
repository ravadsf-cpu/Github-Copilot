import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { Brain, TrendingUp, Clock, Heart } from '../components/Icons';

const DashboardPage = () => {
  const { readingHistory, userPreferences } = useApp();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Spring physics
  const springConfig = { stiffness: 300, damping: 30 };

  // Track mouse for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mock data for charts
  // Use grayscale palette for neutral theme
  const moodData = [
    { name: 'Hopeful', value: 25, color: '#111111' },
    { name: 'Inspiring', value: 30, color: '#3f3f46' },
    { name: 'Exciting', value: 20, color: '#6b7280' },
    { name: 'Balanced', value: 15, color: '#9ca3af' },
    { name: 'Concerning', value: 10, color: '#d1d5db' }
  ];

  const readingTimeData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 75 },
    { day: 'Fri', minutes: 55 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 85 }
  ];

  const stats = [
    {
      icon: Clock,
      label: 'Total Reading Time',
      value: '6.5 hours',
      change: '+12%',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Brain,
      label: 'Articles Read',
      value: readingHistory.length || '47',
      change: '+23%',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: TrendingUp,
      label: 'Topics Explored',
      value: userPreferences.topics.length || '12',
      change: '+5',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: Heart,
      label: 'Engagement Score',
      value: '87%',
      change: '+8%',
      color: 'from-pink-600 to-rose-600'
    }
  ];

  return (
    <AnimatedBackground mood="neutral">
      <Header />
      {/* Removed colored particles and orbs for neutral theme */}
      
      <main className="relative container mx-auto px-6 pt-24 pb-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', ...springConfig }}
          className="mb-12"
          style={{
            x: mousePosition.x * 3,
            y: mousePosition.y * 3,
          }}
        >
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${'text-white'}`}>
            Your Memory Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Cleary learns from your interactions to personalize your experience
          </p>
        </motion.div>

        {/* Stats Grid with enhanced hover effects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', ...springConfig }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-500" />

              <div className="relative backdrop-blur-xl theme-panel rounded-2xl p-6 group-hover:opacity-95 transition-all">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg ${'bg-white/10 border border-white/10'}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-green-400 text-sm font-semibold">{stat.change} this week</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section with enhanced styling */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Reading Time Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: 'spring', ...springConfig }}
            whileHover={{ scale: 1.02 }}
            className="relative backdrop-blur-xl theme-panel rounded-2xl p-6 group"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all" />
            <h3 className="relative text-xl font-bold text-white mb-6">Weekly Reading Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={readingTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="minutes" fill="#9ca3af" radius={[8, 8, 0, 0]} />
                <defs></defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: 'spring', ...springConfig }}
            whileHover={{ scale: 1.02 }}
            className="relative backdrop-blur-xl theme-panel rounded-2xl p-6 group"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all" />
            <h3 className="relative text-xl font-bold text-white mb-6">Content Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-xl theme-panel rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Your Learned Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-400 mb-3">Favorite Topics</h4>
              <div className="flex flex-wrap gap-3">
                {userPreferences.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 mb-3">Political Balance Preference</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-white/40"
                  />
                </div>
                <span className="text-white font-semibold capitalize">
                  {userPreferences.politicalBalance}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 mb-3">AI Insights</h4>
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-300">
                  Based on your reading patterns, you prefer in-depth technology and science content with an optimistic tone. 
                  Consider exploring more international news for a broader perspective.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </AnimatedBackground>
  );
};

export default DashboardPage;
