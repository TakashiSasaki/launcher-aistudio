export interface PwaStatus {
  supported: boolean;
  registered: boolean;
  disabledInDev: boolean;
  error?: string;
}

const status: PwaStatus = {
  supported: false,
  registered: false,
  disabledInDev: false,
};

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    status.supported = false;
    return;
  }
  
  status.supported = true;

  if (import.meta.env.DEV) {
    status.disabledInDev = true;
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    status.registered = !!registration;
  } catch (error) {
    status.registered = false;
    status.error = error instanceof Error ? error.message : String(error);
    console.error('Service Worker registration failed:', error);
  }
}

export function getPwaStatus(): PwaStatus {
  return { ...status };
}
