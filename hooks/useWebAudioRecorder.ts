import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    WebAudioRecorder: any;
  }
}

interface UseWebAudioRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
}

export function useWebAudioRecorder({
  onRecordingComplete,
  onError,
}: UseWebAudioRecorderOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load the WebAudioRecorder script
    const script = document.createElement("script");
    script.src = "/lib/web-audio-recorder/WebAudioRecorder.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startRecording = async () => {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create source node
      const source = audioContext.createMediaStreamSource(stream);

      // Create and configure recorder
      const recorder = new window.WebAudioRecorder(source, {
        workerDir: "/lib/web-audio-recorder/",
        encoding: "wav",
        numChannels: 1,
        onEncoderLoading: (recorder: any, encoding: string) => {
          console.log("Loading " + encoding + " encoder...");
        },
        onEncoderLoaded: (recorder: any, encoding: string) => {
          console.log(encoding + " encoder loaded");
        },
      });

      recorder.onComplete = (_recorder: any, blob: Blob) => {
        onRecordingComplete(blob);
        setIsRecording(false);
        cleanupRecording();
      };

      recorder.onError = (recorder: any, message: string) => {
        onError(new Error(message));
        setIsRecording(false);
        cleanupRecording();
      };

      recorderRef.current = recorder;
      recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      onError(
        error instanceof Error ? error : new Error("Failed to start recording")
      );
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.finishRecording();
    }
  };

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    recorderRef.current = null;
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
