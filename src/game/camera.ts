import { PerspectiveCamera, Vector3 } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const createCamera = () => {
  const camera = new PerspectiveCamera(120, 1, 0.1, 200);
  camera.position.set(0, 50, 0);
  camera.lookAt(new Vector3(0, 3, 0));
  // Orbit controls for free camera mode
  const orbitControls = new OrbitControls(camera, document.body);
  orbitControls.maxDistance = 90;
  orbitControls.maxPolarAngle = THREE.MathUtils.degToRad(90);
  orbitControls.target.set(0, 0, 0);
  orbitControls.enabled = true;

  orbitControls.cursorStyle = 'grab';
  orbitControls.update();
  return { camera, update: () => orbitControls.update() };
};
