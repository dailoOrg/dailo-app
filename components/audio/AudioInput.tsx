import { useEffect } from 'react';
import { useWebAudioRecorder } from '@/hooks/useWebAudioRecorder';

interface AudioInputProps {
  isRecording: boolean;
  onTranscription: (text: string) => void;
  onRecordingComplete: () => void;
}

export default function AudioInput({ isRecording, onTranscription, onRecordingComplete }: AudioInputProps) {
  const { startRecording, stopRecording } = useWebAudioRecorder({
    onRecordingComplete: async (audioBlob: Blob) => {
      try {
        console.log('AudioInput: Got recording blob', {
          size: audioBlob.size,
          type: audioBlob.type,
          timestamp: new Date().toISOString()
        });

        const permissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName
        });

        if (permissionStatus.state === 'denied') {
          throw new Error('Microphone permission is denied');
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');

        console.log('AudioInput: Sending to transcription API...');
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.status}`);
        }

        const { text } = await response.json();
        console.log('AudioInput: Received transcription:', { text });

        if (!text?.trim()) {
          throw new Error('Empty transcription received');
        }

        onTranscription(text);
      } catch (err) {
        console.error('AudioInput: Error in recording/transcription process:', err);
        setTimeout(() => {
          onRecordingComplete();
        }, 100);
      }
    },
    onError: (error) => {
      console.error('AudioInput: Recording error:', error);
      setTimeout(() => {
        onRecordingComplete();
      }, 100);
    },
    onEncoderLoaded: () => {
      console.log('AudioInput: Encoder loaded and ready');
    }
  });

  useEffect(() => {
    let mounted = true;

    const handleRecording = async () => {
      if (isRecording && mounted) {
        try {
          const permissionStatus = await navigator.permissions.query({
            name: 'microphone' as PermissionName
          });

          if (permissionStatus.state === 'granted') {
            await startRecording();
          } else {
            throw new Error('Microphone permission not granted');
          }
        } catch (error) {
          console.error('Failed to start recording:', error);
          onRecordingComplete();
        }
      } else if (mounted) {
        stopRecording();
      }
    };

    handleRecording();

    return () => {
      mounted = false;
      stopRecording();
    };
  }, [isRecording, startRecording, stopRecording, onRecordingComplete]);

  return null;
} 