import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let cube: Mesh | null = null;

const container = document.getElementById('game')!;

scene = new Scene();
scene.background = new Color(0x0a0a1f);

camera = new PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(2, 2, 4);

renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial({ color: 0x4caf50, metalness: 0.4, roughness: 0.7 });
cube = new Mesh(geometry, material);
scene.add(cube);

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const animate = () => {
  if (!renderer || !scene || !camera || !cube) {
    return;
  }

  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.013;
  renderer.render(scene, camera);
};

animate();

const resize = () => {
  if (!renderer || !camera) {
    return;
  }

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', resize);

console.log('Game initialized');
