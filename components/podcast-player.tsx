'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic, Circle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { podcastQAStreamPrompt } from '@/prompts/podcastQAStreamPrompt'
import AudioInput from './audio/AudioInput'
import StreamingAudioOutput from './audio/StreamingAudioOutput'

interface PodcastPlayerProps {
  title: string;
  audioSrc: string;
  podcastName: string;
  episodeNumber?: string;
  podcastImage: string;
  transcriptFile: string;
}

// Add this enum at the top of the file or in a separate types file
enum PlayerState {
  INITIAL = 'INITIAL',
  PLAYING_PODCAST = 'PLAYING_PODCAST',
  PREPARING_RECORDING = 'PREPARING_RECORDING',
  RECORDING_QUESTION = 'RECORDING_QUESTION',
  WAITING_FOR_RESPONSE = 'WAITING_FOR_RESPONSE',
  AI_RESPONDING = 'AI_RESPONDING'
}

// Add this helper function at the top of the file
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
};

export function PodcastPlayer({
  title,
  audioSrc,
  podcastName,
  episodeNumber,
  podcastImage,
  transcriptFile
}: PodcastPlayerProps) {
  // Add new state for tracking player state
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.INITIAL);

  // Existing states - some of these might be redundant now
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showAiResponse, setShowAiResponse] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [hasPlayedResponse, setHasPlayedResponse] = useState(false);
  const [currentStream, setCurrentStream] = useState<ReadableStream<Uint8Array> | null>(null);

  // Update handlers to manage state transitions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setPlayerState(PlayerState.INITIAL)
      } else {
        audioRef.current.play()
        setPlayerState(PlayerState.PLAYING_PODCAST)
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Update time display
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Set duration when audio loads
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleAskClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setPlayerState(PlayerState.WAITING_FOR_RESPONSE);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setShowAiResponse(false);
      setCurrentStream(null);
      setTranscribedText('');

      // Show preparing state
      setPlayerState(PlayerState.PREPARING_RECORDING);

      // Instead of delaying, start getUserMedia right away to satisfy iOS's requirement
      setIsRecording(true);
      setPlayerState(PlayerState.RECORDING_QUESTION);
    }
  };

  const handleTranscription = async (text: string) => {
    setTranscribedText(text);
    setPlayerState(PlayerState.WAITING_FOR_RESPONSE);

    if (text?.trim()) {
      await handleAskQuestion(text);
    } else {
      setPlayerState(PlayerState.INITIAL);
    }
  };

  const handleAskQuestion = async (text: string) => {
    try {
      if (!transcriptFile) {
        throw new Error('No transcript file available');
      }

      const transcript = await fetchTranscript(transcriptFile);

      setShowAiResponse(true);
      setHasPlayedResponse(false);
      setPlayerState(PlayerState.AI_RESPONDING);

      const response = await fetch('/api/openai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            ...podcastQAStreamPrompt,
            userPrompt: podcastQAStreamPrompt.userPrompt(transcript, text)
          }
        }),
      });

      if (!response.ok) throw new Error('Stream request failed');

      const stream = response.body;
      if (stream) {
        setCurrentStream(stream);
      }
    } catch (error) {
      setPlayerState(PlayerState.INITIAL);
    }
  };

  const handleRecordingComplete = () => {
    setIsRecording(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Try to get duration immediately if available
      if (audio.duration) {
        setDuration(audio.duration);
      }

      // Also set up a timeout to check again after a short delay
      const timer = setTimeout(() => {
        if (audio.duration) {
          setDuration(audio.duration);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Helper function to render controls based on state
  const renderControls = () => {
    switch (playerState) {
      case PlayerState.PREPARING_RECORDING:
        return (
          <Button
            size="icon"
            disabled
            className="rounded-full bg-gray-300"
          >
            <span className="animate-spin">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          </Button>
        );

      case PlayerState.AI_RESPONDING:
        return (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white hover:bg-gray-100"
            onClick={() => {
              setShowAiResponse(false);
              setCurrentStream(null);
              setPlayerState(PlayerState.INITIAL);
            }}
          >
            <X className="h-6 w-6 text-black" />
          </Button>
        );

      case PlayerState.RECORDING_QUESTION:
        return (
          <Button
            size="icon"
            onClick={handleAskClick}
            className="rounded-full bg-red-500 hover:bg-red-600"
          >
            <Circle className="h-4 w-4 fill-white" />
          </Button>
        );

      case PlayerState.WAITING_FOR_RESPONSE:
        return (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white hover:bg-gray-100"
            onClick={() => {
              setShowAiResponse(false);
              setPlayerState(PlayerState.INITIAL);
            }}
          >
            <X className="h-6 w-6 text-black" />
          </Button>
        );

      default:
        return (
          <>
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="rounded-full bg-white hover:bg-gray-100"
            >
              {isPlaying ?
                <Pause className="h-6 w-6 text-black" /> :
                <Play className="h-6 w-6 text-black" />
              }
            </Button>
            <Button
              size="icon"
              onClick={handleAskClick}
              className="rounded-full bg-white hover:bg-gray-100"
            >
              <Mic className="h-6 w-6 text-black" />
            </Button>
          </>
        );
    }
  };

  const fetchTranscript = async (transcriptFile: string) => {
    try {
      const response = await fetch(transcriptFile);
      if (!response.ok) throw new Error('Failed to fetch transcript');
      return await response.text();
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return '';
    }
  };

  return (
    <div className="py-2 md:py-4 bg-black">
      <div className="flex items-start space-x-2 md:space-x-6">
        {/* Podcast Image */}
        <div className="flex-shrink-0">
          <img
            src={podcastImage}
            alt={podcastName}
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-shrink min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100vw - 240px)' }}>
              <div className="flex-shrink min-w-0">
                <h2 className="text-sm text-gray-400 mb-1 truncate">
                  {podcastName} {episodeNumber && `#${episodeNumber}`}
                </h2>
                <h1 className="md:text-lg text-sm truncate font-semibold text-white">{title}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              {renderControls()}
            </div>
          </div>

          {/* Slider and other elements */}
          <div>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => handleSliderChange(value)}
              className="mb-2 [&_.relative]:bg-gray-800 [&_[data-disabled]]:bg-gray-800 [&_.absolute]:bg-red-500 [&_[role=slider]]:bg-red-500"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
              <span className="text-sm text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element - keeping it directly in the component */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hidden but functional audio components */}
      <div className="hidden">
        <AudioInput
          isRecording={isRecording}
          onTranscription={handleTranscription}
          onRecordingComplete={handleRecordingComplete}
        />
        {showAiResponse && (
          <StreamingAudioOutput
            stream={currentStream}
            onComplete={() => {
              setHasPlayedResponse(true);
              setShowAiResponse(false);
              setPlayerState(PlayerState.INITIAL);
              setCurrentStream(null);
            }}
          />
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}