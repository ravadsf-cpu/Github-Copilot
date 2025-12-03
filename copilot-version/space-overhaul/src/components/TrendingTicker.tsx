'use client';

import { motion } from 'framer-motion';

interface TickerProps {
    headlines: string[];
}

export default function TrendingTicker({ headlines }: TickerProps) {
    return (
        <div className="w-full bg-black/80 border-b border-gray-800 overflow-hidden py-2 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center">
                <div className="bg-neonRed text-black text-xs font-bold px-3 py-1 ml-2 rounded uppercase animate-pulse">
                    Breaking
                </div>

                <div className="flex-1 overflow-hidden relative h-6 ml-4">
                    <motion.div
                        className="flex gap-8 absolute whitespace-nowrap"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                        {headlines.map((headline, i) => (
                            <span
                                key={i}
                                className="text-sm font-medium text-gray-300 hover:text-neonBlue cursor-pointer transition-colors"
                            >
                                {headline}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
