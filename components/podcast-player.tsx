'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic, Circle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { podcastQAStreamPrompt } from '@/prompts/podcastQAStreamPrompt'
import { podcastTranscript } from '@/data/podcastTranscript'
import AudioInput from './audio/AudioInput'
import StreamingAudioOutput from './audio/StreamingAudioOutput'

interface PodcastPlayerProps {
  title: string;
  audioSrc: string;
  podcastName: string;
  episodeNumber?: string;
  podcastImage: string;
}

// Add this enum at the top of the file or in a separate types file
enum PlayerState {
  INITIAL = 'INITIAL',
  PLAYING_PODCAST = 'PLAYING_PODCAST',
  RECORDING_QUESTION = 'RECORDING_QUESTION',
  WAITING_FOR_RESPONSE = 'WAITING_FOR_RESPONSE',
  AI_RESPONDING = 'AI_RESPONDING'
}

export function PodcastPlayer({ 
  title, 
  audioSrc, 
  podcastName, 
  episodeNumber,
  podcastImage 
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
      console.log('Audio duration:', audioRef.current.duration);
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

  const handleAskQuestion = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setShowAiResponse(true);
    setHasPlayedResponse(false);
    setPlayerState(PlayerState.AI_RESPONDING);

    try {
      const response = await fetch('/api/openai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: {
            ...podcastQAStreamPrompt,
            userPrompt: podcastQAStreamPrompt.userPrompt(podcastTranscript, text)
          }
        }),
      });

      if (!response.ok) throw new Error('Stream request failed');
      
      const stream = response.body;
      if (stream) {
        setCurrentStream(stream);
      }
    } catch (error) {
      console.error('Error:', error);
      setPlayerState(PlayerState.INITIAL); // Reset state on error
    }
  };

  const handleTranscription = (text: string) => {
    setTranscribedText(text);
    handleAskQuestion(text);
  };

  const handleAskClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setPlayerState(PlayerState.WAITING_FOR_RESPONSE);
    } else {
      setTranscribedText('');
      setIsRecording(true);
      setPlayerState(PlayerState.RECORDING_QUESTION);
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
      case PlayerState.AI_RESPONDING:
        return (
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => {
              setShowAiResponse(false);
              setCurrentStream(null);
              setPlayerState(PlayerState.INITIAL);
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        );
      
      case PlayerState.RECORDING_QUESTION:
        return (
          <Button 
            size="icon" 
            onClick={handleAskClick}
            className="bg-red-300 hover:bg-red-400"
          >
            <Circle className="h-4 w-4 fill-white" />
          </Button>
        );

      case PlayerState.WAITING_FOR_RESPONSE:
        // Show nothing while waiting for response
        return null;
      
      default:
        return (
          <>
            <Button size="icon" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button size="icon" onClick={handleAskClick}>
              <Mic className="h-6 w-6" />
            </Button>
          </>
        );
    }
  };

  return (
    <div className="p-4 bg-black">
      <div className="flex items-start space-x-6">
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
            <div>
              <h2 className="text-sm text-gray-400 mb-1">
                {podcastName} {episodeNumber && `#${episodeNumber}`}
              </h2>
              <h1 className="text-lg font-semibold text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
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
              className="mb-2 [&_.relative]:bg-gray-800 [&_[data-disabled]]:bg-gray-800"
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