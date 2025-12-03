"use client";
import { useEffect, useRef } from 'react';

export default function ShortsVideo({ src, title }: { src: string; title?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play(); else el.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="h-screen w-full grid place-items-center bg-black">
      <video ref={ref} src={src} className="max-h-[90vh]" controls playsInline muted />
      {title && <div className="absolute bottom-8 left-8 text-white/80">{title}</div>}
    </div>
  );
}
