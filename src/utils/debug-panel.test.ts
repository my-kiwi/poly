import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDebugErrorPanel } from './debug-panel';

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
    const panel = createDebugErrorPanel();

    panel.install();
    console.error('Audio start failed', { code: 'NotAllowedError' });

    expect(panel.container.textContent).toContain('Audio start failed');
    expect(panel.container.textContent).toContain('NotAllowedError');
    panel.dispose();
  });

  it('preserves the original console.error implementation', () => {
    const consoleErrorSpy = vi.fn();
    const panel = createDebugErrorPanel();

    panel.install();
    console.error = consoleErrorSpy as typeof console.error;
    console.error('preserved');

    expect(consoleErrorSpy).toHaveBeenCalledWith('preserved');
    panel.dispose();
  });
});
