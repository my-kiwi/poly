import { addDebugPanel } from './utils/debug-panel';

window.addEventListener('DOMContentLoaded', () => {
  addDebugPanel();
  import('./game');
});
