import ShortsVideo from '@/components/ShortsVideo';
import { getShorts } from '@/lib/api';

export default async function ShortsPage() {
  const shorts = await getShorts();
  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {shorts.map((s) => (
        <div key={s.id} className="snap-start h-screen">
          <ShortsVideo src={s.videoUrl} title={s.title} />
        </div>
      ))}
    </main>
  );
}
