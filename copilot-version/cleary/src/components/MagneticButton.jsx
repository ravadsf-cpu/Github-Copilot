import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const MagneticButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  className = '' 
}) => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull effect (stronger when closer)
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    const maxDistance = 150;
    
    if (distance < maxDistance) {
      const pullStrength = 0.3;
      x.set(distanceX * pullStrength);
      y.set(distanceY * pullStrength);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = (e) => {
    // Create ripple effect
    const rect = buttonRef.current.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;

    const newRipple = {
      x: rippleX,
      y: rippleY,
      id: Date.now()
    };

    setRipples([...ripples, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(ripples => ripples.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick && onClick(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl shadow-purple-500/50',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-xl',
    glass: 'bg-white/5 hover:bg-white/10 text-white border border-purple-500/30 backdrop-blur-2xl shadow-2xl shadow-purple-500/20'
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
    xl: 'px-12 py-5 text-xl'
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <motion.button
        ref={buttonRef}
        style={{ x, y }}
        onMouseEnter={() => setIsHovered(true)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative overflow-hidden rounded-2xl font-semibold
          transform transition-all duration-300
          ${variants[variant]}
          ${sizes[size]}
          ${className}
          group
        `}
      >
        {/* Shine effect on hover */}
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={isHovered ? { x: '100%', opacity: [0, 0.5, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />

        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-20 h-20 rounded-full bg-white/30"
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40
            }}
          />
        ))}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {Icon && (
            <motion.span
              animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-5 h-5" />
            </motion.span>
          )}
          {children}
        </span>

        {/* Glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isHovered ? { opacity: 0.4 } : { opacity: 0 }}
          className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl -z-10"
        />
      </motion.button>
    </div>
  );
};

export default MagneticButton;
