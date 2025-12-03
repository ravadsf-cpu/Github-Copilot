'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ArticleProps {
    id: string;
    title: string;
    snippet: string;
    source: string;
    publishedAt: string;
    leaning: 'LEFT' | 'RIGHT' | 'CENTER';
    onClick: (id: string) => void;
}

const leaningColors = {
    LEFT: 'border-neonBlue text-neonBlue',
    RIGHT: 'border-neonRed text-neonRed',
    CENTER: 'border-neonGold text-neonGold',
};

const leaningGlows = {
    LEFT: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    RIGHT: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    CENTER: 'group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]',
};

export default function ArticleCard({ id, title, snippet, source, publishedAt, leaning, onClick }: ArticleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
            className={`group relative bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-xl p-6 cursor-pointer overflow-hidden transition-all duration-300 ${leaningGlows[leaning]}`}
            onClick={() => onClick(id)}
        >
            {/* Leaning Indicator Line */}
            <div className={`absolute top-0 left-0 w-1 h-full ${leaning === 'LEFT' ? 'bg-neonBlue' : leaning === 'RIGHT' ? 'bg-neonRed' : 'bg-neonGold'} opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="ml-4">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${leaningColors[leaning]} bg-opacity-10`}>
                        {leaning}
                    </span>
                    <span className="text-gray-500 text-xs">{publishedAt}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-glow transition-all font-orbitron">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {snippet}
                </p>

                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{source}</span>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
