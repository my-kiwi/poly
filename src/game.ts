import {
  // AmbientLight,
  AudioAnalyser,
  AudioListener,
  BoxGeometry,
  Color,
  FogExp2,
  GridHelper,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import * as THREE from 'three';

import { createAudioPlaybackController } from './audioPlayback';

const container = document.getElementById('game')!;

const scene = new Scene();
scene.fog = new FogExp2(0x07061a, 0.028);

const camera = new PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 5, 60);
camera.lookAt(new Vector3(0, 3, 0));

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const audioListener = new AudioListener();
camera.add(audioListener);

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
    analyser = new AudioAnalyser(sound, 256);
    console.log('Audio started');
  },
});
audioPlaybackController.attachCanPlayRetry();

let analyser: AudioAnalyser;

const Colors = {
  blue: 0x4d99ff, // #4d99ff
  purple: 0x9a53ff, // #9a53ff
  green: 0x33ff55, // #33ff55
  pink: 0xff46b0, // #ff46b0
  orange: 0xffaa50, // #ffaa50
};
const neonColors = Object.values(Colors);
type NeonColor = (typeof Colors)[keyof typeof Colors];

const buildingColorsAndMaterials = new Map<NeonColor, MeshStandardMaterial[]>(
  neonColors.map((color) => [color, [] as MeshStandardMaterial[]])
);

const createBuilding = (
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  color: number,
  neon: NeonColor
) => {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshStandardMaterial({
    color,
    emissive: new Color(neon),
    emissiveIntensity: 0.01, // will be updated based on audio
    metalness: 0.2,
    roughness: 0.25,
  });

  const building = new Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  scene.add(building);
  buildingColorsAndMaterials.get(neon)!.push(material);
};

const createCity = () => {
  for (let ix = -7; ix <= 7; ix += 1.5) {
    const rowOffset = ix * 1.2;
    for (let iz = -2; iz <= 4; iz += 1.6) {
      const width = Math.random() * 0.9 + 0.8;
      const depth = Math.random() * 0.9 + 0.8;
      const height = Math.random() * 4 + 2.5 + Math.abs(iz) * 0.8;
      const color = 0x101030;
      const neon = neonColors[Math.floor(Math.random() * neonColors.length)];
      createBuilding(rowOffset, iz * 2.5, width, depth, height, color, neon);
    }
  }
};

const groundGeometry = new PlaneGeometry(40, 60);
const groundMaterial = new MeshStandardMaterial({
  color: 0x050613,
  emissive: new Color(0x0b0e2b),
  roughness: 0.88,
  metalness: 0.1,
});
const ground = new Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

const grid = new GridHelper(40, 40, 0x45124f, 0x080718);
grid.rotation.x = Math.PI / 2;
grid.position.y = 0.01;
scene.add(grid);

// const ambientLight = new AmbientLight(0x8e4ff3, 0.1);
// scene.add(ambientLight);

const keyLight = new PointLight(0x9a53ff, 0.1, 25, 2);
keyLight.position.set(-12, 12, 10);
// scene.add(keyLight);

const fillLight = new PointLight(0x33b2ff, 0.1, 20, 2);
fillLight.position.set(10, 8, -12);
// scene.add(fillLight);

createCity();

// Create the rotating polygon
let gameStarted = false;
const polygonGeometry = new IcosahedronGeometry(3);
const polygonMaterial = new MeshStandardMaterial({
  color: 0x4d99ff,
  emissive: 0x4d99ff,
  emissiveIntensity: 30,
  metalness: 0.1,
  roughness: 1,
  transparent: true,
  opacity: 1,
});
const polygon = new Mesh(polygonGeometry, polygonMaterial);
polygon.position.set(0, 3, 10);
scene.add(polygon);

let currentColorIndex = 0;
let nextColorIndex = 1;
let colorLerpProgress = 0;

// Animation state
let isAnimatingToGame = false;
let animationProgress = 0;
const finalCameraPos = { x: 0, y: 6, z: 20 };
const startCameraPos = { x: 0, y: 5, z: 60 };

