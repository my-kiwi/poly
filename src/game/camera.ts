import { PerspectiveCamera, Vector3 } from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { WebGPURenderer } from 'three/webgpu';

export const createCamera = () => {
  const camera = new PerspectiveCamera(80, 1, 0.1, 200);
  camera.position.set(0, 50, 0);
  camera.lookAt(new Vector3(0, 3, 0));
  return camera;
};

export const createControls = (camera: PerspectiveCamera, renderer: WebGPURenderer) => {
  // https://threejs.org/docs/#FirstPersonControls
  const controls = new FirstPersonControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.movementSpeed = 0.001; // Units per second
  controls.lookSpeed = 0.0005; // Rotation sensitivity
  controls.lookVertical = true; // Set to false to lock the horizon
  return controls;
};
