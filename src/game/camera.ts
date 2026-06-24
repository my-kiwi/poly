import { PerspectiveCamera, Vector3 } from 'three';
import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

export const createCamera = () => {
  const camera = new PerspectiveCamera(80, 1, 0.1, 2000);
  camera.position.set(0, 1, -600);
  camera.lookAt(new Vector3(0, 3, 0));
  return camera;
};

export const createControls = (camera: PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
  // https://threejs.org/docs/#FirstPersonControls
  const controls = new FirstPersonControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.movementSpeed = 0.05; // Units per second
  controls.lookSpeed = 0.0005; // Rotation sensitivity
  controls.lookVertical = true; // Set to false to lock the horizon
  return controls;
};
