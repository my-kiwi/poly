import * as THREE from 'three';
import { hideCreditsOverlay, showCreditsOverlay } from './credits';

const url = './audio/joshua_moses_where_we_end_up.mp3';

let audioListener: THREE.AudioListener | null = null;
let audioContext: AudioContext | null = null;
let sound: THREE.Audio | null = null;

const audioElement = document.createElement('audio');
audioElement.src = url;
audioElement.loop = false;
audioElement.crossOrigin = 'anonymous';
audioElement.preload = 'auto';
audioElement.volume = 0.1;
audioElement.setAttribute('playsinline', '');
audioElement.setAttribute('webkit-playsinline', '');

export const startAudio = async () => {
  try {
    audioListener = new THREE.AudioListener();
    audioContext = audioListener.context;
    resumeAudioIfNeeded(); // do not await, sometimes never resolves/reject
    sound = new THREE.Audio(audioListener);
    sound.setMediaElementSource(audioElement);
    await audioElement.play();
    sound.setVolume(1);
    console.log('Audio started!');
    setTimeout(resumeAudioIfNeeded, 1000); // hack
    audioElement.addEventListener('ended', showCreditsOverlay, { once: true });
    hideCreditsOverlay();
    return new THREE.AudioAnalyser(sound, 256);
  } catch (error) {
    console.error('Playback failed:', error);
    throw error;
  }
};

export const resumeAudioIfNeeded = async () => {
  console.log('Attempting to resume audio context if needed...' + audioContext?.state);
  if (audioContext?.state !== 'running') {
    try {
      await audioContext?.resume();
      console.log('Audio context resumed: ' + audioContext?.state);
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
};
