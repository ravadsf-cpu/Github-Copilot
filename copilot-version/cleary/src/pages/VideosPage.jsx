import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';

const VideosPage = () => {
  return (
    <AnimatedBackground mood="exciting">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold text-white mb-6">
          AI Video Mode
        </motion.h1>
        <p className="text-gray-400 mb-8">Convert stories into AI-narrated, TikTok-style short videos with motion text. (Coming soon)</p>

        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className="aspect-video rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-gray-400">
              Placeholder Video {i + 1}
            </motion.div>
          ))}
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default VideosPage;
