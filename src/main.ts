import { createDebugErrorPanel } from './utils/debug-panel';

window.addEventListener('DOMContentLoaded', () => {
  const debugErrorPanel = createDebugErrorPanel();
  debugErrorPanel.install();
  import('./game');
});
