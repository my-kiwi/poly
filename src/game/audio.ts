import * as THREE from 'three';

const url = './audio/joshua_moses_where_we_end_up.mp3';

const audioListener = new THREE.AudioListener();
const audioContext = audioListener.context;

const audioElement = document.createElement('audio');
audioElement.src = url;
audioElement.loop = true;
audioElement.crossOrigin = 'anonymous';
audioElement.preload = 'auto';
audioElement.volume = 0.1;
audioElement.setAttribute('playsinline', '');
audioElement.setAttribute('webkit-playsinline', '');

const sound = new THREE.Audio(audioListener);
sound.setMediaElementSource(audioElement);

export const startAudio = async () => {
  try {
    await audioContext.resume();
    await audioElement.play();
    sound.setVolume(1);
    console.log('Audio started!');
    return new THREE.AudioAnalyser(sound, 256);
  } catch (error) {
    console.error('Playback failed:', error);
    throw error;
  }
};

export const resumeAudioIfNeeded = async () => {
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Audio context resumed');
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
};
