import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, TrendingUp, ArrowRight, Globe2, Newspaper, Target } from '../components/Icons';
import CardSwap, { Card } from '../components/CardSwap';
import Orb from '../components/Orb';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time news from 2,500+ sources',
      gradient: 'from-emerald-400 to-cyan-400'
    },
    {
      icon: Newspaper,
      title: 'Smart Summaries',
      description: 'Clear, concise takeaways on demand',
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Transparent credibility ratings',
      gradient: 'from-blue-400 to-indigo-400'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Spot emerging stories instantly',
      gradient: 'from-cyan-400 to-teal-400'
    }
  ];

  const stats = [
    { label: 'Sources', value: '2,499+', gradient: 'from-emerald-400 to-cyan-400' },
    { label: 'Articles', value: '9,867+', gradient: 'from-purple-400 to-pink-400' },
    { label: 'Accuracy', value: '93%', gradient: 'from-blue-400 to-cyan-400' },
    { label: 'Updates', value: '24/7', gradient: 'from-cyan-400 to-emerald-400' }
  ];

  return (
    <div className="relative min-h-screen" style={{ background: '#000000' }}>
      {/* Orb Background Effect - MAXIMIZED SENSITIVITY */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1200px',
        height: '1200px',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <Orb hue={160} hoverIntensity={0.8} rotateOnHover={true} forceHoverState={true} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
          >
            CLEARY
          </motion.div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white/80 hover:text-white transition"
            >
              Log In
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/50"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Globe2 className="w-16 h-16 mx-auto text-emerald-400 mb-6" />
            </motion.div>

            <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CLEARY
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
              Your Intelligent News Command Center
            </p>

            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              Real-time news analysis powered by AI. Unbiased, transparent, and beautifully designed.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/command')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                Launch Command Center
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 backdrop-blur-xl bg-white/5 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CardSwap Showcase - subtle, bottom-right */}
      <div aria-hidden className="pointer-events-none">
        <div className="absolute bottom-8 right-8 z-20 pointer-events-auto" style={{ height: 600, width: 500 }}>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={true}
            onCardClick={(i) => {
              if (i === 0) navigate('/feed');
              else if (i === 1) navigate('/dashboard');
              else navigate('/command');
            }}
          >
            <Card role="button" aria-label="Open Feed" className="backdrop-blur-xl bg-white/5 border border-white/10 text-left p-6">
              <h3 className="text-white text-xl font-bold mb-2">Unified Feed</h3>
              <p className="text-white/70 text-sm">Top sources, one beautiful stream. No noise.</p>
            </Card>
            <Card role="button" aria-label="Open Dashboard" className="backdrop-blur-xl bg-white/5 border border-white/10 text-left p-6">
              <h3 className="text-white text-xl font-bold mb-2">Bias Insights</h3>
              <p className="text-white/70 text-sm">See lean and credibility at a glance.</p>
            </Card>
            <Card role="button" aria-label="Open Command Center" className="backdrop-blur-xl bg-white/5 border border-white/10 text-left p-6">
              <h3 className="text-white text-xl font-bold mb-2">Instant Summaries</h3>
              <p className="text-white/70 text-sm">On-demand, readable recaps for any story.</p>
            </Card>
          </CardSwap>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Platform Features
            </h2>
            <p className="text-white/60 text-lg">
              Beautiful, fast, and useful
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-white/60">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Ready to Transform Your News?
          </h2>
          
          <p className="text-xl text-white/70 mb-10">
            Join thousands discovering intelligent, unbiased coverage
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-xl shadow-2xl shadow-emerald-500/50"
          >
            Get Started Free
          </motion.button>

          <p className="text-white/40 text-sm mt-6">
            No credit card required • Free forever
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
          © 2025 Cleary. Intelligent news for everyone.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
