import * as THREE from 'three';
import { AudioAnalyser, AudioListener } from 'three';
import { resumeAudioIfNeeded, startAudio } from './game/audio';
import { requestWakeLock } from './utils/screen-lock';

import {
  createRenderer,
  createScene,
  renderFrame,
  resizeRenderer,
  setupEnvironment,
} from './game/scene';
import { createCity, updateAudioReactiveElements } from './game/city';
import { addClickListener, removeClickListener } from './utils/events';
import { createCamera } from './game/camera';

const container = document.getElementById('game')!;
const scene = createScene();
const renderer = createRenderer(container);
const { camera, update: updateCamera } = createCamera(renderer);

const audioListener = new AudioListener();

camera.add(audioListener);

let analyser: AudioAnalyser | undefined;

createCity(scene);
setupEnvironment(scene);
// const { polygon, update: updatePolygonAnimation } = createPolygon(scene);

let gameStarted = false;
let isAnimatingToGame = false;
let animationProgress = 0;
let lastFrameTime = 0;
const startCameraPos = camera.position.clone();
const finalCameraPos = startCameraPos.clone().setY(0.5).setZ(20);

const resize = () => resizeRenderer(renderer, camera, container);
window.addEventListener('resize', resize);
resize();

const animate = (time: number) => {
  const deltaTime = time - lastFrameTime;
  lastFrameTime = time;

  updateAudioReactiveElements(analyser);
  if (isAnimatingToGame) {
    animationProgress += deltaTime * 0.0002;
    if (animationProgress >= 1) {
      animationProgress = 1;
      isAnimatingToGame = false;
    }

    camera.position.x = THREE.MathUtils.lerp(startCameraPos.x, finalCameraPos.x, animationProgress);
    camera.position.y = THREE.MathUtils.lerp(startCameraPos.y, finalCameraPos.y, animationProgress);
    camera.position.z = THREE.MathUtils.lerp(startCameraPos.z, finalCameraPos.z, animationProgress);
    // // camera.lookAt(finalCameraPos);
  } else if (gameStarted) {
    camera.position.z += deltaTime * 0.002;
    // camera.position.x = Math.sin(time) * 12;
    // camera.position.z = Math.cos(time) * 20;
    // camera.position.y = 0.1; //6 + Math.sin(time * 0.8) * 0.6;
  }

  // camera.lookAt(new Vector3(0, 3, 0));
  updateCamera();
  renderFrame(renderer, scene, camera);
  renderer.setAnimationLoop(animate);
};

const startGame = async () => {
  console.log('Starting game...');
  // start the animation after a short delay
  setTimeout(() => {
    gameStarted = true;
    isAnimatingToGame = true;
  }, 5500);
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
