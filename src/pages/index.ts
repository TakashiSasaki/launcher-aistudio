import { renderLauncherGrid } from '../components/launcher-grid';
import { demoData } from '../data/demo';
import { setupAuthListener } from '../firebase/auth';
import { appConfig } from '../firebase/config';
import {
  PWA_STATUS_CHANGED_EVENT,
  PwaRegistrationState,
  getPwaStatus,
} from '../pwa/registration';

export function renderHomePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Launcher PWA</h1>
    <p>Welcome to the Launcher application.</p>
    <ul style="margin-top: 20px; list-style-type: none;">
      <li><a href="/app" data-link>Go to App</a></li>
      <li><a href="/admin" data-link>Admin Area</a></li>
      <li><a href="/dev" data-link>Developer Info</a></li>
      <li><a href="/demo" data-link>Demo Grid</a></li>
    </ul>
  `;
  return container;
}

export function renderAdminPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Admin</h1>
    <p>Administrator authorization is not yet implemented.</p>
    <p><em>Security boundary unimplemented.</em></p>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;
  return container;
}

function registrationStateLabel(state: PwaRegistrationState): string {
  switch (state) {
    case 'idle':
      return 'Not checked';
    case 'unsupported':
      return 'Unsupported';
    case 'disabled-in-development':
      return 'Disabled in development';
    case 'registering':
      return 'Registering';
    case 'registered':
      return 'Registered';
    case 'failed':
      return 'Failed';
  }
}

function setText(container: HTMLElement, selector: string, value: string): void {
  const element = container.querySelector<HTMLElement>(selector);
  if (element) {
    element.textContent = value;
  }
}

function updatePwaStatusDisplay(container: HTMLElement): void {
  const status = getPwaStatus();

  setText(container, '[data-pwa-state]', registrationStateLabel(status.state));
  setText(container, '[data-pwa-supported]', status.supported ? 'Yes' : 'No');
  setText(
    container,
    '[data-pwa-disabled-in-dev]',
    status.disabledInDev ? 'Yes' : 'No',
  );
  setText(container, '[data-pwa-registered]', status.registered ? 'Yes' : 'No');

  const errorItem = container.querySelector<HTMLElement>('[data-pwa-error-item]');
  const errorText = container.querySelector<HTMLElement>('[data-pwa-error]');
  if (errorItem && errorText) {
    errorItem.hidden = !status.error;
    errorText.textContent = status.error ?? '';
  }
}

function detectDisplayMode(): string {
  if (!window.matchMedia) return 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  return 'browser';
}

export function renderDevPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';

  container.innerHTML = `
    <h1>Developer Info</h1>
    <p><strong>Purpose:</strong> Lightweight, mobile-first PWA web launcher.</p>
    <h2>Implementation Status</h2>
    <ul>
      <li>Configuration Mode: <span id="dev-fb-mode"></span></li>
      <li>Firebase Initialized: <span id="dev-fb-init"></span></li>
      <li>Authentication Emulator Connected: <span id="dev-fb-auth-emu"></span></li>
      <li>Firestore Emulator Connected: <span id="dev-fb-db-emu"></span></li>
      <li>Authentication State: <span id="dev-fb-auth-state"></span></li>
      <li>Firestore Persistence: online-only</li>
      <li>Firestore Access: owner-scoped profile and launcher-item CRUD implemented</li>
      <li>Persistent Demo: Not Implemented</li>
    </ul>
    <h2>PWA Status</h2>
    <ul>
      <li>Manifest URL: <a href="/manifest.json" target="_blank" rel="noopener noreferrer">/manifest.json</a></li>
      <li>Display Mode: ${detectDisplayMode()}</li>
      <li>Service Worker State: <span data-pwa-state></span></li>
      <li>Service Worker Supported: <span data-pwa-supported></span></li>
      <li>Service Worker Disabled in Dev: <span data-pwa-disabled-in-dev></span></li>
      <li>Service Worker Registered: <span data-pwa-registered></span></li>
      <li data-pwa-error-item hidden>Service Worker Error: <span data-pwa-error></span></li>
      <li>Application Version: <em>Deferred</em></li>
      <li><strong>Note:</strong> Application-managed caching and offline behavior are not implemented.</li>
    </ul>
    <h2>Route Catalog</h2>
    <ul>
      <li><code>/</code> - Public landing page</li>
      <li><code>/app</code> - Google/anonymous authenticated launcher</li>
      <li><code>/admin</code> - Administrator area (not implemented)</li>
      <li><code>/dev</code> - Public developer information</li>
      <li><code>/demo</code> - Fixed in-memory demo grid</li>
    </ul>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;

  updatePwaStatusDisplay(container);

  const handleStatusChange = () => updatePwaStatusDisplay(container);
  window.addEventListener(PWA_STATUS_CHANGED_EVENT, handleStatusChange);

  const setDevText = (id: string, text: string) => {
    const element = container.querySelector<HTMLElement>(`#${id}`);
    if (element) element.textContent = text;
  };

  setDevText('dev-fb-mode', appConfig.mode);
  setDevText('dev-fb-init', appConfig.isFirebaseInitialized ? 'Yes' : 'No');
  setDevText('dev-fb-auth-emu', appConfig.isAuthEmulatorConnected ? 'Yes' : 'No');
  setDevText('dev-fb-db-emu', appConfig.isFirestoreEmulatorConnected ? 'Yes' : 'No');

  const unsubscribeAuth = setupAuthListener((user) => {
    if (!user) {
      setDevText('dev-fb-auth-state', 'Signed out');
    } else if (user.isAnonymous) {
      setDevText('dev-fb-auth-state', 'Anonymous');
    } else {
      setDevText('dev-fb-auth-state', 'Google');
    }
  });

  container.addEventListener(
    'launcher:cleanup',
    () => {
      window.removeEventListener(PWA_STATUS_CHANGED_EVENT, handleStatusChange);
      unsubscribeAuth();
    },
    { once: true },
  );

  return container;
}

export function renderDemoPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Demo Grid</h1>
    <p>Fixed in-memory demo launcher data.</p>
    <div id="demo-grid-container"></div>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;

  container.querySelector('#demo-grid-container')?.appendChild(renderLauncherGrid(demoData));
  return container;
}

export function renderNotFoundPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>404 - Not Found</h1>
    <p>The requested route could not be found.</p>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;
  return container;
}

export { renderAppPage } from './app';
