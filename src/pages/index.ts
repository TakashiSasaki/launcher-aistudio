import { renderLauncherGrid } from '../components/launcher-grid';
import { demoData } from '../data/demo';
import { getPwaStatus } from '../pwa/registration';

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

export function renderAppPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>App</h1>
    <p>This is a static placeholder for the future authenticated launcher.</p>
    <p><em>Security boundary unimplemented.</em></p>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
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

export function renderDevPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';
  const pwaStatus = getPwaStatus();
  
  // Try to detect display mode
  let displayMode = 'browser';
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  } else if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) {
    displayMode = 'minimal-ui';
  } else if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
    displayMode = 'fullscreen';
  }

  container.innerHTML = `
    <h1>Developer Info</h1>
    <p><strong>Purpose:</strong> Lightweight, mobile-first PWA web launcher.</p>
    <h2>Implementation Status</h2>
    <ul>
      <li>Firebase Authentication: Not Implemented</li>
      <li>Firestore Access: Not Implemented</li>
      <li>Persistent Demo: Not Implemented</li>
    </ul>
    <h2>PWA Status</h2>
    <ul>
      <li>Manifest URL: <a href="/manifest.json" target="_blank">/manifest.json</a></li>
      <li>Display Mode: ${displayMode}</li>
      <li>Service Worker Supported: ${pwaStatus.supported ? 'Yes' : 'No'}</li>
      <li>Service Worker Disabled in Dev: ${pwaStatus.disabledInDev ? 'Yes' : 'No'}</li>
      <li>Service Worker Registered: ${pwaStatus.registered ? 'Yes' : 'No'}</li>
      ${pwaStatus.error ? `<li>Service Worker Error: ${pwaStatus.error}</li>` : ''}
      <li>Application Version: <em>Deferred</em></li>
      <li><strong>Note:</strong> Application-managed caching and offline behavior are not implemented in this baseline.</li>
    </ul>
    <h2>Route Catalog</h2>
    <ul>
      <li><code>/</code> - Public landing page</li>
      <li><code>/app</code> - Authenticated launcher (placeholder)</li>
      <li><code>/admin</code> - Admin area (placeholder)</li>
      <li><code>/dev</code> - Developer info</li>
      <li><code>/demo</code> - Fixed demo data grid</li>
    </ul>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;
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
  
  const gridContainer = container.querySelector('#demo-grid-container');
  if (gridContainer) {
    gridContainer.appendChild(renderLauncherGrid(demoData));
  }

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
