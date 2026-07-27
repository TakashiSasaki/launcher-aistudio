export type PwaRegistrationState =
  | 'idle'
  | 'unsupported'
  | 'disabled-in-development'
  | 'registering'
  | 'registered'
  | 'failed';

export interface PwaStatus {
  state: PwaRegistrationState;
  supported: boolean;
  registered: boolean;
  disabledInDev: boolean;
  error?: string;
}

export interface ServiceWorkerRegistrationOptions {
  isDevelopment?: boolean;
  serviceWorker?: Pick<ServiceWorkerContainer, 'register'> | null;
  eventTarget?: EventTarget | null;
}

export const PWA_STATUS_CHANGED_EVENT = 'launcher:pwa-status-changed';

const status: PwaStatus = {
  state: 'idle',
  supported: false,
  registered: false,
  disabledInDev: false,
};

function detectedServiceWorker(): Pick<ServiceWorkerContainer, 'register'> | null {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  return navigator.serviceWorker;
}

function detectedEventTarget(): EventTarget | null {
  return typeof window === 'undefined' ? null : window;
}

function publishStatus(
  nextStatus: PwaStatus,
  eventTarget: EventTarget | null,
): PwaStatus {
  Object.assign(status, nextStatus);
  eventTarget?.dispatchEvent(new Event(PWA_STATUS_CHANGED_EVENT));
  return getPwaStatus();
}

export async function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {},
): Promise<PwaStatus> {
  const hasInjectedServiceWorker = Object.prototype.hasOwnProperty.call(
    options,
    'serviceWorker',
  );
  const hasInjectedEventTarget = Object.prototype.hasOwnProperty.call(
    options,
    'eventTarget',
  );
  const serviceWorker = hasInjectedServiceWorker
    ? options.serviceWorker ?? null
    : detectedServiceWorker();
  const eventTarget = hasInjectedEventTarget
    ? options.eventTarget ?? null
    : detectedEventTarget();
  const isDevelopment = options.isDevelopment ?? import.meta.env.DEV;

  if (!serviceWorker) {
    return publishStatus(
      {
        state: 'unsupported',
        supported: false,
        registered: false,
        disabledInDev: false,
        error: undefined,
      },
      eventTarget,
    );
  }

  if (isDevelopment) {
    return publishStatus(
      {
        state: 'disabled-in-development',
        supported: true,
        registered: false,
        disabledInDev: true,
        error: undefined,
      },
      eventTarget,
    );
  }

  publishStatus(
    {
      state: 'registering',
      supported: true,
      registered: false,
      disabledInDev: false,
      error: undefined,
    },
    eventTarget,
  );

  try {
    const registration = await serviceWorker.register('/sw.js');
    return publishStatus(
      {
        state: 'registered',
        supported: true,
        registered: Boolean(registration),
        disabledInDev: false,
        error: undefined,
      },
      eventTarget,
    );
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return publishStatus(
      {
        state: 'failed',
        supported: true,
        registered: false,
        disabledInDev: false,
        error: error instanceof Error ? error.message : String(error),
      },
      eventTarget,
    );
  }
}

export function getPwaStatus(): PwaStatus {
  return { ...status };
}
