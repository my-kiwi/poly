import {
  FogExp2,
  GridHelper,
  IcosahedronGeometry,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

export const createScene = () => {
  const scene = new Scene();
  scene.fog = new FogExp2(0x07061a, 0.028);
  return scene;
};

export const createCamera = () => {
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 5, 60);
  camera.lookAt(new Vector3(0, 3, 0));
  return camera;
};

export const createRenderer = (container: HTMLElement) => {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  return renderer;
};

export const setupEnvironment = (scene: Scene) => {
  const ground = new Mesh(
    new PlaneGeometry(40, 60),
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

  const grid = new GridHelper(40, 40, 0x45124f, 0x080718);
  grid.rotation.x = Math.PI / 2;
  grid.position.y = 0.01;
  scene.add(grid);

  const keyLight = new PointLight(0x9a53ff, 0.1, 25, 2);
  keyLight.position.set(-12, 12, 10);
  scene.add(keyLight);

  const fillLight = new PointLight(0x33b2ff, 0.1, 20, 2);
  fillLight.position.set(10, 8, -12);
  // scene.add(fillLight);
  const radius = 10;
  const sectors = 16;
  const rings = 8;
  const divisions = 64;
  const helper = new THREE.PolarGridHelper(radius, sectors, rings, divisions);
  scene.add(helper);

  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

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
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  container: HTMLElement
) => {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

export const renderFrame = (renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) => {
  renderer.render(scene, camera);
};
