import {
  AudioAnalyser,
  BoxGeometry,
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
  for (let ix = -70; ix <= 70; ix += 1.5) {
    const rowOffset = ix * 1.2;
    for (let iz = -20; iz <= 40; iz += 1.6) {
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
