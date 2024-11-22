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
}

export function PodcastPlayer({ title, audioSrc }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showAiResponse, setShowAiResponse] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [hasPlayedResponse, setHasPlayedResponse] = useState(false);
  const [currentStream, setCurrentStream] = useState<ReadableStream<Uint8Array> | null>(null);

  // Handle audio play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
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
      setShowAiResponse(true);
      
      const stream = response.body;
      if (stream) {
        setCurrentStream(stream);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTranscription = (text: string) => {
    setTranscribedText(text);
    handleAskQuestion(text);
  };

  const handleAskClick = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setTranscribedText('');
      setIsRecording(true);
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

  return (
    <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Top section with title and controls */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center space-x-4">
          {showAiResponse && !hasPlayedResponse ? (
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => {
                setShowAiResponse(false);
                setCurrentStream(null);
              }}
            >
              <X className="h-6 w-6" />
            </Button>
          ) : (
            <>
              <Button size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button 
                size="icon" 
                onClick={handleAskClick}
                className={isRecording ? 'bg-red-300 hover:bg-red-400' : ''}
              >
                {isRecording ? (
                  <Circle className="h-4 w-4 fill-white" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </>
          )}
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
      
      {/* Slider and time */}
      <div>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={(value) => handleSliderChange(value)}
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
          <span className="text-sm text-gray-500">{formatTime(duration)}</span>
        </div>
      </div>

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