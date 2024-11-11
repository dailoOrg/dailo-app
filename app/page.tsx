'use client';
import { PodcastPlayer } from '@/components/podcast-player';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-[500px] px-4">
        <PodcastPlayer 
          title="AI Podcast - Episode 1" 
          audioSrc="/audio/podcast.mp3"
        />
      </div>
    </main>
  );
}