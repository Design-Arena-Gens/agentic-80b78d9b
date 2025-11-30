import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_MIME_TYPE } from "@/lib/audio";

interface UseAudioRecorderOptions {
  onChunk?: (chunk: Blob) => void;
  minRecordingMs?: number;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { onChunk, minRecordingMs = 600 } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(
    null,
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone capture is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      chunksRef.current = [];
      setPermissionError(null);
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: AUDIO_MIME_TYPE,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          onChunk?.(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecordingStartedAt(Date.now());
      setIsRecording(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start recording.";
      setPermissionError(message);
      setIsRecording(false);
    }
  }, [onChunk]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;
    if (!recorder || recorder.state !== "recording") {
      return null;
    }

    const elapsed = recordingStartedAt
      ? Date.now() - recordingStartedAt
      : null;

    const shouldAwait = elapsed !== null && elapsed < minRecordingMs;
    if (shouldAwait) {
      await new Promise((resolve) =>
        setTimeout(resolve, minRecordingMs - elapsed),
      );
    }

    const completion = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: AUDIO_MIME_TYPE });
        stream?.getTracks().forEach((track) => track.stop());
        resolve(blob);
      };
    });

    recorder.stop();
    setIsRecording(false);
    setRecordingStartedAt(null);
    return completion;
  }, [minRecordingMs, recordingStartedAt]);

  return {
    isRecording,
    permissionError,
    startRecording,
    stopRecording,
  };
}
