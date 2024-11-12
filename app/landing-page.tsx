import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import podcastData from "@/public/data/podcastData.json";

export function LandingPage() {
  // Get the first podcast ID for the main CTA button
  const firstPodcastId = podcastData.podcasts[0].id;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-12">
        <Image 
          src="/dailo.svg" 
          alt="Dailo Logo" 
          width={320} 
          height={103} 
          className="mx-auto mb-8 invert"
        />
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Dive into the world of emerging technologies with our curated tech podcasts. 
          Get instant AI-powered insights while you listen.
        </p>
        <div className="pt-4">
          <Link href={`/podcasts/${firstPodcastId}`}>
            <Button size="lg" className="font-semibold">
              Start Listening
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Podcasts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {podcastData.podcasts.map((podcast) => (
          <Link href={`/podcasts/${podcast.id}`} key={podcast.id}>
            <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <CardTitle>{podcast.title}</CardTitle>
                <CardDescription>
                  {`${podcast.episodes.length} episodes`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {podcast.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Additional Feature Highlight */}
      <div className="text-center max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Powered by AI</h2>
        <p className="text-muted-foreground">
          Ask questions, get summaries, and interact with podcast content in real-time using our AI assistant.
        </p>
      </div>
    </div>
  );
} 