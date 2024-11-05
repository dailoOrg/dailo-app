'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useOpenAI } from '@/hooks/useOpenAI'
import { podcastQAPrompt } from '@/prompts/podcastQAPrompt'
import { podcastTranscript } from '@/data/podcastTranscript'
import AudioInput from './AudioInput'
import AudioOutput from './AudioOutput'

interface QAResponse {
  answer: string;
  confidence: number;
}

interface PodcastPlayerProps {
  title: string;
  audioSrc: string;
}

export function PodcastPlayer({ title, audioSrc }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [question, setQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [showAiResponse, setShowAiResponse] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { result, loading, error, generateResponse } = useOpenAI<QAResponse>();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

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

  // Skip forward/backward
  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds
    }
  }

  const handleAskQuestion = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setShowAiResponse(true);

    const prompt = {
      ...podcastQAPrompt,
      userPrompt: podcastQAPrompt.userPrompt(podcastTranscript, text)
    };

    await generateResponse(prompt);
  };

  const resumePodcast = () => {
    setShowAiResponse(false)
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Podcast Player */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSliderChange}
          className="mb-4"
        />
        <div className="flex justify-center items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => handleSkip(-10)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleSkip(10)}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Voice Input Section */}
      <div className="mb-6">
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleAskClick}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Ask Question'}
          </Button>
          {isRecording && (
            <span className="text-sm text-red-500 animate-pulse">
              Recording... Click button to stop
            </span>
          )}
          {transcribedText && !isRecording && (
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm text-gray-600">Your question:</p>
              <p>{transcribedText}</p>
            </div>
          )}
        </div>
        <AudioInput 
          isRecording={isRecording}
          onTranscription={handleTranscription}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>
      
      {/* AI Response */}
      {showAiResponse && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">AI Response:</h2>
            {result && <AudioOutput text={result.answer} />}
          </div>
          {loading ? (
            <p className="bg-gray-100 p-3 rounded">Generating response...</p>
          ) : error ? (
            <p className="bg-red-100 p-3 rounded text-red-600">{error}</p>
          ) : result ? (
            <div className="bg-gray-100 p-3 rounded">
              <p>{result.answer}</p>
              <p className="text-sm text-gray-500 mt-2">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            </div>
          ) : null}
          <Button onClick={resumePodcast} className="mt-2">
            Resume Podcast
          </Button>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}