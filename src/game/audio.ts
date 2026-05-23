import { AudioAnalyser, AudioListener } from 'three';
import * as THREE from 'three';
import { createAudioPlaybackController } from '../audioPlayback';

export const initializeAudio = (
  audioListener: AudioListener,
  onStarted: (analyser: AudioAnalyser) => void
) => {
  const audioElement = new Audio('./audio/joshua_moses_where_we_end_up.mp3');
  audioElement.loop = true;
  audioElement.crossOrigin = 'anonymous';
  audioElement.preload = 'auto';
  audioElement.setAttribute('playsinline', '');

  const sound = new THREE.Audio(audioListener);
  sound.setMediaElementSource(audioElement);

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
