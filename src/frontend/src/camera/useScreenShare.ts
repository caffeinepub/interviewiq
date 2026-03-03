import { useCallback, useEffect, useRef, useState } from "react";

export interface ScreenShareState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startScreenShare: () => Promise<boolean>;
  stopScreenShare: () => Promise<void>;
}

export function useScreenShare(): ScreenShareState {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (isMountedRef.current) {
      setIsActive(false);
    }
  }, []);

  const startScreenShare = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Clean up any existing stream
      cleanup();

      if (!navigator.mediaDevices?.getDisplayMedia) {
        setError("Screen sharing is not supported in this browser.");
        return false;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (!isMountedRef.current) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        return false;
      }

      streamRef.current = stream;

      // Listen for the user stopping screen share via browser UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          if (isMountedRef.current) {
            setIsActive(false);
            streamRef.current = null;
          }
        });
      }

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (_playErr) {
          // Autoplay may fail — ignore
        }
      }

      if (isMountedRef.current) {
        setIsActive(true);
      }

      return true;
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const e = err as { name?: string; message?: string };
        if (e.name === "NotAllowedError") {
          setError("Screen share permission denied.");
        } else {
          setError(e.message ?? "Failed to start screen share.");
        }
      }
      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading, cleanup]);

  const stopScreenShare = useCallback(async (): Promise<void> => {
    cleanup();
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, [cleanup]);

  return {
    isActive,
    isLoading,
    error,
    videoRef,
    startScreenShare,
    stopScreenShare,
  };
}
