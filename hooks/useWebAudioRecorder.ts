import { useRef, useEffect, useState } from "react";

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

  // No need for script loading since we're using native APIs
  useEffect(() => {
    // Signal that we're ready immediately since no encoder loading is needed
    onEncoderLoaded?.();
  }, [onEncoderLoaded]);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");

      // First check if we already have permission
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      console.log("Microphone permission status:", permissionStatus.state);

      // Request microphone access with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Specify a higher sample rate
          sampleSize: 16, // Use 16-bit samples
        },
      });

      console.log("Got media stream:", {
        id: stream.id,
        tracks: stream.getAudioTracks().map((track) => ({
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          settings: track.getSettings(),
        })),
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Get supported mime type with more specific codec preferences
      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);

      // Create MediaRecorder with specific options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Specify a higher bitrate
      });

      // Add more detailed error logging
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", {
          error: event.error,
          type: event.type,
          message: event.error?.message,
        });
        onError(
          new Error(
            `Recording failed: ${event.error?.message || "Unknown error"}`
          )
        );
        cleanupRecording();
      };

      // Log data chunks as they come in
      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available:", {
          size: e.data.size,
          type: e.data.type,
          timestamp: new Date().toISOString(),
        });
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Add back the onstop handler
      mediaRecorder.onstop = () => {
        // Use the same mime type for the blob
        const blob = new Blob(
          chunksRef.current,
          mimeType ? { type: mimeType } : undefined
        );
        onRecordingComplete(blob);
        setIsRecording(false);
        cleanupRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        // Try to guide the user
        onError(
          new Error(
            "Microphone access was denied. Please check your browser settings and ensure microphone permissions are granted."
          )
        );
      } else {
        onError(
          error instanceof Error
            ? error
            : new Error("Failed to start recording")
        );
      }

      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}
