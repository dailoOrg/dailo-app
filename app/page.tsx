'use client';
import { PodcastPlayer } from '@/components/podcast-player';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <PodcastPlayer 
        title="AI Podcast - Episode 1" 
        audioSrc="/audio/podcast.mp3"
      />
    </main>
  );
}