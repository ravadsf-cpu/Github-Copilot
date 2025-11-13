import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Globe, Zap, Shield, TrendingUp } from './Icons';
import { useNavigate } from 'react-router-dom';

const AnimatedGlobeHero = () => {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredStat, setHoveredStat] = useState(null);
  const [timeGradient, setTimeGradient] = useState('from-blue-900/20 via-purple-900/20 to-pink-900/20');
  const [stats, setStats] = useState({
    sources: 0,
    articles: 0,
    accuracy: 0,
    updates: 0
  });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  // Smooth spring animations for mouse parallax
  const smoothMouseX = useSpring(mousePosition.x, { stiffness: 100, damping: 30 });
  const smoothMouseY = useSpring(mousePosition.y, { stiffness: 100, damping: 30 });

  // Time-based gradient effect
  useEffect(() => {
    const updateGradient = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeGradient('from-blue-900/30 via-cyan-900/20 to-teal-900/20');
      } else if (hour >= 12 && hour < 17) {
        setTimeGradient('from-orange-900/20 via-purple-900/20 to-pink-900/20');
      } else if (hour >= 17 && hour < 21) {
        setTimeGradient('from-purple-900/30 via-pink-900/20 to-red-900/20');
      } else {
        setTimeGradient('from-indigo-900/30 via-purple-900/20 to-blue-900/20');
      }
    };
    updateGradient();
    const interval = setInterval(updateGradient, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x: x * 20, y: y * 20 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animated counter effect with pulse
  useEffect(() => {
    const targetStats = {
      sources: 2500,
      articles: 9870,
      accuracy: 94,
      updates: 24
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setStats({
        sources: Math.floor(targetStats.sources * easeProgress),
        articles: Math.floor(targetStats.articles * easeProgress),
        accuracy: Math.floor(targetStats.accuracy * easeProgress),
        updates: Math.floor(targetStats.updates * easeProgress)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Canvas globe with news pulses
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = width / 4;
    const centerY = height / 4;
    const radius = Math.min(width, height) / 6;

    // News source locations (simulated major cities)
    const newsHubs = [
      { lat: 40.7128, lon: -74.0060, name: 'New York', color: '#3b82f6' },
      { lat: 51.5074, lon: -0.1278, name: 'London', color: '#ec4899' },
      { lat: 35.6762, lon: 139.6503, name: 'Tokyo', color: '#10b981' },
      { lat: -33.8688, lon: 151.2093, name: 'Sydney', color: '#f59e0b' },
      { lat: 1.3521, lon: 103.8198, name: 'Singapore', color: '#8b5cf6' },
      { lat: 55.7558, lon: 37.6173, name: 'Moscow', color: '#ef4444' }
    ];

    let animationFrame;
    let pulsesList = [];

    const latLonToXY = (lat, lon) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
      const y = centerY - radius * Math.cos(phi);

      return { x: x / 2, y: y / 2 };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width / 2, height / 2);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX / 2, centerY / 2, radius / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw grid lines
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.arc(centerX / 2, centerY / 2, (radius / 2) * (i / 12), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw news hubs
      newsHubs.forEach(hub => {
        const pos = latLonToXY(hub.lat, hub.lon);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = hub.color;
        ctx.fill();

        // Pulsing ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6 + Math.sin(Date.now() / 500) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = hub.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Random news pulses
      if (Math.random() > 0.97) {
        const hub = newsHubs[Math.floor(Math.random() * newsHubs.length)];
        const pos = latLonToXY(hub.lat, hub.lon);
        pulsesList.push({
          x: pos.x,
          y: pos.y,
          radius: 0,
          maxRadius: 60,
          color: hub.color,
          alpha: 1
        });
      }

      // Animate pulses
      pulsesList = pulsesList.filter(pulse => {
        pulse.radius += 1.5;
        pulse.alpha = 1 - (pulse.radius / pulse.maxRadius);

        if (pulse.alpha > 0) {
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
          ctx.strokeStyle = pulse.color + Math.floor(pulse.alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2;
          ctx.stroke();
          return true;
        }
        return false;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Typewriter effect for tagline
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Your Intelligent News Command Center';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();
  return (
    <motion.div
      ref={heroRef}
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic time-based gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${timeGradient} transition-all duration-1000`} />
      
      {/* Parallax animated particles */}
      <div className="absolute inset-0" ref={containerRef}>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.3, 0, 0.3],
            }}
            style={{
              x: smoothMouseX,
              y: smoothMouseY
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Canvas globe with parallax */}
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
        style={{ 
          mixBlendMode: 'screen',
          x: smoothMouseX,
          y: smoothMouseY
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              CLEARY
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <p className="text-2xl md:text-3xl text-gray-300 font-light h-12">
              {displayText}
              <span className="inline-block w-0.5 h-8 bg-purple-400 ml-1 animate-pulse" />
            </p>
          </motion.div>

          {/* Animated Stats with Hover Effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { value: stats.sources, label: 'Sources', suffix: '+', color: 'purple', icon: Globe },
              { value: stats.articles, label: 'Articles', suffix: '+', color: 'pink', icon: Zap },
              { value: stats.accuracy, label: 'Accuracy', suffix: '%', color: 'blue', icon: Shield },
              { value: stats.updates, label: 'Updates', suffix: '/7', color: 'green', icon: TrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                onHoverStart={() => setHoveredStat(index)}
                onHoverEnd={() => setHoveredStat(null)}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`backdrop-blur-xl bg-white/5 border border-${stat.color}-500/30 rounded-2xl p-6 cursor-pointer relative overflow-hidden group`}
              >
                {/* Animated progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredStat === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400 origin-left`}
                />

                {/* Pulsing icon */}
                <motion.div
                  animate={hoveredStat === index ? { 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="mb-3"
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto`} />
                </motion.div>

                {/* Animated counter */}
                <motion.div 
                  className={`text-4xl font-bold text-${stat.color}-400 mb-2`}
                  animate={hoveredStat === index ? {
                    scale: [1, 1.1, 1],
                    color: ['#fff', `var(--${stat.color}-400)`, '#fff']
                  } : {}}
                >
                  {stat.value.toLocaleString()}{stat.suffix}
                </motion.div>
                
                <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>

                {/* Hover glow effect */}
                {hoveredStat === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className={`absolute -inset-1 bg-${stat.color}-500 blur-xl -z-10`}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/command')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg relative overflow-hidden group"
            >
              <span className="relative z-10">Launch Command Center</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-purple-500/50 rounded-xl text-purple-300 font-bold text-lg backdrop-blur-xl hover:bg-purple-500/10 transition-colors"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Custom gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default AnimatedGlobeHero;
