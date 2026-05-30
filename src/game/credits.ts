import { removeWindowEventListeners } from '../utils/events';
import { neonColors, setDefaultBuildingColors } from './city';

let creditsOverlay: HTMLDivElement | null = null;

const toHex = (value: number) => `#${value.toString(16).padStart(6, '0')}`;
const randomNeon = () => toHex(neonColors[Math.floor(Math.random() * neonColors.length)]);

export const createCreditsOverlay = () => {
  removeWindowEventListeners();
  const overlay = document.createElement('div');
  overlay.className = 'credits-overlay hidden';

  const title = document.createElement('div');
  title.textContent = 'Credits';
  title.style.color = randomNeon();
  title.className = 'credits-overlay__title';

  const author = document.createElement('div');
  author.textContent = 'Music: Joshua Moses';
  author.style.color = randomNeon();
  author.className = 'credits-overlay__item';

  const repo = document.createElement('a');
  repo.textContent = 'View the repo on GitHub';
  repo.href = 'https://github.com/my-kiwi/poly';
  repo.target = '_blank';
  repo.rel = 'noreferrer noopener';
  repo.style.color = randomNeon();
  repo.className = 'credits-overlay__item credits-overlay__link';
  repo.addEventListener('click', (event) => event.stopPropagation());

  const button = document.createElement('button');
  button.textContent = 'Start over';
  button.type = 'button';
  button.className = 'credits-overlay__button';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.reload();
  });

  overlay.append(title, author, repo, button);
  return overlay;
};

const ensureCreditsOverlay = () => {
  if (creditsOverlay) {
    return creditsOverlay;
  }
  const container = document.getElementById('game') ?? document.body;
  creditsOverlay = createCreditsOverlay();
  container.appendChild(creditsOverlay);
  return creditsOverlay;
};

export const showCreditsOverlay = () => {
  const overlay = ensureCreditsOverlay();
  overlay.classList.remove('hidden');
  setDefaultBuildingColors();
};

export const hideCreditsOverlay = () => {
  creditsOverlay?.classList.add('hidden');
};
