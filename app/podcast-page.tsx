'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import podcastData from "@/public/data/podcastData.json";
import { PodcastPlayer } from '../components/podcast-player';

interface PodcastPageProps {
  podcastId: string;
}

export function PodcastPage({ podcastId }: PodcastPageProps) {
  const router = useRouter();
  const [selectedEpisode, setSelectedEpisode] = useState<{
    title: string;
    audioFile: string;
    episodeNumber: string;
  } | null>(null);
  const podcast = podcastData.podcasts.find((p) => p.id === podcastId);

  if (!podcast) {
    return <div>Podcast not found</div>;
  }

  const handlePlayEpisode = (title: string, audioFile: string, episodeNumber: string) => {
    setSelectedEpisode({ title, audioFile, episodeNumber });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-200 bg-[#F5F5F4]"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-6 w-6 text-black" />
      </Button>

      {/* Updated Podcast Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="max-w-md text-center">
          <img 
            src={podcast.image} 
            alt={`${podcast.title} cover`}
            className="w-48 h-48 mx-auto mb-6 rounded-lg shadow-lg"
          />
          <h1 className="text-5xl font-extrabold text-black mb-3">{podcast.title}</h1>
          <p className="text-base text-black mb-4">{podcast.description}</p>
          <p className="text-sm font-medium text-black uppercase">
            {podcast.episodes.length} EPISODES
          </p>
        </div>
      </div>

      {/* Podcast Player */}
      {selectedEpisode && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <PodcastPlayer 
              title={selectedEpisode.title}
              audioSrc={selectedEpisode.audioFile}
              podcastName={podcast.title}
              episodeNumber={selectedEpisode.episodeNumber}
              podcastImage="/images/ai-frontiers.png"
            />
          </div>
        </div>
      )}

      {/* Episodes List */}
      <div className="space-y-4 mb-24">
        {podcast.episodes.map((episode) => (
          <Card 
            key={episode.id} 
            className="hover:shadow-md transition-shadow bg-[#F5F5F4] cursor-pointer p-6"
            onClick={() => handlePlayEpisode(episode.title, episode.audioFile, episode.episodeNumber)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
              <div className="text-xs font-medium text-black mb-1">
                EPISODE {episode.episodeNumber}
              </div>
              <div className="text-xs font-medium text-black">
                {episode.duration}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-4">
              <CardTitle className="text-lg font-semibold text-black mb-2">
                {episode.title}
              </CardTitle>
              <p className="text-sm text-black">
                {episode.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 