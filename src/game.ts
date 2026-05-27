import * as THREE from 'three';
import { AudioAnalyser, AudioListener, MeshStandardMaterial, Vector3 } from 'three';
import { resumeAudioIfNeeded, startAudio } from './game/audio';
import { requestWakeLock } from './utils/screen-lock';

import {
  createCamera,
  createRenderer,
  createScene,
  renderFrame,
  resizeRenderer,
  setupEnvironment,
} from './game/scene';
import { createCity, updateAudioReactiveElements } from './game/city';
import { addClickListener, removeClickListener } from './utils/events';
import { createPolygon } from './game/start-polygon';

const container = document.getElementById('game')!;
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(container);
const audioListener = new AudioListener();

camera.add(audioListener);

let analyser: AudioAnalyser | undefined;

createCity(scene);
setupEnvironment(scene);
const { polygon, update: updatePolygonAnimation } = createPolygon(scene);

let gameStarted = false;
let isAnimatingToGame = false;
let animationProgress = 0;
const finalCameraPos = { x: 0, y: 0.1, z: -20 };
const startCameraPos = { x: 0, y: 0.1, z: 60 };

const resize = () => resizeRenderer(renderer, camera, container);
window.addEventListener('resize', resize);
resize();

const animate = (_time: number) => {
  const time = _time * 0.0001;
  updateAudioReactiveElements(analyser);
  if (isAnimatingToGame) {
    animationProgress += 0.001;
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
    camera.position.y = 0.1; //6 + Math.sin(time * 0.8) * 0.6;
  }

  camera.lookAt(new Vector3(0, 3, 0));

  if (isAnimatingToGame || !gameStarted) {
    updatePolygonAnimation();
  }

  renderFrame(renderer, scene, camera);
  renderer.setAnimationLoop(animate);
};

const startGame = async () => {
  console.log('Starting game...');
  gameStarted = true;
  isAnimatingToGame = true;
  try {
    removeClickListener(startGame);
    analyser = await startAudio();
    addClickListener(resumeAudioIfNeeded);
  } catch (error) {
    console.error('Failed to start game', error);
    addClickListener(startGame);
  }
};

addClickListener(startGame);
addClickListener(requestWakeLock);

animate(0);

if (new URLSearchParams(window.location.search).get('autoplay') === 'true') {
  startGame();
}

console.log('Game initialized - click the polygon to start audio');
