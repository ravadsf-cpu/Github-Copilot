'use client';

import { motion } from 'framer-motion';

export default function StreakBadge({ days }: { days: number }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-gray-900 border border-neonGold/50 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.2)]"
        >
            <span className="text-xl">🔥</span>
            <div className="flex flex-col leading-none">
                <span className="text-neonGold font-bold text-sm">{days}</span>
                <span className="text-[10px] text-gray-400 uppercase">Day Streak</span>
            </div>
        </motion.div>
    );
}
