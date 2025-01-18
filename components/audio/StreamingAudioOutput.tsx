import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useStreamingTTS } from '@/hooks/useStreamingTTS';

interface StreamingAudioOutputProps {
  stream: ReadableStream<Uint8Array> | null;
  onComplete?: () => void;
}

export default function StreamingAudioOutput({ stream, onComplete }: StreamingAudioOutputProps) {
  const [fullResponse, setFullResponse] = useState<string>('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);

  const {
    processStreamChunk,
    isPlaying,
    currentSentence,
    stop,
    reset
  } = useStreamingTTS({
    onComplete: () => {
      setIsStreamComplete(true);
      onComplete?.();
    }
  });

  useEffect(() => {
    if (!stream) return;

    const decoder = new TextDecoder();
    let canceled = false;
    let accumulatedText = '';

    const processStream = async () => {
      try {
        const reader = stream.getReader();
        reset();

        while (!canceled) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          setFullResponse(accumulatedText);
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
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? stop : undefined}
        >
          {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        {currentSentence && !isStreamComplete && (
          <span className="text-sm text-gray-600">Speaking...</span>
        )}
      </div>
      <div className="bg-gray-100 p-3 rounded">
        <p className="text-sm text-gray-600 mb-2">AI Response:</p>
        {isStreamComplete ? (
          <p>{fullResponse}</p>
        ) : (
          <p>{currentSentence || "..."}</p>
        )}
      </div>
    </div>
  );
} 