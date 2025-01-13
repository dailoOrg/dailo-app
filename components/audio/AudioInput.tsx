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
                const formData = new FormData();
                formData.append('audio', audioBlob, 'audio.wav');

                const response = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Transcription failed: ${response.status}`);
                }

                const { text } = await response.json();
                onTranscription(text);
            } catch (err) {
                console.error('Transcription error:', err);
            } finally {
                onRecordingComplete();
            }
        },
        onError: (error: Error) => {
            console.error("Recording error:", error);
            onRecordingComplete();
        }
    });

    useEffect(() => {
        if (isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }, [isRecording]);

    return null;
} 