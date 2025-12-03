'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '../../components/ArticleCard';
import TrendingTicker from '../../components/TrendingTicker';
import { mockArticles, mockHeadlines } from '../../utils/mockData';
import { motion } from 'framer-motion';
import Link from 'next/link';

import ParticleBackground from '../../components/ParticleBackground';
import StreakBadge from '../../components/StreakBadge';

export default function FeedPage() {
    const [articles, setArticles] = useState(mockArticles);

    // Simulate infinite scroll loading
    const loadMore = () => {
        // In a real app, fetch more data here
        console.log('Loading more articles...');
    };

    return (
        <div className="min-h-screen bg-spaceDark pb-20 relative">
            <ParticleBackground />

            <TrendingTicker headlines={mockHeadlines} />

            {/* Header / Nav */}
            <header className="sticky top-10 z-40 bg-spaceDark/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonRed">
                    NEWS FEED
                </h1>
                <div className="flex gap-4 items-center">
                    <StreakBadge days={3} />
                    <Link href="/shorts" className="text-gray-400 hover:text-neonGold transition-colors font-semibold">
                        Shorts
                    </Link>
                    <button className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Feed */}
            <main className="max-w-2xl mx-auto p-4 space-y-6">
                {articles.map((article, index) => (
                    <ArticleCard
                        key={article.id}
                        {...article}
                        onClick={(id) => console.log(`Clicked article ${id}`)}
                    />
                ))}

                {/* Loading Indicator */}
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
                </div>
            </main>

            {/* Bottom Nav (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gray-800 p-4 flex justify-around md:hidden z-50">
                <Link href="/feed" className="text-neonBlue flex flex-col items-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    <span className="text-xs mt-1">Feed</span>
                </Link>
                <Link href="/shorts" className="text-gray-500 hover:text-neonRed flex flex-col items-center transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs mt-1">Shorts</span>
                </Link>
                <Link href="/profile" className="text-gray-500 hover:text-neonGold flex flex-col items-center transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
