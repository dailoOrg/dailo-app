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
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/wav",
    "", // Let browser choose format
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
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
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Got media stream:", stream.id);

      streamRef.current = stream;
      chunksRef.current = [];

      // Get supported mime type
      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

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

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        onError(new Error("Recording failed"));
        cleanupRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.warn("User blocked microphone access or context not allowed.");
        onError(
          new Error("Microphone access not allowed. Please grant permission.")
        );
      } else {
        console.error("Failed to start recording:", error);
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
