import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { moodColors } from '../utils/mockData';

const AnimatedBackground = ({ children, mood = 'neutral' }) => {
  const canvasRef = useRef(null);
  const { backgroundMood } = useApp();
  const activeMood = mood || backgroundMood;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80; // More particles for richer effect
    
    const moodColor = moodColors[activeMood]?.bgPrimary || '#111827';

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.pulse = Math.random() * Math.PI * 2; // For pulsing effect
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02; // Animate pulse

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        const pulseOpacity = this.opacity * (0.7 + Math.sin(this.pulse) * 0.3);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(255, 255, 255, ${pulseOpacity})`;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reset shadow
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, moodColor + '40');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeMood]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 2, opacity: 0.1, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
        style={{ zIndex: 10 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default AnimatedBackground;
