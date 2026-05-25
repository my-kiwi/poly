import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDebugErrorPanel } from './debug-error-panel';

describe('createDebugErrorPanel', () => {
  const originalConsoleError = console.error.bind(console);

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    console.error = originalConsoleError;
    document.body.innerHTML = '';
  });

  it('renders console.error messages into the debug panel', () => {
    const panel = createDebugErrorPanel({ enabled: true });

    panel.install();
    console.error('Audio start failed', { code: 'NotAllowedError' });

    expect(panel.container.textContent).toContain('Audio start failed');
    expect(panel.container.textContent).toContain('NotAllowedError');
    panel.dispose();
  });

  it('does not install any UI when disabled', () => {
    const panel = createDebugErrorPanel({ enabled: false });

    panel.install();
    console.error('hidden error');

    expect(document.body.querySelector('.debug-error-panel')).toBeNull();
    panel.dispose();
  });

  it('preserves the original console.error implementation', () => {
    const consoleErrorSpy = vi.fn();
    const panel = createDebugErrorPanel({ enabled: true });

    panel.install();
    console.error = consoleErrorSpy as typeof console.error;
    console.error('preserved');

    expect(consoleErrorSpy).toHaveBeenCalledWith('preserved');
    panel.dispose();
  });
});
