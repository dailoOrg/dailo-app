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

  // Improved cleanup function
  const cleanup = useCallback(async () => {
    if (cleanupInProgressRef.current) {
      console.log("Cleanup already in progress, waiting...");
      return;
    }

    cleanupInProgressRef.current = true;
    console.log("Starting cleanup of recording resources...");

    try {
      // First stop the MediaRecorder if it's recording
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
          console.log("Stopping active MediaRecorder...");
          mediaRecorderRef.current.stop();
          // Wait a bit for the stop event to fire
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        mediaRecorderRef.current = null;
      }

      // Then stop and cleanup the MediaStream
      if (streamRef.current) {
        console.log("Stopping MediaStream tracks...");
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn("Error stopping track:", e);
          }
        });
        streamRef.current = null;
      }

      // Clear chunks last
      chunksRef.current = [];
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      cleanupInProgressRef.current = false;
      setIsRecording(false);
      console.log("Cleanup completed");
    }
  }, []);

  // Enhanced startRecording
  const startRecording = async () => {
    try {
      // Ensure previous recording is cleaned up
      await cleanup();

      console.log("Starting recording...");
      const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            sampleSize: 16,
          },
        })
        .catch((err) => {
          console.error("getUserMedia error:", {
            name: err.name,
            message: err.message,
            constraint: err.constraint,
            stack: err.stack,
          });
          throw err;
        });

      // Store stream before creating MediaRecorder
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up event handlers before starting
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        const error = (event as any).error;
        console.error("MediaRecorder error:", {
          error,
          type: event.type,
          message: error?.message || "Unknown error",
          state: mediaRecorder.state,
          mimeType: mediaRecorder.mimeType,
          stack: error?.stack,
        });
        cleanup();
      };

      mediaRecorder.onstop = async () => {
        // Check if we have any data before creating blob
        if (chunksRef.current.length === 0) {
          console.error("No audio data collected during recording");
          onError(new Error("No audio data collected"));
          return;
        }

        try {
          const blob = new Blob(
            chunksRef.current,
            mimeType ? { type: mimeType } : undefined
          );

          if (blob.size === 0) {
            throw new Error("Created audio blob is empty");
          }

          // Call onRecordingComplete before cleanup
          onRecordingComplete(blob);
        } catch (error) {
          console.error("Error processing recording:", error);
          onError(error instanceof Error ? error : new Error(String(error)));
        } finally {
          // Clean up after processing the recording
          await cleanup();
        }
      };

      // Start recording
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      await cleanup();
      console.error("Recording error:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
        type: error?.constructor?.name || typeof error,
      });
      onError(
        error instanceof Error ? error : new Error("Failed to start recording")
      );
    }
  };

  // Simplified stopRecording that just triggers MediaRecorder stop
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      console.log("Stopping recording...");
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
