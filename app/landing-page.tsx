'use client';

import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import podcastData from "@/public/data/podcastData.json";
import { useEffect, useState } from 'react';



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

      <div className="-mx-4 px-4 flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-4 md:gap-6 pb-6 md:pb-0 items-stretch">
        {podcastData.podcasts.map((podcast) => (
          <Link
            href={`/podcasts/${podcast.id}`}
            key={podcast.id}
            className="block w-64 min-w-[280px] md:min-w-0 md:w-full snap-center"
          >
            <Card className="hover:shadow-md transition-shadow bg-[#F5F5F4] p-4 h-full">
              <div className="flex md:flex-row flex-col gap-4 md:gap-6 h-full">
                <img
                  src={podcast.image}
                  alt={`${podcast.title} cover`}
                  className="w-full md:w-48 aspect-square md:h-48 rounded-sm flex-shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex-1">
                    <h2 className="font-medium text-black text-base mb-1">{podcast.title}</h2>
                    <p className="text-sm text-black">{podcast.description}</p>
                  </div>
                  <p className="text-xs font-medium text-black mt-4">
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