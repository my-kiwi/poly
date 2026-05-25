import { createDebugErrorPanel, isDebugUrlEnabled } from './game/debug-error-panel';

window.addEventListener('DOMContentLoaded', () => {
  const debugErrorPanel = createDebugErrorPanel({ enabled: isDebugUrlEnabled() });
  debugErrorPanel.install();
  import('./game');
});
