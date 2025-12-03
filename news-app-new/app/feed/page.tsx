import TrendingTicker from '@/components/TrendingTicker';
import ArticleCardNeon from '@/components/ArticleCardNeon';
import { getArticles } from '@/lib/api';

export default async function FeedPage() {
  const articles = await getArticles();

  return (
    <main className="px-4 py-6 max-w-5xl mx-auto">
      <TrendingTicker headlines={articles.slice(0, 10).map(a => a.title)} />
      <div className="grid gap-6 mt-6">
        {articles.map((a) => (
          <ArticleCardNeon key={a.id} article={a} />
        ))}
      </div>
    </main>
  );
}