const resize = () => {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', resize);
resize();

const animate = () => {
  const time = performance.now() * 0.0001;

  // Handle camera animation when transitioning to game
  if (isAnimatingToGame) {
    animationProgress += 0.01;
    if (animationProgress >= 1) {
      animationProgress = 1;
      isAnimatingToGame = false;
    }

    // Interpolate camera position
    camera.position.x = THREE.MathUtils.lerp(startCameraPos.x, finalCameraPos.x, animationProgress);
    camera.position.y = THREE.MathUtils.lerp(startCameraPos.y, finalCameraPos.y, animationProgress);
    camera.position.z = THREE.MathUtils.lerp(startCameraPos.z, finalCameraPos.z, animationProgress);

    // Fade out polygon
    const opacity = 1 - animationProgress;
    (polygon.material as MeshStandardMaterial).opacity = opacity;
    (polygon.material as MeshStandardMaterial).emissiveIntensity = 0.8 * opacity;
  } else if (gameStarted) {
    // Rotate camera after animation
    camera.position.x = Math.sin(time) * 12;
    camera.position.z = Math.cos(time) * 20;
    camera.position.y = 6 + Math.sin(time * 0.8) * 0.6;
    try {
      updateAudioReactiveElements();
    } catch (error) {
      console.error('Audio processing error', error);
    }
  }

  camera.lookAt(new Vector3(0, 3, 0));

  // Rotate polygon (only visible during animation)
  if (isAnimatingToGame || !gameStarted) {
    polygon.rotation.x += 0.001;
    polygon.rotation.y += 0.0008;
    polygon.rotation.z += 0.006;
  }

  // Smooth color transitions (only during animation/start)
  if (isAnimatingToGame || !gameStarted) {
    colorLerpProgress += 0.005;
    if (colorLerpProgress >= 1) {
      currentColorIndex = nextColorIndex;
      nextColorIndex = (nextColorIndex + 1) % neonColors.length;
      colorLerpProgress = 0;
    }

    const currentColor = neonColors[currentColorIndex];
    const nextColor = neonColors[nextColorIndex];
    const lerpedColor = new Color(currentColor).lerp(new Color(nextColor), colorLerpProgress);
    (polygon.material as MeshStandardMaterial).color.copy(lerpedColor);
    (polygon.material as MeshStandardMaterial).emissive.copy(lerpedColor);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const maxFrequency = 120;
const colorToFrequencyBand = neonColors.reduce((map, color, index) => {
  const start = Math.floor((index / neonColors.length) * maxFrequency);
  const end = Math.floor(((index + 1) / neonColors.length) * maxFrequency);
  return map.set(color, { start, end });
}, new Map());

console.log('Neon colors and their frequency bands:', colorToFrequencyBand);

const updateAudioReactiveElements = () => {
  if (analyser) {
    const dataArray = analyser.getFrequencyData();

    if (dataArray && dataArray.length > 0) {
      // const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      // const averageNormalized = Math.pow(average / 255, 0.5);

      const freqBands = neonColors.map((color) => {
        const { start, end } = colorToFrequencyBand.get(color)!;
        const bandData = dataArray.slice(start, end);
        return {
          color,
          frequency: bandData.length > 0 ? bandData.reduce((a, b) => a + b) / bandData.length : 0,
        };
      });
      buildingColorsAndMaterials.forEach((materials, neon) => {
        materials.forEach((material) => {
          const freqBand = freqBands.find((band) => band.color === neon)?.frequency || 0;
          material.emissiveIntensity = freqBand > 0 ? 0.2 + (freqBand / maxFrequency) * 0.8 : 0;
        });
      });
    }
  }
};

const startAudio = () => {
  void audioPlaybackController.start();
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

// Start the animation loop immediately
animate();

if (new URLSearchParams(window.location.search).get('autoplay') === 'true') {
  startGame();
}

console.log('Game initialized - click the polygon to start audio');
