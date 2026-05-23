import { AudioAnalyser, AudioListener } from 'three';
import * as THREE from 'three';

export const initializeAudio = (
  audioListener: AudioListener,
  onStarted: (analyser: AudioAnalyser) => void
) => {
  const audioElement = new Audio('./audio/joshua_moses_where_we_end_up.mp3');
  audioElement.loop = true;
  audioElement.crossOrigin = 'anonymous';
  audioElement.preload = 'auto';
  (audioElement as unknown as { playsInline: boolean }).playsInline = true;
  audioElement.setAttribute('playsinline', '');
  audioElement.setAttribute('webkit-playsinline', '');

  const sound = new THREE.Audio(audioListener);
  sound.setMediaElementSource(audioElement);
  sound.setVolume(0.5);

  const audioPlaybackController = createAudioPlaybackController({
    audioContext: audioListener.context,
    audioElement,
    onError: (error) => {
      console.error('Audio start failed', error);
    },
    onStarted: () => {
      onStarted(new AudioAnalyser(sound, 256));
      console.log('Audio started');
    },
  });

  audioPlaybackController.attachCanPlayRetry();

  return {
    startAudio: () => void audioPlaybackController.start(),
  };
};

export const createAudioPlaybackController = ({
  audioContext,
  audioElement,
  onError,
  onStarted,
}: {
  audioContext: AudioContext;
  audioElement: HTMLAudioElement;
  onError?: (error: unknown) => void;
  onStarted?: () => void;
}) => {
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

      if (audioElement.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        audioElement.load();
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
      audioElement.addEventListener('canplay', retryIfNeeded);
      audioElement.addEventListener('canplaythrough', retryIfNeeded);
    },
    detachCanPlayRetry: () => {
      audioElement.removeEventListener('canplay', retryIfNeeded);
      audioElement.removeEventListener('canplaythrough', retryIfNeeded);
    },
    hasStarted: () => hasStartedPlayback,
    isStarting: () => isStartingPlayback,
    start,
  };
};
