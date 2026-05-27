import * as THREE from 'three';

import { neonColors } from './city';

export const createPolygon = (scene: THREE.Scene) => {
  const polygon = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1),
    new THREE.MeshPhysicalMaterial({
      color: 0x4d99ff,
      emissive: 0x4d99ff,
      emissiveIntensity: 1,
      metalness: 0.1,
      roughness: 1,
      transparent: false,
      opacity: 1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    })
  );
  polygon.position.set(0, 3, 50);
  scene.add(polygon);
  let currentColorIndex = 0;
  let nextColorIndex = 1;
  let colorLerpProgress = 0;
  return {
    polygon,
    update: () => {
      polygon.rotation.x += 0.001;
      polygon.rotation.y += 0.0008;
      polygon.rotation.z += 0.006;

      colorLerpProgress += 0.005;
      if (colorLerpProgress >= 1) {
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % neonColors.length;
        colorLerpProgress = 0;
      }

      const currentColor = neonColors[currentColorIndex];
      const nextColor = neonColors[nextColorIndex];
      const lerpedColor = new THREE.Color(currentColor).lerp(
        new THREE.Color(nextColor),
        colorLerpProgress
      );
      (polygon.material as THREE.MeshStandardMaterial).color.copy(lerpedColor);
      (polygon.material as THREE.MeshStandardMaterial).emissive.copy(lerpedColor);
    },
  };
};
