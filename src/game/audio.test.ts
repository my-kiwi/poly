import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAudioPlaybackController } from './audio';

type Listener = () => void;

const createAudioElementStub = () => {
  const listeners = new Map<string, Set<Listener>>();

  return {
    play: vi.fn(async () => undefined),
    addEventListener: vi.fn((type: string, listener: Listener) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }

      listeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    }),
    dispatchEvent(type: string) {
      listeners.get(type)?.forEach((listener) => listener());
    },
  };
};

describe('createAudioPlaybackController', () => {
  let audioElement: ReturnType<typeof createAudioElementStub>;
  let audioContext: { state: 'suspended' | 'running'; resume: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    audioElement = createAudioElementStub();
    audioContext = {
      state: 'suspended',
      resume: vi.fn(async () => {
        audioContext.state = 'running';
      }),
    };
  });

  it('only attempts playback once while a start is in progress', async () => {
    let resolvePlay!: () => void;

    audioElement.play.mockImplementation(
      () =>
        new Promise<undefined>((resolve) => {
          resolvePlay = () => resolve(undefined);
        })
    );

    const controller = createAudioPlaybackController({
      audioContext: audioContext as unknown as AudioContext,
      audioElement: audioElement as unknown as HTMLAudioElement,
      onError: vi.fn(),
    });

    const firstStart = controller.start();
    const secondStart = controller.start();

    await Promise.resolve();

    expect(audioElement.play).toHaveBeenCalledTimes(1);

    resolvePlay();

    await Promise.all([firstStart, secondStart]);
    expect(controller.hasStarted()).toBe(true);
  });

  it('retries playback after canplaythrough when the initial play attempt fails', async () => {
    audioElement.play
      .mockRejectedValueOnce(new Error('NotAllowedError'))
      .mockResolvedValueOnce(undefined);

    const controller = createAudioPlaybackController({
      audioContext: audioContext as unknown as AudioContext,
      audioElement: audioElement as unknown as HTMLAudioElement,
      onError: vi.fn(),
    });

    controller.attachCanPlayRetry();

    await expect(controller.start()).rejects.toThrow('NotAllowedError');
    expect(audioElement.play).toHaveBeenCalledTimes(1);

    audioElement.dispatchEvent('canplaythrough');
    await Promise.resolve();

    expect(audioElement.play).toHaveBeenCalledTimes(2);
    expect(controller.hasStarted()).toBe(true);
  });

  it('retries playback when canplay fires after a blocked play attempt', async () => {
    audioElement.play
      .mockRejectedValueOnce(new Error('NotAllowedError'))
      .mockResolvedValueOnce(undefined);

    const controller = createAudioPlaybackController({
      audioContext: audioContext as unknown as AudioContext,
      audioElement: audioElement as unknown as HTMLAudioElement,
      onError: vi.fn(),
    });

    controller.attachCanPlayRetry();

    await expect(controller.start()).rejects.toThrow('NotAllowedError');
    expect(audioElement.play).toHaveBeenCalledTimes(1);

    audioElement.dispatchEvent('canplay');
    await Promise.resolve();

    expect(audioElement.play).toHaveBeenCalledTimes(2);
    expect(controller.hasStarted()).toBe(true);
  });
});
