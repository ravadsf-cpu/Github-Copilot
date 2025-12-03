'use client';

import ShortsVideo from '../../components/ShortsVideo';
import { mockShorts } from '../../utils/mockData';
import Link from 'next/link';

export default function ShortsPage() {
    return (
        <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory">
            {/* Back Button */}
            <Link href="/feed" className="fixed top-4 left-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>

            {mockShorts.map((short) => (
                <ShortsVideo
                    key={short.id}
                    {...short}
                />
            ))}

            {/* Loading / End Indicator */}
            <div className="h-screen snap-start flex items-center justify-center bg-black text-gray-500">
                <p>No more shorts for now...</p>
            </div>
        </div>
    );
}
