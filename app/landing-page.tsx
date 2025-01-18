'use client';

import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import podcastData from "@/public/data/podcastData.json";
import { useEffect, useState } from 'react';

const BrowserCompatibilityWarning = () => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Move browser detection inside useEffect
    const getiOSVersion = () => {
      const userAgent = window.navigator.userAgent;
      const match = userAgent.match(/OS (\d+)_/);
      return match ? parseInt(match[1], 10) : null;
    };

    const isSafari = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      return ua.includes('safari') && !ua.includes('chrome');
    };

    const iOSVersion = getiOSVersion();
    const isSafariBrowser = isSafari();

    if (iOSVersion !== null) { // is iOS device
      if (iOSVersion < 18) {
        setMessage('Voice recording requires iOS 18 or later. Please update your device or use a different one.');
      } else if (isSafariBrowser) {
        setMessage('Voice recording is not supported in Safari. Please use Chrome browser.');
      }
    }
  }, []); // Empty dependency array - only runs once on mount

  if (!message) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <BrowserCompatibilityWarning />

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