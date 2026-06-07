import * as THREE from 'three/webgpu';
import { AudioAnalyser, AudioListener } from 'three/webgpu';
import { resumeAudioIfNeeded, startAudio } from './game/audio';
import { requestWakeLock } from './utils/screen-lock';

import {
  createRenderer,
  createScene,
  renderFrame,
  resizeRenderer,
  setupEnvironment,
  updateSkyGradient,
} from './game/scene';
import { createCity, updateAudioReactiveElements, Colors } from './game/city';
import { addClickListener, removeClickListener } from './utils/events';
import { createCamera, createControls } from './game/camera';

const container = document.getElementById('game')!;
const scene = createScene();
const renderer = await createRenderer(container);
const camera = createCamera();
const controls = createControls(camera, renderer);

const audioListener = new AudioListener();

camera.add(audioListener);

let analyser: AudioAnalyser | undefined;

createCity(scene);
setupEnvironment(scene, Colors.magenta, Colors.cyan);
// const { polygon, update: updatePolygonAnimation } = createPolygon(scene);

let gameStarted = false;
let isAnimatingToGame = false;
let animationProgress = 0;
let lastFrameTime = 0;
const startCameraPos = camera.position.clone();
const finalCameraPos = startCameraPos.clone().setY(0.1).setZ(20);

const resize = () => resizeRenderer(renderer, camera, container);
window.addEventListener('resize', resize);
resize();

const animate = (time: number) => {
  const deltaTime = time - lastFrameTime;
  lastFrameTime = time;

  updateSkyGradient(scene, time);
  updateAudioReactiveElements(analyser);
  if (isAnimatingToGame) {
    animationProgress += deltaTime * 0.0002;
    if (camera.position.y <= 2) {
      animationProgress = 1;
      isAnimatingToGame = false;
    }
    if (animationProgress > 1) {
      animationProgress = 1;
    }
    camera.position.x = THREE.MathUtils.lerp(startCameraPos.x, finalCameraPos.x, animationProgress);
    camera.position.y = THREE.MathUtils.lerp(startCameraPos.y, finalCameraPos.y, animationProgress);
    camera.position.z = THREE.MathUtils.lerp(startCameraPos.z, finalCameraPos.z, animationProgress);
    controls.lookAt(0, 3, 0);
    // // camera.lookAt(finalCameraPos);
  } else if (gameStarted) {
    // console.log('Animating game...', camera.position);
    camera.position.y = 1; //6 + Math.sin(time * 0.8) * 0.6;
  }

  // camera.lookAt(new Vector3(0, 3, 0));
  controls.update(deltaTime);
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
