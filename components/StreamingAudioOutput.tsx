import { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useStreamingTTS } from '@/hooks/useStreamingTTS';

interface StreamingAudioOutputProps {
  stream: ReadableStream<Uint8Array> | null;
  onComplete?: () => void;
}

export default function StreamingAudioOutput({ stream, onComplete }: StreamingAudioOutputProps) {
  const {
    processStreamChunk,
    isPlaying,
    currentSentence,
    stop,
    reset
  } = useStreamingTTS({
    onComplete: onComplete
  });

  useEffect(() => {
    if (!stream) return;

    const decoder = new TextDecoder();
    let canceled = false;

    const processStream = async () => {
      try {
        const reader = stream.getReader();
        reset();

        while (!canceled) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          await processStreamChunk(chunk);
        }
      } catch (error) {
        console.error('Error processing stream:', error);
      }
    };

    processStream();

    return () => {
      canceled = true;
      reset();
    };
  }, [stream]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={isPlaying ? stop : undefined}
      >
        {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      {currentSentence && (
        <p className="text-sm text-gray-500 italic">
          Currently speaking: {currentSentence}
        </p>
      )}
    </div>
  );
} 