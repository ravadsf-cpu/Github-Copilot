'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaShare, FaBookmark, FaComment } from 'react-icons/fa';

interface ShortProps {
    id: string;
    videoUrl: string;
    title: string;
    source: string;
    duration: number; // seconds
}

export default function ShortsVideo({ id, videoUrl, title, source, duration }: ShortProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0.6,
    });

    // Strict Duration Check (Double Safety)
    if (duration > 150) return null;

    // Strict Content Filter (Double Safety)
    const disallowed = ['never gonna give you up', 'rickroll'];
    if (disallowed.some(term => title.toLowerCase().includes(term))) return null;

    useEffect(() => {
        if (inView) {
            videoRef.current?.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [inView]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        // Trigger particle explosion here
    };

    return (
        <div ref={ref} className="relative w-full h-[calc(100vh-60px)] snap-start bg-black flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlay}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

            {/* Info Overlay */}
            <div className="absolute bottom-20 left-4 right-16 z-10">
                <motion.h3
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-white font-bold text-lg mb-2 text-shadow-md"
                >
                    {title}
                </motion.h3>
                <p className="text-neonBlue font-semibold text-sm">{source}</p>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 flex flex-col gap-6 z-20">
                <ActionButton icon={<FaHeart />} label="Like" active={liked} color="text-neonRed" onClick={handleLike} />
                <ActionButton icon={<FaComment />} label="Comment" />
                <ActionButton icon={<FaBookmark />} label="Save" color="text-neonGold" />
                <ActionButton icon={<FaShare />} label="Share" color="text-neonBlue" />
            </div>

            {/* Play/Pause Indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButton({ icon, label, active = false, color = 'text-white', onClick }: any) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="flex flex-col items-center gap-1"
        >
            <div className={`p-3 rounded-full bg-gray-800/60 backdrop-blur-md ${active ? color : 'text-white'} transition-colors`}>
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </motion.button>
    );
}
