import React from 'react';
import { motion } from 'framer-motion';
import { moods } from '../utils/mockData';
import { useApp } from '../contexts/AppContext';
import RippleButton from './RippleButton';

const MoodSelector = () => {
  const { currentMood, setCurrentMood } = useApp();

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Choose a Category</h2>
        <p className="text-gray-400">Filter news by topic</p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4">
        {moods.map((mood, index) => {
          const isActive = currentMood === mood.id;
          
          return (
            <RippleButton
              key={mood.id}
              onClick={() => setCurrentMood(mood.id)}
              className={`relative px-6 py-3 rounded-full backdrop-blur-xl transition-all ${
                isActive
                  ? 'bg-white/20 border-2 shadow-lg'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
              style={{
                borderColor: isActive ? mood.color : undefined,
                boxShadow: isActive ? `0 0 30px ${mood.color}40` : undefined
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className="text-white font-semibold">{mood.label}</span>
                </div>
              </motion.div>

              {isActive && (
                <motion.div
                  layoutId="activeMood"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    backgroundColor: mood.color + '20',
                    boxShadow: `0 0 40px ${mood.color}60`
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </RippleButton>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
