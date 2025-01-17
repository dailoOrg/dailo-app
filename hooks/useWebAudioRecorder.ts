import { useRef, useEffect, useState, useCallback } from "react";

interface UseWebAudioRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
  onEncoderLoaded?: () => void;
}

// Helper function to get supported mime type
const getSupportedMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/mp4;codecs=mp4a.40.2", // AAC
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/wav",
    "", // Browser default as last resort
  ];

  console.log("Checking supported MIME types...");
  for (const type of types) {
    const isSupported = MediaRecorder.isTypeSupported(type);
    console.log(
      `MIME type ${type}: ${isSupported ? "supported" : "not supported"}`
    );
    if (isSupported) {
      return type;
    }
  }
  return "";
};

export function useWebAudioRecorder({
  onRecordingComplete,
  onError,
  onEncoderLoaded,
}: UseWebAudioRecorderOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const cleanupInProgressRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (cleanupInProgressRef.current) {
      console.log('Cleanup already in progress, waiting...');
      return;
    }

    cleanupInProgressRef.current = true;
    console.log('Starting cleanup of recording resources...');

    try {
      // Stop the MediaRecorder if it exists
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('Stopping MediaRecorder...');
        mediaRecorderRef.current.stop();
      }

      // Stop all tracks in the MediaStream
      if (streamRef.current) {
        console.log('Stopping MediaStream tracks...');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          streamRef.current?.removeTrack(track);
        });
      }

      // Clear references
      mediaRecorderRef.current = null;
      streamRef.current = null;
      chunksRef.current = [];
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      cleanupInProgressRef.current = false;
      console.log('Cleanup completed');
    }
  }, []);

  // Enhanced startRecording
  const startRecording = async () => {
    try {
      // Ensure cleanup is complete before starting
      await cleanup();

      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          sampleSize: 16,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.onerror = (event: Event) => {
        const error = (event as any).error;
        console.error("MediaRecorder error:", {
          error,
          type: event.type,
          message: error?.message || "Unknown error",
        });
        cleanup();
        onError(new Error(`Recording failed: ${error?.message || "Unknown error"}`));
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, mimeType ? { type: mimeType } : undefined);
        cleanup().then(() => {
          onRecordingComplete(blob);
          setIsRecording(false);
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);

    } catch (error) {
      await cleanup();
      console.error("Recording error:", error);
      onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  };

  // Enhanced stopRecording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}
