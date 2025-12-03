import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import { fetchNews } from '../utils/aiService';
import { useApp } from '../contexts/AppContext';

const CategoryPage = () => {
  const { category } = useParams();
  const { userPreferences } = useApp();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const strategy = userPreferences?.politicalBalance || 'balanced';
      const data = await fetchNews({ category, personalize: true, strategy });
      setArticles(data.articles || []);
    };
    load();
  }, [category, userPreferences?.politicalBalance]);

  return (
    <AnimatedBackground>
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-white mb-8 capitalize">
          {category} News
        </motion.h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <NewsCard key={i} article={article} index={i} />
          ))}
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default CategoryPage;
