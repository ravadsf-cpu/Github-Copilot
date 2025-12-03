"use client";
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type Article = {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  lean?: 'LEFT' | 'RIGHT' | 'CENTER';
};

export default function ArticleCardNeon({ article }: { article: Article }) {
  const glow = article.lean === 'LEFT' ? 'shadow-[0_0_30px_rgba(59,130,246,0.5)]' : article.lean === 'RIGHT' ? 'shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'shadow-[0_0_30px_rgba(251,191,36,0.5)]';
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('block rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition', glow)}
      whileHover={{ y: -4 }}
    >
      <div className="flex gap-4 items-start">
        {article.imageUrl && (
          <img src={article.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg" />
        )}
        <div>
          <h3 className="text-lg font-semibold">{article.title}</h3>
          {article.description && (
            <p className="text-sm text-white/70 mt-1 line-clamp-3">{article.description}</p>
          )}
        </div>
      </div>
    </motion.a>
  );
}
