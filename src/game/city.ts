import {
  AudioAnalyser,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  BufferGeometry,
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Scene,
} from 'three';

import { getAudioCompletedPercentage } from './audio';

export const Colors = {
  blue: 0x00ddff, // #00ddff
  green: 0x95ff24, // #95ff24
  pink: 0xff46b0, // #ff46b0
  purple: 0x9a53ff, // #9a53ff
  orange: 0xffdd47, // #ffdd47
} as const;

const greyColor = 0x101030;
const startColor = Colors.green;
const startOpacity = 1;

export const neonColors = Object.values(Colors) as number[];
export const buildingColorsAndMaterials = new Map<number, MeshStandardMaterial[]>(
  neonColors.map((color) => [color, [] as MeshStandardMaterial[]])
);

export const createBuilding = (
  scene: Scene,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  color: number,
  neon: number
) => {
  const building = new Mesh(
    new BoxGeometry(width, height, depth),
    new MeshPhysicalMaterial({
      color,
      emissive: neon === startColor ? new Color(neon) : new Color(greyColor),
      emissiveIntensity: neon === startColor ? 1 : 0.01,
      metalness: 1,
      roughness: 0.25,
      transmission: 0.7,
      transparent: true,
      opacity: startOpacity,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    })
  );
  building.position.set(x, height / 2, z);
  scene.add(building);
  buildingColorsAndMaterials.get(neon)!.push(building.material as MeshStandardMaterial);
  // register building for later progressive transformations
  cityBuildings.push(building);
};

export const cityBuildings: Mesh[] = [];

const transformStartDelay = 5000; // ms after which transformations begin
const transformStagger = 12000; // ms span over which start times are staggered across city
const perBuildingDuration = 18000; // ms duration for each building's transform

type TransformInfo = {
  target?: BufferGeometry;
  swapped?: boolean;
  shapeIndex?: number;
};

const targetGeometryFactories = [
  (h: number, w: number) => new SphereGeometry(Math.max(0.4, Math.max(w, h) / 2), 8, 6),
  (h: number, w: number) =>
    new CylinderGeometry(Math.max(0.2, w / 2), Math.max(0.2, w / 2), Math.max(0.4, h), 8),
  (h: number, w: number) => new ConeGeometry(Math.max(0.2, w / 2), Math.max(0.4, h), 8),
];

export const updateBuildingTransformations = (time: number) => {
  if (!cityBuildings || cityBuildings.length === 0) return;
  // time here is the high-resolution timestamp from requestAnimationFrame (ms)
  for (let i = 0; i < cityBuildings.length; i++) {
    const b = cityBuildings[i];
    if (!b) continue;
    if (!b.userData.transform) b.userData.transform = {} as TransformInfo;
    const info: TransformInfo = b.userData.transform;

    const start = transformStartDelay + (i / cityBuildings.length) * transformStagger;
    const localElapsed = time - start;
    if (localElapsed <= 0) continue; // not yet started for this building

    const progress = Math.min(1, localElapsed / perBuildingDuration);

    // choose a target geometry once
    if (!info.target) {
      // derive approximate dimensions from current geometry bounding box
      const bboxHeight = b.geometry.boundingBox
        ? b.geometry.boundingBox.max.y - b.geometry.boundingBox.min.y
        : b.scale.y || 1;
      const approxHeight = bboxHeight || b.scale.y || 1;
      const approxWidth = Math.max(b.scale.x || 1, b.scale.z || 1);
      const factory = targetGeometryFactories[i % targetGeometryFactories.length];
      info.shapeIndex = i % targetGeometryFactories.length;
      info.target = factory(approxHeight, approxWidth);
      info.swapped = false;
    }

    // animate: first shrink, then swap at halfway, then grow back and settle rotation
    if (progress < 0.5) {
      const t = progress / 0.5; // 0..1 shrinking
      const scale = 1 - t * 0.9;
      b.scale.setScalar(scale);
      // b.rotation.y += 0.002;
    } else {
      const t = (progress - 0.5) / 0.5; // 0..1 growing
      if (!info.swapped) {
        // swap geometry to target
        const old = b.geometry;
        b.geometry = info.target!;
        old.dispose?.();
        info.swapped = true;
        // start from small
        b.scale.setScalar(1);
      }
      const scale = 0.15 + t * t * 0.85;
      b.scale.setScalar(scale);
      // b.rotation.y += 0.02;
      // slightly adjust material properties for transformed look
      const mat = b.material as MeshStandardMaterial;
      if (mat) {
        mat.roughness = 0.4 + t * 0.4;
        mat.emissiveIntensity = Math.max(0.05, mat.emissiveIntensity * (1 - 0.5 * t));
      }
    }
  }
};

export const setDefaultBuildingColors = () => {
  buildingColorsAndMaterials.forEach((materials, neon) => {
    materials.forEach((material) => {
      material.emissive.setHex(neon === startColor ? neon : greyColor);
      material.emissiveIntensity = neon === startColor ? 1 : 0.01;
    });
  });
};

export const createCity = (scene: Scene) => {
  for (let ix = -30; ix <= 30; ix += 1.5) {
    const rowOffset = ix * 1.2;
    for (let iz = -30; iz <= 30; iz += 1.6) {
      const width = Math.random() * 0.9 + 0.8;
      const depth = Math.random() * 0.9 + 0.8;
      const height = Math.random() * 4 + 2.5 + Math.abs(iz) * 0.8;
      const neon = neonColors[Math.floor(Math.random() * neonColors.length)];
      createBuilding(scene, iz * 2.5, rowOffset, width, depth, height, 0x101030, neon);
    }
  }
};

const maxFrequency = 100;
export const colorToFrequencyBand = new Map(
  neonColors.map((color, index) => {
    const start = Math.floor((index / neonColors.length) * maxFrequency);
    const end = Math.floor(((index + 1) / neonColors.length) * maxFrequency);
    return [color, { start, end }] as const;
  })
);

export const updateAudioReactiveElements = (analyser?: AudioAnalyser) => {
  const dataArray = analyser?.getFrequencyData();
  if (!dataArray || dataArray.length === 0) {
    return;
  }
  const completedPercentage = getAudioCompletedPercentage();
  if (completedPercentage >= 0.95) {
    return;
  }

  const freqBands = neonColors.map((color) => {
    const { start, end } = colorToFrequencyBand.get(color)!;
    const bandData = dataArray.slice(start, end);
    return {
      color,
      frequency: bandData.length > 0 ? bandData.reduce((a, b) => a + b) / bandData.length : 0,
    };
  });

  const opacity = startOpacity - completedPercentage;

  buildingColorsAndMaterials.forEach((materials, neon) => {
    const freqBand = freqBands.find((band) => band.color === neon)?.frequency || 0;
    materials.forEach((material) => {
      if (freqBand > 0) {
        material.emissive.setHex(neon);
        material.emissiveIntensity = 0.2 + (freqBand / maxFrequency) * 0.8;
        material.opacity = opacity + (freqBand / maxFrequency) * (1 - opacity);
      } else {
        material.emissive.setHex(greyColor);
        material.emissiveIntensity = 1;
        material.opacity = opacity;
      }
    });
  });
};
