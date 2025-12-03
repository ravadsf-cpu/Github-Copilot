import React from 'react';

export const ArticleSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden animate-pulse">
    <div className="h-40 bg-white/10" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-24 bg-white/10 rounded" />
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-3 w-5/6 bg-white/10 rounded" />
    </div>
  </div>
);

export const VideoSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden animate-pulse aspect-video" />
);
