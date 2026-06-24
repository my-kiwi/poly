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
  cyan: 0x00ffff, // #00ffff
  limeGreen: 0x0fff50, // #0fff50
  hotPink: 0xff0080, // #ff0080
  magenta: 0xff00ff, // #ff00ff
  red: 0xff0000, // #ff0000
  yellow: 0xffff00, // #ffff00
} as const;

const greyColor = 0x101030;
const startColor = Colors.limeGreen;
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

const maxRows = 37;// rows are facing the 
const rowStep = 30;
const maxRowsByStep = maxRows * rowStep;

const maxCols = 35; // must always be odd to have a center column
const colStep = 30;
const maxColsByStep = maxCols * colStep;

const minWidth = 8;
const minDepth = 8;
const minHeight = 10.5;

export const createCity = (scene: Scene) => {
  for (let ix = -maxRowsByStep / 2; ix <= maxRowsByStep / 2; ix += rowStep) {
    const rowOffset = ix * 1.2;
    for (let iz = -maxColsByStep / 2; iz <= maxColsByStep / 2; iz += colStep) {
      const width = Math.random() * 0.9 + minWidth;
      const depth = Math.random() * 0.9 + minDepth;
      const height = Math.random() * 20 + minHeight ;// + Math.abs(iz) * 0.8;
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
