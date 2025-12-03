import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedGlobe = ({ onRegionClick }) => {
  const canvasRef = useRef(null);
  const [pulses, setPulses] = useState([]);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // News hotspots with coordinates
  const regions = [
    { id: 'us', x: 25, y: 35, label: 'North America', color: '#3b82f6' },
    { id: 'eu', x: 50, y: 30, label: 'Europe', color: '#8b5cf6' },
    { id: 'asia', x: 75, y: 40, label: 'Asia', color: '#ec4899' },
    { id: 'africa', x: 52, y: 55, label: 'Africa', color: '#10b981' },
    { id: 'sa', x: 32, y: 65, label: 'South America', color: '#f59e0b' },
    { id: 'oceania', x: 82, y: 70, label: 'Oceania', color: '#06b6d4' }
  ];

  // Generate random news pulses
  useEffect(() => {
    const interval = setInterval(() => {
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const newPulse = {
        id: Date.now(),
        x: randomRegion.x,
        y: randomRegion.y,
        color: randomRegion.color,
        region: randomRegion.id
      };
      setPulses(prev => [...prev.slice(-8), newPulse]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Canvas grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const updateCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      // Draw grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
      regions.forEach((region, i) => {
        regions.slice(i + 1).forEach(otherRegion => {
          ctx.beginPath();
          ctx.moveTo((region.x / 100) * width, (region.y / 100) * height);
          ctx.lineTo((otherRegion.x / 100) * width, (otherRegion.y / 100) * height);
          ctx.stroke();
        });
      });
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      {/* Interactive regions */}
      {regions.map((region) => (
        <motion.div
          key={region.id}
          className="absolute cursor-pointer group"
          style={{
            left: `${region.x}%`,
            top: `${region.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseEnter={() => setHoveredRegion(region.id)}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick?.(region)}
          whileHover={{ scale: 1.2 }}
        >
          {/* Region marker */}
          <motion.div
            className="w-4 h-4 rounded-full relative"
            style={{ backgroundColor: region.color }}
            animate={{
              boxShadow: hoveredRegion === region.id 
                ? `0 0 30px ${region.color}` 
                : `0 0 10px ${region.color}`
            }}
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: region.color }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          </motion.div>

          {/* Region label */}
          <AnimatePresence>
            {hoveredRegion === region.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold">
                  {region.label}
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {Math.floor(Math.random() * 500) + 100} breaking stories
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* News pulses */}
      <AnimatePresence>
        {pulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: `${pulse.x}%`,
              top: `${pulse.y}%`,
              backgroundColor: pulse.color,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 3],
              opacity: [1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Data stream particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedGlobe;
