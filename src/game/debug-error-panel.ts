export interface DebugErrorPanelOptions {
  enabled?: boolean;
}

const MAX_ENTRIES = 200;

const escapeText = (value: unknown) => {
  if (value instanceof Error) {
    return [value.message, value.stack].filter(Boolean).join('\n');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const formatErrorMessage = (args: unknown[]) => {
  const parts = args.map((arg) => escapeText(arg));
  return parts.join('\n');
};

export const isDebugUrlEnabled = () => {
  const debugValue = new URLSearchParams(window.location.search).get('debug');
  return debugValue?.toLowerCase() === 'true';
};

export const createDebugErrorPanel = ({ enabled = false }: DebugErrorPanelOptions = {}) => {
  const container = document.createElement('div');
  container.className = 'debug-error-panel';
  container.hidden = !enabled;

  const header = document.createElement('div');
  header.className = 'debug-error-panel__header';
  header.textContent = 'Debug errors';

  const list = document.createElement('div');
  list.className = 'debug-error-panel__list';

  container.append(header, list);

  const originalConsoleError = console.error.bind(console);
  let isInstalled = false;

  const handleWindowError = (event: ErrorEvent) => {
    const errorMessage = event.error
      ? `${event.message}\n${event.error.stack ?? ''}`
      : event.message;
    originalConsoleError(
      event.error || event.message,
      event.error ?? event.filename,
      event.lineno,
      event.colno
    );
    addEntry(errorMessage);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason =
      event.reason instanceof Error
        ? `${event.reason.message}\n${event.reason.stack ?? ''}`
        : String(event.reason);
    originalConsoleError('Unhandled rejection', event.reason);
    addEntry(`Unhandled rejection:\n${reason}`);
  };

  const pruneOldEntries = () => {
    while (list.children.length > MAX_ENTRIES) {
      list.firstElementChild?.remove();
    }
  };

  const addEntry = (message: string) => {
    const entry = document.createElement('pre');
    entry.className = 'debug-error-panel__entry';
    entry.textContent = message;

    list.prepend(entry);
    pruneOldEntries();
  };

  const install = () => {
    if (!enabled || isInstalled) {
      return;
    }

    if (!document.body.contains(container)) {
      document.body.appendChild(container);
    }

    container.hidden = false;

    console.error = ((...args: unknown[]) => {
      originalConsoleError(...args);
      addEntry(formatErrorMessage(args));
    }) as typeof console.error;

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    isInstalled = true;
  };

  const dispose = () => {
    if (console.error !== originalConsoleError) {
      console.error = originalConsoleError;
    }

    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);

    isInstalled = false;
    container.remove();
  };

  return {
    container,
    dispose,
    install,
  };
};
