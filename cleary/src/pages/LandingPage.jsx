import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Globe2, Newspaper, Activity } from '../components/Icons';
import CardSwap, { Card } from '../components/CardSwap';
import RippleGrid from '../components/RippleGrid';
import TextType from '../components/TextType';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const features = [
    {
      icon: Globe2,
      title: 'Global Sources',
      description: 'Real‑time news from 2,500+ outlets'
    },
    {
      icon: Newspaper,
      title: 'Smart Summaries',
      description: 'Clear, concise takeaways on demand'
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Transparent credibility ratings'
    },
    {
      icon: Activity,
      title: 'Trend Analysis',
      description: 'Spot emerging stories instantly'
    }
  ];

  const stats = [
    { label: 'Sources', value: '2,499+' },
    { label: 'Articles', value: '9,867+' },
    { label: 'Accuracy', value: '93%' },
    { label: 'Updates', value: '24/7' }
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* RippleGrid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <RippleGrid
          enableRainbow={false}
          gridColor={theme === 'dark' ? '#ffffff' : '#000000'}
          rippleIntensity={0.05}
          gridSize={10}
          gridThickness={15}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={theme === 'dark' ? 0.15 : 0.08}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${
          theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/40 border-black/10'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold tracking-tight"
          >
            CLEARY
          </motion.div>
          
          <div className="flex gap-4 items-center">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              className={`p-2 rounded-lg border transition ${
                theme === 'dark' 
                  ? 'border-white/15 text-white/80 hover:text-white hover:bg-white/5' 
                  : 'border-black/15 text-black/80 hover:text-black hover:bg-black/5'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className={`px-6 py-2 transition border rounded-lg ${
                theme === 'dark' 
                  ? 'text-white/80 hover:text-white border-white/15' 
                  : 'text-black/80 hover:text-black border-black/15'
              }`}
            >
              Log In
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
              }`}
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
  <section className="relative z-10 min-h-[140vh] flex items-center justify-center px-6 pt-28">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-[9rem] font-black mb-8 leading-none tracking-tight">
              <TextType 
                text={["CLEARY"]}
                typingSpeed={100}
                pauseDuration={3000}
                showCursor={false}
                loop={false}
              />
            </h1>

            <p className={`text-2xl md:text-3xl mb-6 font-light tracking-tight ${
              theme === 'dark' ? 'text-white/90' : 'text-black/90'
            }`}>
              Intelligent news. Minimal. Professional.
            </p>

            <p className={`text-base md:text-lg mb-12 max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}>
              Real-time coverage from trusted sources with clean summaries and unbiased context — all in a distraction-free interface.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`backdrop-blur-xl border rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                  }`}
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-sm uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white/60' : 'text-black/60'
                  }`}>
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
                className={`group px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
              >
                Launch Command Center
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 backdrop-blur-xl border rounded-xl font-semibold text-lg hover:bg-opacity-10 transition ${
                  theme === 'dark' ? 'bg-white/5 border-white/20 text-white hover:bg-white' : 'bg-black/5 border-black/20 text-black hover:bg-black'
                }`}
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CardSwap Section - clean center focus */}
      <section className="relative z-10 py-40 lg:py-56 px-6 isolate min-h-[110vh]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-3">Preview</h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Big cards. No clutter.</p>
          </div>
          <div className="flex justify-center">
            <CardSwap
              variant="inline"
              width={760}
              height={560}
              cardDistance={120}
              verticalDistance={130}
              delay={9500}
              pauseOnHover={true}
              onCardClick={(i) => {
                if (i === 0) navigate('/feed');
                else if (i === 1) navigate('/dashboard');
                else navigate('/command');
              }}
            >
              <Card role="button" aria-label="Open Feed" className={`backdrop-blur-xl border text-left p-6 ${
                theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'
              }`}>
                <h3 className="text-xl font-bold mb-2">Unified Feed</h3>
                <p className={theme === 'dark' ? 'text-white/70 text-sm' : 'text-black/70 text-sm'}>Top sources, one beautiful stream. No noise.</p>
              </Card>
              <Card role="button" aria-label="Open Dashboard" className={`backdrop-blur-xl border text-left p-6 ${
                theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'
              }`}>
                <h3 className="text-xl font-bold mb-2">Bias Insights</h3>
                <p className={theme === 'dark' ? 'text-white/70 text-sm' : 'text-black/70 text-sm'}>See lean and credibility at a glance.</p>
              </Card>
              <Card role="button" aria-label="Open Command Center" className={`backdrop-blur-xl border text-left p-6 ${
                theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'
              }`}>
                <h3 className="text-xl font-bold mb-2">Instant Summaries</h3>
                <p className={theme === 'dark' ? 'text-white/70 text-sm' : 'text-black/70 text-sm'}>On-demand, readable recaps for any story.</p>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>

      {/* Features Section - monochrome */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              Platform Features
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
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
                className={`backdrop-blur-xl border rounded-2xl p-8 transition group ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 hover:border-white/20' 
                    : 'bg-black/5 border-black/10 hover:border-black/20'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform ${
                  theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'
                }`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                
                <p className={theme === 'dark' ? 'text-white/60' : 'text-black/60'}>
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
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your News?
          </h2>
          
          <p className={`text-xl mb-10 ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
            Join thousands discovering intelligent, unbiased coverage
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className={`px-10 py-5 rounded-xl font-bold text-xl ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}
          >
            Get Started Free
          </motion.button>

          <p className={`text-sm mt-6 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
            No credit card required • Free forever
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-8 px-6 ${
        theme === 'dark' ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className={`max-w-6xl mx-auto text-center text-sm ${
          theme === 'dark' ? 'text-white/40' : 'text-black/40'
        }`}>
          © 2025 Cleary. Intelligent news for everyone.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
