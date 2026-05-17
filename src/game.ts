import {
  AmbientLight,
  Audio,
  AudioAnalyser,
  AudioListener,
  AudioLoader,
  BoxGeometry,
  Color,
  FogExp2,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

const container = document.getElementById('game')!;

const scene = new Scene();
scene.fog = new FogExp2(0x07061a, 0.028);

const camera = new PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 5, 12);
camera.lookAt(new Vector3(0, 3, 0));

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const audioListener = new AudioListener();
camera.add(audioListener);

const audioLoader = new AudioLoader();
const audio = new Audio(audioListener);
let analyser: AudioAnalyser;

const buildingLights: PointLight[] = [];

const createBuilding = (
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  color: number,
  neon: number
) => {
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshStandardMaterial({
    color,
    emissive: new Color(neon),
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.25,
  });

  const building = new Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  scene.add(building);

  const neonLight = new PointLight(neon, 0.1, 12, 2);
  neonLight.position.set(x, height + 0.2, z);
  scene.add(neonLight);
  buildingLights.push(neonLight);
};

const createCity = () => {
  const neonColors = [0xff3d8f, 0x7f42ff, 0x1fd5ff, 0xffd34f];
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

  createBuilding(0, -6, 2, 1.4, 11, 0x190532, 0xff46b0);
  createBuilding(2.2, -5.5, 1.3, 1.3, 7.5, 0x1f1142, 0x4d99ff);
  createBuilding(-2.4, -5.3, 1.1, 1.1, 6.4, 0x27103a, 0xffaa50);
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

const ambientLight = new AmbientLight(0x8e4ff3, 0.1);
scene.add(ambientLight);

const keyLight = new PointLight(0x9a53ff, 0.1, 25, 2);
keyLight.position.set(-12, 12, 10);
scene.add(keyLight);

const fillLight = new PointLight(0x33b2ff, 0.1, 20, 2);
fillLight.position.set(10, 8, -12);
scene.add(fillLight);

const lights = { ambientLight, keyLight, fillLight };

createCity();

const resize = () => {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', resize);
resize();

let audioInitialized = false;
let audioReady = false;

const initAudio = () => {
  if (audioInitialized) return;
  audioInitialized = true;

  audioLoader.load('/audio/joshua_moses_where_we_end_up.mp3', (buffer) => {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.5);
    analyser = new AudioAnalyser(audio, 256);
    audioReady = true;
  });
};

const startAudio = () => {
  if (audioReady && audio && !audio.isPlaying) {
    audio.play();
    document.removeEventListener('click', startAudio);
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.0001;
  camera.position.x = Math.sin(time) * 12;
  camera.position.z = Math.cos(time) * 20;
  camera.position.y = 6 + Math.sin(time * 0.8) * 0.6;
  camera.lookAt(new Vector3(0, 3, 0));

  if (analyser && audioReady) {
    const dataArray = analyser.getFrequencyData();

    if (dataArray && dataArray.length > 0) {
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const averageNormalized = Math.pow(average / 255, 0.5);

      const lowFreqData = dataArray.slice(0, 8);
      const midFreqData = dataArray.slice(8, 128);
      const highFreqData = dataArray.slice(128, 256);

      const lowFreq =
        lowFreqData.length > 0 ? lowFreqData.reduce((a, b) => a + b) / lowFreqData.length : 0;
      const midFreq =
        midFreqData.length > 0 ? midFreqData.reduce((a, b) => a + b) / midFreqData.length : 0;
      const highFreq =
        highFreqData.length > 0 ? highFreqData.reduce((a, b) => a + b) / highFreqData.length : 0;

      const lowNormalized = Math.pow(lowFreq / 255, 0.6);
      const midNormalized = Math.pow(midFreq / 255, 0.6);
      const highNormalized = Math.pow(highFreq / 255, 0.6);

      lights.ambientLight.intensity = 0.1 + averageNormalized * 0.5;
      lights.keyLight.intensity = 0.1 + lowNormalized * 1;
      lights.fillLight.intensity = 0.1 + midNormalized * 0.8;

      buildingLights.forEach((light, index) => {
        const freqBand =
          index % 3 === 0 ? lowNormalized : index % 3 === 1 ? midNormalized : highNormalized;
        light.intensity = 0.1 + freqBand * 1.5;
      });
    }
  }

  renderer.render(scene, camera);
};

initAudio();
document.addEventListener('click', () => {
  document.getElementById('start-button')!.style.display = 'none';
  startAudio();
  animate();
});

console.log('Game initialized - click to start audio');
