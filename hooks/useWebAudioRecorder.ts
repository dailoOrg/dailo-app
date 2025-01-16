import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    WebAudioRecorder: any;
    AudioContext: typeof AudioContext;
    webkitAudioContext: {
      new (contextOptions?: AudioContextOptions): AudioContext;
    };
  }
}

interface UseWebAudioRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
  onEncoderLoaded?: () => void;
}

interface WebAudioRecorder {
  startRecording: () => void;
  finishRecording: () => void;
  onComplete: (recorder: any, blob: Blob) => void;
  onError: (recorder: any, message: string) => void;
}

const isBrowser = typeof window !== "undefined" && window.AudioContext;

export function useWebAudioRecorder({
  onRecordingComplete,
  onError,
  onEncoderLoaded,
}: UseWebAudioRecorderOptions) {
  if (!isBrowser) {
    return {
      startRecording: () => console.log("Not available in server environment"),
      stopRecording: () => console.log("Not available in server environment"),
      isRecording: false,
    };
  }

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
      } catch (error: unknown) {
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
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.log("WebAudioRecorder: Not in browser environment");
      return;
    }

    if (!isScriptLoaded) {
      onError(new Error("Recorder not initialized"));
      return;
    }

    try {
      // Check if getUserMedia is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Check if AudioContext is available
      const AudioContextClass = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof AudioContext;

      if (!AudioContextClass) {
        throw new Error("AudioContext not supported");
      }

      streamRef.current = stream;
      const audioContext = new AudioContextClass({
        sampleRate: 44100,
      });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      // Create a promise to ensure encoder is fully loaded
      const encoderLoadedPromise = new Promise<WebAudioRecorder>(
        (resolve, reject) => {
          if (!window.WebAudioRecorder) {
            reject(new Error("WebAudioRecorder not loaded"));
            return;
          }

          const recorder = new window.WebAudioRecorder(source, {
            workerDir: "/lib/web-audio-recorder/",
            encoding: "wav",
            numChannels: 1,
            onEncoderLoading: () => {
              console.log("WebAudioRecorder: Encoder loading...");
            },
            onEncoderLoaded: () => {
              console.log("WebAudioRecorder: Encoder loaded");
              resolve(recorder);
            },
            onEncoderError: (err: Error | string) => {
              console.error("WebAudioRecorder: Encoder error:", err);
              reject(err);
            },
            options: {
              timeLimit: 120,
              encodeAfterRecord: true,
              progressInterval: 1000,
              bufferSize: 4096,
              wav: {
                mimeType: "audio/wav",
              },
            },
          });
        }
      );

      try {
        // Wait for encoder to be fully loaded before proceeding
        const recorder = await encoderLoadedPromise;
        recorderRef.current = recorder;

        recorder.onComplete = (_recorder: any, blob: Blob) => {
          console.log("WebAudioRecorder: Recording complete", {
            blobSize: blob.size,
            blobType: blob.type,
            duration: audioContext.currentTime,
          });
          onRecordingComplete(blob);
          setIsRecording(false);
          cleanupRecording();
        };

        recorder.onError = (_recorder: any, message: string) => {
          console.error("WebAudioRecorder: Error during recording:", message);
          onError(new Error(message));
          setIsRecording(false);
          cleanupRecording();
        };

        // Resume audio context
        await audioContext.resume();
        console.log(
          "WebAudioRecorder: Audio context state:",
          audioContext.state
        );

        // Start recording
        console.log("WebAudioRecorder: Starting recording...");
        recorder.startRecording();
        setIsRecording(true);
        console.log("WebAudioRecorder: Recording started");
      } catch (encoderError) {
        console.error("WebAudioRecorder: Encoder setup failed:", encoderError);
        throw encoderError;
      }
    } catch (error) {
      console.error("WebAudioRecorder: Recording setup failed:", error);
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
