import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    WebAudioRecorder: any;
  }
}

interface UseWebAudioRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
  onEncoderLoaded?: () => void;
}

export function useWebAudioRecorder({
  onRecordingComplete,
  onError,
  onEncoderLoaded,
}: UseWebAudioRecorderOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load main recorder script
        const mainScript = document.createElement("script");
        mainScript.src = "/lib/web-audio-recorder/WebAudioRecorder.min.js";
        mainScript.async = true;

        // Load WAV worker script
        const wavScript = document.createElement("script");
        wavScript.src = "/lib/web-audio-recorder/WebAudioRecorderWav.min.js";
        wavScript.async = true;

        // Create promises for script loading
        const loadMainScript = new Promise((resolve, reject) => {
          mainScript.onload = resolve;
          mainScript.onerror = () =>
            reject(new Error("Failed to load WebAudioRecorder"));
        });

        const loadWavScript = new Promise((resolve, reject) => {
          wavScript.onload = resolve;
          wavScript.onerror = () =>
            reject(new Error("Failed to load WAV encoder"));
        });

        // Append scripts to document
        document.body.appendChild(mainScript);
        document.body.appendChild(wavScript);

        // Wait for both scripts to load
        await Promise.all([loadMainScript, loadWavScript]);
        setIsScriptLoaded(true);
        onEncoderLoaded?.();
      } catch (error) {
        onError(
          error instanceof Error
            ? error
            : new Error("Failed to load recorder scripts")
        );
      }
    };

    loadScripts();

    return () => {
      const scripts = document.querySelectorAll(
        'script[src*="web-audio-recorder"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  const startRecording = async () => {
    if (!isScriptLoaded) {
      onError(new Error("Recorder not initialized"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const audioContext = new AudioContext({
        sampleRate: 44100, // Standard sample rate that works well across browsers
      });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      const recorder = new window.WebAudioRecorder(source, {
        workerDir: "/lib/web-audio-recorder/",
        encoding: "wav",
        numChannels: 1,
        onEncoderLoading: () => {},
        onEncoderLoaded: () => {},
        options: {
          timeLimit: 120, // 2-minute limit
          encodeAfterRecord: true,
          progressInterval: 1000,
          bufferSize: 2048, // Smaller buffer size for better Safari compatibility
          wav: {
            mimeType: "audio/wav",
          },
        },
      });

      recorder.onComplete = (_recorder: any, blob: Blob) => {
        onRecordingComplete(blob);
        setIsRecording(false);
        cleanupRecording();
      };

      recorder.onError = (_recorder: any, message: string) => {
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
