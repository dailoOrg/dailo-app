'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import podcastData from "@/public/data/podcastData.json";

interface PodcastPageProps {
  podcastId: string;
}

export function PodcastPage({ podcastId }: PodcastPageProps) {
  const podcast = podcastData.podcasts.find((p) => p.id === podcastId);

  if (!podcast) {
    return <div>Podcast not found</div>;
  }

  const handlePlayEpisode = (audioFile: string) => {
    // TODO: Implement play functionality
    console.log('Play episode:', audioFile);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Podcast Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{podcast.title}</h1>
        <p className="text-lg text-muted-foreground">{podcast.description}</p>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {podcast.episodes.map((episode) => (
          <Card key={episode.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">
                {episode.title}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {episode.duration}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {episode.description}
              </p>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handlePlayEpisode(episode.audioFile)}
              >
                <PlayCircle size={20} />
                Play Episode
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 