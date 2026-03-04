import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  duration: number;
  recordingUri: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  reset: () => void;
  getFormData: () => FormData | null;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Request permissions
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      throw new Error('Microphone permission denied');
    }

    // Configure audio session
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Start recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    recordingRef.current = recording;
    setIsRecording(true);
    setDuration(0);
    setRecordingUri(null);

    // Duration timer
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - start) / 1000));
    }, 500);
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) return null;

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setRecordingUri(uri);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch {
      recordingRef.current = null;
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setRecordingUri(null);
    setDuration(0);
  }, []);

  const getFormData = useCallback((): FormData | null => {
    if (!recordingUri) return null;

    const formData = new FormData();
    const ext = Platform.OS === 'ios' ? 'caf' : 'm4a';
    formData.append('audio', {
      uri: recordingUri,
      name: `recording.${ext}`,
      type: `audio/${ext}`,
    } as any);

    return formData;
  }, [recordingUri]);

  return {
    isRecording,
    duration,
    recordingUri,
    startRecording,
    stopRecording,
    reset,
    getFormData,
  };
}
