import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, animate } from 'framer-motion';

const LiveNewsCounter = ({ endValue, label, prefix = '', suffix = '', duration = 2, icon: Icon }) => {
  const count = useMotionValue(0);
  const rounded = useSpring(count, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const controls = animate(count, parseFloat(endValue.replace(/\D/g, '')) || 0, {
      duration,
      ease: 'easeOut'
    });

    const unsubscribe = rounded.on('change', (latest) => {
      const formatted = Math.floor(latest).toLocaleString();
      setDisplayValue(formatted);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [endValue, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative group"
    >
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
        
        {/* Icon */}
        {Icon && (
          <motion.div
            className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <Icon className="w-6 h-6 text-purple-400" />
          </motion.div>
        )}

        {/* Counter */}
        <div className="relative">
          <motion.div
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              backgroundSize: '200% 100%'
            }}
          >
            {prefix}{displayValue}{suffix}
          </motion.div>

          {/* Label */}
          <div className="text-gray-400 text-sm font-medium">{label}</div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Floating particles around counter */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${20 + i * 30}%`,
            top: '10%'
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}
    </motion.div>
  );
};

export default LiveNewsCounter;
