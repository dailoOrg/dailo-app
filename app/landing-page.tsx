'use client';

import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import podcastData from "@/public/data/podcastData.json";

export function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-16 max-w-md">
        <Image 
          src="/dailo.svg" 
          alt="Dailo" 
          width={100} 
          height={32} 
          className="mb-4"
          style={{ filter: 'brightness(0)' }}
        />
        <p className="text-2xl font-semibold leading-tight mb-3">
          Dive into the world of emerging technologies with our curated tech podcasts. Get instant{' '}
          <span className="text-red-500">AI-powered insights</span>
          <span className="text-black">*</span> while you listen.
        </p>
        <p className="text-sm text-black">
          * Ask questions, get summaries, and interact with podcast content in real-time using our AI assistant.
        </p>
      </div>

      <div className="space-y-6">
        {podcastData.podcasts.map((podcast) => (
          <Link href={`/podcasts/${podcast.id}`} key={podcast.id} className="block">
            <Card className="hover:shadow-md transition-shadow bg-[#F5F5F4] p-4">
              <div className="flex items-start gap-6">
                <img 
                  src={podcast.image} 
                  alt={`${podcast.title} cover`}
                  className="w-48 h-48 rounded-sm"
                />
                <div className="flex flex-col justify-between h-48 py-2">
                  <div>
                    <h2 className="font-medium text-black text-base mb-1">{podcast.title}</h2>
                    <p className="text-sm text-black">{podcast.description}</p>
                  </div>
                  <p className="text-xs font-medium text-black">
                    {podcast.episodes.length} EPISODES
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 