let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock() {
  if (wakeLock) return;
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });
      console.log('Wake Lock acquired');
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  } else {
    console.error('Wake Lock API not supported');
  }
}

export function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}
