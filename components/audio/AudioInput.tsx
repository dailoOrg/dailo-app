import { useRef } from 'react';

interface AudioInputProps {
  isRecording: boolean;
  onTranscription: (text: string) => void;
  onRecordingComplete: () => void;
}

export default function AudioInput({ isRecording, onTranscription, onRecordingComplete }: AudioInputProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mpeg' });
        await handleUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        onRecordingComplete();
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onRecordingComplete();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUpload = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.text) {
        onTranscription(data.text);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
    }
  };

  if (isRecording) {
    startRecording();
  } else if (mediaRecorderRef.current) {
    stopRecording();
  }

  return null;
} 