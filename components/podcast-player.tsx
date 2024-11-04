'use client'

import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export function PodcastPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [question, setQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [showAiResponse, setShowAiResponse] = useState(false)

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (isPlaying) {
      setShowAiResponse(false)
    }
  }

  const handleAskQuestion = () => {
    setIsPlaying(false)
    setShowAiResponse(true)
    // Simulate AI processing time
    setTimeout(() => {
      setAiResponse(`Here's an AI-generated response to your question: "${question}"`)
    }, 1500)
  }

  const resumePodcast = () => {
    setShowAiResponse(false)
    setIsPlaying(true)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">AI-Enhanced Podcast Player</h1>
      
      {/* Podcast Player */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <span className="text-sm">30:00</span>
        </div>
        <Slider
          value={[currentTime]}
          max={1800}
          step={1}
          onValueChange={(value) => setCurrentTime(value[0])}
          className="mb-4"
        />
        <div className="flex justify-center items-center space-x-4">
          <Button variant="outline" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Question Input */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button onClick={handleAskQuestion}>
            <Mic className="h-4 w-4 mr-2" />
            Ask
          </Button>
        </div>
      </div>
      
      {/* AI Response */}
      {showAiResponse && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
          <p className="bg-gray-100 p-3 rounded">{aiResponse || 'Generating response...'}</p>
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