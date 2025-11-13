import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedGlobeHero from '../components/AnimatedGlobeHero';
import Aurora from '../components/Aurora';
import StreamingNewsFeed from '../components/StreamingNewsFeed';
import BiasDetectionDashboard from '../components/BiasDetectionDashboard';
import LiveNewsVisualization from '../components/LiveNewsVisualization';
import AnimatedBackground from '../components/AnimatedBackground';
import MagneticButton from '../components/MagneticButton';
import ScrollProgress from '../components/ScrollProgress';
import { Brain, Shield, Zap, TrendingUp, Target, Sparkles, Users, Award, Play, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const features = [
    {
      icon: Zap,
      title: 'Lightning-Fast Updates',
      description: 'Real-time news processing from 2,500+ verified sources with AI-powered relevance filtering',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.1
    },
    {
      icon: Brain,
      title: 'Intelligent Analysis',
      description: 'Advanced AI breaks down complex stories with sentiment analysis and context',
      color: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Transparent political lean indicators and source credibility ratings on every article',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.3
    },
    {
      icon: Target,
      title: 'Personalized Feed',
      description: 'Machine learning adapts to your reading patterns for perfectly curated content',
      color: 'from-green-500 to-emerald-500',
      delay: 0.4
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Spot emerging stories and track developing news with intelligent algorithms',
      color: 'from-pink-500 to-rose-500',
      delay: 0.5
    },
    {
      icon: Sparkles,
      title: 'Premium Experience',
      description: 'Beautiful UI with smooth animations and immersive data visualization',
      color: 'from-violet-500 to-purple-500',
      delay: 0.6
    }
  ];

  const achievements = [
    { icon: Users, value: '3.2K', label: 'Active Readers', color: 'text-blue-400' },
    { icon: Award, value: '9.87K', label: 'Articles Analyzed', color: 'text-purple-400' },
    { icon: Target, value: '94%', label: 'Accuracy Score', color: 'text-green-400' },
    { icon: Sparkles, value: '24/7', label: 'Live Updates', color: 'text-pink-400' }
  ];

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Premium Sticky Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-purple-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-purple-600/5" />
        
        <div className="relative container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent cursor-pointer"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            CLEARY
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-white font-medium hover:text-purple-300 transition-colors"
            >
              Log In
            </motion.button>
            
            <MagneticButton
              onClick={() => navigate('/signup')}
              variant="primary"
              size="md"
              icon={ArrowRight}
            >
              Sign Up
            </MagneticButton>
          </div>
        </div>
      </motion.header>

      {/* Aurora OGL Shader Full-Page Background */}
      <div className="fixed inset-0 z-0">
        {/* CSS Gradient Fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-purple-600/40 to-indigo-600/30 animate-gradient-shift" />
        <Aurora
          colorStops={["#10B981", "#8B5CF6", "#6366F1"]}
          blend={0.8}
          amplitude={2.5}
          speed={0.8}
        />
      </div>

      <AnimatedBackground mood="neutral">
        <div ref={containerRef} className="relative z-10">          {/* HERO: Animated Globe Command Center */}
          <AnimatedGlobeHero />

          {/* SECTION: Streaming News Feed */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-10 px-6"
          >
            <StreamingNewsFeed />
          </motion.div>

          {/* SECTION: Live News Visualization with Breaking News & Bias Detection */}
          <LiveNewsVisualization />

          {/* SECTION: Premium Features Grid */}
          <section className="relative z-10 py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Premium Intelligence Features
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Experience news with cutting-edge AI and beautiful design
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: feature.delay, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-500`} />
                    
                    <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 group-hover:border-white/20 transition-all h-full">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: Bias Detection Dashboard */}
          <div className="relative z-10 px-6">
            <BiasDetectionDashboard />
          </div>

          {/* SECTION: Achievements/Stats */}
          <section className="relative z-10 py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Join Our Growing Community
                </h2>
                <p className="text-gray-400 text-lg">
                  Be part of the future of intelligent news consumption
                </p>
              </motion.div>

              <div className="grid md:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center group hover:border-purple-500/30 transition-all"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <achievement.icon className={`w-12 h-12 ${achievement.color} mx-auto mb-4`} />
                    </motion.div>
                    <div className="text-4xl font-bold text-white mb-2">{achievement.value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{achievement.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: Final CTA */}
          <section className="relative z-10 py-32 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  Ready to Transform Your News Experience?
                </h2>
                <p className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
                  Join thousands discovering intelligent, unbiased news coverage
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <MagneticButton
                    onClick={() => navigate('/command')}
                    variant="primary"
                    size="xl"
                    icon={ArrowRight}
                  >
                    Launch Command Center
                  </MagneticButton>

                  <MagneticButton
                    onClick={() => navigate('/login')}
                    variant="glass"
                    size="xl"
                    icon={Play}
                  >
                    Watch Demo
                  </MagneticButton>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-sm mt-8"
                >
                  No credit card required • Free access • Cancel anytime
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/10 py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    CLEARY
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your intelligent news command center. Unbiased, real-time, and powered by AI.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><button className="hover:text-purple-400 transition-colors">Features</button></li>
                    <li><button className="hover:text-purple-400 transition-colors">Pricing</button></li>
                    <li><button className="hover:text-purple-400 transition-colors">API</button></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><button className="hover:text-purple-400 transition-colors">About</button></li>
                    <li><button className="hover:text-purple-400 transition-colors">Blog</button></li>
                    <li><button className="hover:text-purple-400 transition-colors">Careers</button></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
                © 2025 Cleary. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default LandingPage;
