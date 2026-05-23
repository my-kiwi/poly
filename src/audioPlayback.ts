export type AudioContextLike = {
  state: AudioContextState;
  resume: () => Promise<void>;
};

export type AudioElementLike = {
  play: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

export type AudioPlaybackController = {
  attachCanPlayRetry: () => void;
  detachCanPlayRetry: () => void;
  hasStarted: () => boolean;
  isStarting: () => boolean;
  start: () => Promise<void>;
};

export const createAudioPlaybackController = ({
  audioContext,
  audioElement,
  onError,
  onStarted,
}: {
  audioContext: AudioContextLike;
  audioElement: AudioElementLike;
  onError?: (error: unknown) => void;
  onStarted?: () => void;
}): AudioPlaybackController => {
  let hasStartedPlayback = false;
  let isStartingPlayback = false;
  let shouldRetryAfterCanPlay = false;

  const retryIfNeeded = () => {
    if (!shouldRetryAfterCanPlay || hasStartedPlayback || isStartingPlayback) {
      return;
    }

    void start();
  };

  const start = async () => {
    if (hasStartedPlayback || isStartingPlayback) {
      return;
    }

    isStartingPlayback = true;

    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      await audioElement.play();
      hasStartedPlayback = true;
      shouldRetryAfterCanPlay = false;
      onStarted?.();
    } catch (error) {
      shouldRetryAfterCanPlay = true;
      onError?.(error);
      throw error;
    } finally {
      isStartingPlayback = false;
    }
  };

  return {
    attachCanPlayRetry: () => {
      audioElement.addEventListener('canplaythrough', retryIfNeeded);
    },
    detachCanPlayRetry: () => {
      audioElement.removeEventListener('canplaythrough', retryIfNeeded);
    },
    hasStarted: () => hasStartedPlayback,
    isStarting: () => isStartingPlayback,
    start,
  };
};
