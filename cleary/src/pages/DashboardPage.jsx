import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { Brain, TrendingUp, Clock, Heart } from 'lucide-react';

const DashboardPage = () => {
  const { readingHistory, userPreferences } = useApp();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Spring physics
  const springConfig = { stiffness: 300, damping: 30 };
  const organicEase = [0.17, 0.67, 0.83, 0.67];

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
  const moodData = [
    { name: 'Hopeful', value: 25, color: '#10b981' },
    { name: 'Inspiring', value: 30, color: '#3b82f6' },
    { name: 'Exciting', value: 20, color: '#ec4899' },
    { name: 'Balanced', value: 15, color: '#6b7280' },
    { name: 'Concerning', value: 10, color: '#f97316' }
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
    <AnimatedBackground mood="inspiring">
      <Header />
      
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: organicEase,
            }}
          />
        ))}
      </div>

      {/* Parallax gradient orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          x: useTransform(smoothProgress, [0, 1], ['-20%', '20%']),
          y: useTransform(smoothProgress, [0, 1], ['-10%', '30%']),
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          x: useTransform(smoothProgress, [0, 1], ['20%', '-20%']),
          y: useTransform(smoothProgress, [0, 1], ['10%', '-30%']),
        }}
      />
      
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
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
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
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-40 rounded-2xl blur-2xl transition-all duration-500`} />
              
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}
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
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
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
                <Bar dataKey="minutes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: 'spring', ...springConfig }}
            whileHover={{ scale: 1.02 }}
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
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
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Your Learned Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-400 mb-3">Favorite Topics</h4>
              <div className="flex flex-wrap gap-3">
                {userPreferences.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300"
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
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
                <span className="text-white font-semibold capitalize">
                  {userPreferences.politicalBalance}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 mb-3">AI Insights</h4>
              <div className="backdrop-blur-sm bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300">
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
