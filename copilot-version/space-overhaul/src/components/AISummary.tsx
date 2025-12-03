'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AISummary({ comments }: { comments: string[] }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {
        setLoading(true);
        // Simulate AI API call
        setTimeout(() => {
            setSummary("Most users are debating the economic impact, with a mix of optimism about new jobs and concern over inflation.");
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-neonGold font-bold text-sm uppercase tracking-wider">AI Discussion Summary</h4>
                <button
                    onClick={generateSummary}
                    disabled={loading || !!summary}
                    className="text-xs bg-neonBlue/20 text-neonBlue px-2 py-1 rounded hover:bg-neonBlue/40 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : summary ? 'Updated' : 'Generate'}
                </button>
            </div>

            <AnimatePresence>
                {summary && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-gray-300 text-sm italic"
                    >
                        "{summary}"
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
