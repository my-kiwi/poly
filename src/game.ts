import * as THREE from 'three';
import { AudioAnalyser, AudioListener, MeshStandardMaterial, Vector3 } from 'three';

import { initializeAudio } from './game/audio';
import {
  createCamera,
  createPolygon,
  createRenderer,
  createScene,
  renderFrame,
  resizeRenderer,
  setupEnvironment,
} from './game/scene';
import { createCity, neonColors, updateAudioReactiveElements } from './game/city';

const container = document.getElementById('game')!;
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(container);
const audioListener = new AudioListener();

camera.add(audioListener);

let analyser: AudioAnalyser | undefined;
const { startAudio } = initializeAudio(audioListener, (audioAnalyser) => {
  analyser = audioAnalyser;
});

createCity(scene);
setupEnvironment(scene);
const polygon = createPolygon(scene);

let gameStarted = false;
let isAnimatingToGame = false;
let animationProgress = 0;
const finalCameraPos = { x: 0, y: 6, z: 20 };
const startCameraPos = { x: 0, y: 5, z: 60 };
let currentColorIndex = 0;
let nextColorIndex = 1;
let colorLerpProgress = 0;

const resize = () => resizeRenderer(renderer, camera, container);
window.addEventListener('resize', resize);
resize();

const animate = () => {
  const time = performance.now() * 0.0001;

  if (isAnimatingToGame) {
    animationProgress += 0.01;
    if (animationProgress >= 1) {
      animationProgress = 1;
      isAnimatingToGame = false;
    }

    camera.position.x = THREE.MathUtils.lerp(startCameraPos.x, finalCameraPos.x, animationProgress);
    camera.position.y = THREE.MathUtils.lerp(startCameraPos.y, finalCameraPos.y, animationProgress);
    camera.position.z = THREE.MathUtils.lerp(startCameraPos.z, finalCameraPos.z, animationProgress);

    const opacity = 1 - animationProgress;
    (polygon.material as MeshStandardMaterial).opacity = opacity;
    (polygon.material as MeshStandardMaterial).emissiveIntensity = 0.8 * opacity;
  } else if (gameStarted) {
    camera.position.x = Math.sin(time) * 12;
    camera.position.z = Math.cos(time) * 20;
    camera.position.y = 6 + Math.sin(time * 0.8) * 0.6;

    if (analyser) {
      try {
        updateAudioReactiveElements(analyser);
      } catch (error) {
        console.error('Audio processing error', error);
      }
    }
  }

  camera.lookAt(new Vector3(0, 3, 0));

  if (isAnimatingToGame || !gameStarted) {
    polygon.rotation.x += 0.001;
    polygon.rotation.y += 0.0008;
    polygon.rotation.z += 0.006;

    colorLerpProgress += 0.005;
    if (colorLerpProgress >= 1) {
      currentColorIndex = nextColorIndex;
      nextColorIndex = (nextColorIndex + 1) % neonColors.length;
      colorLerpProgress = 0;
    }

    const currentColor = neonColors[currentColorIndex];
    const nextColor = neonColors[nextColorIndex];
    const lerpedColor = new THREE.Color(currentColor).lerp(
      new THREE.Color(nextColor),
      colorLerpProgress
    );
    (polygon.material as MeshStandardMaterial).color.copy(lerpedColor);
    (polygon.material as MeshStandardMaterial).emissive.copy(lerpedColor);
  }

  renderFrame(renderer, scene, camera);
  requestAnimationFrame(animate);
};

const startGame = () => {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  isAnimatingToGame = true;
  window.removeEventListener('click', startGame);
  window.removeEventListener('touchstart', startGame);
  window.removeEventListener('pointerdown', startGame);
  void startAudio();
};

window.addEventListener('click', startGame);
window.addEventListener('touchstart', startGame);
window.addEventListener('pointerdown', startGame);

animate();

if (new URLSearchParams(window.location.search).get('autoplay') === 'true') {
  startGame();
}

console.log('Game initialized - click the polygon to start audio');
