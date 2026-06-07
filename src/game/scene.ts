import {
  CanvasTexture,
  FogExp2,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  WebGPURenderer,
  Scene,
} from 'three/webgpu';
import { Colors } from './city';

export const createGradientSkyTexture = (color1: number, color2: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Convert hex colors to RGB strings
  const hexToRgb = (hex: number) => {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Create vertical gradient from top (color1) to bottom (color2)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, hexToRgb(color1));
  gradient.addColorStop(1, hexToRgb(color2));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new CanvasTexture(canvas);
};

// Interpolate between two hex colors
const interpolateColor = (color1: number, color2: number, t: number): number => {
  const r1 = (color1 >> 16) & 255;
  const g1 = (color1 >> 8) & 255;
  const b1 = color1 & 255;

  const r2 = (color2 >> 16) & 255;
  const g2 = (color2 >> 8) & 255;
  const b2 = color2 & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
};

const colorArray = Object.values(Colors);

export const updateSkyGradient = (scene: Scene, elapsedTime: number) => {
  // Cycle through colors every 10 seconds
  const cycleDuration = 10000;
  const cycleProgress = (elapsedTime % cycleDuration) / cycleDuration;
  const colorIndex = Math.floor(cycleProgress * colorArray.length);
  const nextColorIndex = (colorIndex + 1) % colorArray.length;

  // Interpolate between current and next color
  const localProgress = (cycleProgress * colorArray.length) % 1;
  const color1 = interpolateColor(
    colorArray[colorIndex],
    colorArray[nextColorIndex],
    localProgress
  );
  const color2 = interpolateColor(
    colorArray[nextColorIndex],
    colorArray[(nextColorIndex + 1) % colorArray.length],
    localProgress
  );

  scene.background = createGradientSkyTexture(color1, color2);
};

export const createScene = () => {
  const scene = new Scene();
  scene.fog = new FogExp2(0x07061a, 0.028);
  return scene;
};

export const createRenderer = (container: HTMLElement) => {
  const renderer = new WebGPURenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  return renderer;
};

export const setupEnvironment = (
  scene: Scene,
  skyColor1: number = 0x07061a,
  skyColor2: number = 0x1a0e3a
) => {
  // Set up gradient sky
  scene.background = createGradientSkyTexture(skyColor1, skyColor2);
  const ground = new Mesh(
    new PlaneGeometry(150, 150),
    new MeshPhysicalMaterial({
      color: 0x050613,
      emissive: 0x0b0e2b,
      roughness: 0.88,
      metalness: 0.1,
      transmission: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // const grid = new GridHelper(40, 40, 0x45124f, 0x080718);
  // grid.rotation.x = Math.PI / 2;
  // grid.position.y = 0.01;
  // scene.add(grid);

  // const grid2 = new GridHelper(40, 40, 0x45124f, 0x080718);
  // grid2.rotation.x = Math.PI / 2;
  // grid2.position.y = 0.01;
  // grid2.rotation.z = Math.PI / 2;
  // scene.add(grid2);

  const keyLight = new PointLight(0x9a53ff, 0.1, 25, 2);
  keyLight.position.set(-12, 12, 10);
  // scene.add(keyLight);

  const fillLight = new PointLight(0x33b2ff, 0.1, 20, 2);
  fillLight.position.set(10, 8, -12);
  // scene.add(fillLight);
  // const radius = 10;
  // const sectors = 16;
  // const rings = 8;
  // const divisions = 64;
  // const helper = new THREE.PolarGridHelper(radius, sectors, rings, divisions);
  // scene.add(helper);

  // const axesHelper = new THREE.AxesHelper(50);
  // scene.add(axesHelper);

  // const dir = new THREE.Vector3( 1, 2, 0 );
  // //normalize the direction vector (convert to vector of length 1)
  // dir.normalize();
  // const origin = new THREE.Vector3( 0, 0, 0 );
  // const length = 1;
  // const hex = 0xffff00;
  // const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  // scene.add( arrowHelper );
};

export const resizeRenderer = (
  renderer: WebGPURenderer,
  camera: PerspectiveCamera,
  container: HTMLElement
) => {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

export const renderFrame = (renderer: WebGPURenderer, scene: Scene, camera: PerspectiveCamera) => {
  renderer.render(scene, camera);
};
