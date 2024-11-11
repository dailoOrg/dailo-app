import { useState, useRef } from 'react';

interface StreamingTTSOptions {
  onStart?: () => void;
  onSentenceStart?: (sentence: string) => void;
  onSentenceComplete?: (sentence: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useStreamingTTS(options: StreamingTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const audioQueue = useRef<HTMLAudioElement[]>([]);
  const currentAudioIndex = useRef(0);
  const textBuffer = useRef('');

  const splitIntoSentences = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  };

  const createAudioForSentence = async (sentence: string): Promise<HTMLAudioElement> => {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sentence }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return audio;
  };

  const playNextInQueue = () => {
    if (currentAudioIndex.current < audioQueue.current.length) {
      const audio = audioQueue.current[currentAudioIndex.current];
      setCurrentSentence(splitIntoSentences(textBuffer.current)[currentAudioIndex.current] || '');
      
      audio.onended = () => {
        options.onSentenceComplete?.(splitIntoSentences(textBuffer.current)[currentAudioIndex.current]);
        currentAudioIndex.current++;
        playNextInQueue();
      };

      audio.play();
      options.onSentenceStart?.(splitIntoSentences(textBuffer.current)[currentAudioIndex.current]);
    } else {
      setIsPlaying(false);
      setCurrentSentence('');
      options.onComplete?.();
    }
  };

  const processStreamChunk = async (chunk: string) => {
    textBuffer.current += chunk;
    const sentences = splitIntoSentences(textBuffer.current);
    
    // Process only new complete sentences
    while (audioQueue.current.length < sentences.length) {
      const sentenceIndex = audioQueue.current.length;
      try {
        const audio = await createAudioForSentence(sentences[sentenceIndex]);
        audioQueue.current.push(audio);
        
        // Start playing if this is the first sentence and nothing is playing
        if (sentenceIndex === 0 && !isPlaying) {
          setIsPlaying(true);
          options.onStart?.();
          playNextInQueue();
        }
      } catch (error) {
        options.onError?.(error as Error);
      }
    }
  };

  const stop = () => {
    audioQueue.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
    setCurrentSentence('');
    currentAudioIndex.current = audioQueue.current.length; // Skip to end
  };

  const reset = () => {
    stop();
    audioQueue.current = [];
    currentAudioIndex.current = 0;
    textBuffer.current = '';
  };

  return {
    processStreamChunk,
    isPlaying,
    currentSentence,
    stop,
    reset
  };
} 