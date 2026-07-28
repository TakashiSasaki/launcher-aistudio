import { beforeAll, describe, expect, it, vi } from 'vitest';
// @ts-ignore Node.js types are intentionally not yet part of the browser-focused project.
import * as fs from 'fs';
// @ts-ignore Node.js types are intentionally not yet part of the browser-focused project.
import * as path from 'path';
import {
  
  PWA_STATUS_CHANGED_EVENT,
  registerServiceWorker,
} from '../pwa/registration';
import { renderDevPage } from '../pages/index';

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

interface LauncherManifest {
  id: string;
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  icons: ManifestIcon[];
}

// @ts-ignore __dirname is provided by the Vitest runtime for this test module.
const ROOT_DIR = path.resolve(__dirname, '../../');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function mockServiceWorkerContainer(
  register: ReturnType<typeof vi.fn>,
): Pick<ServiceWorkerContainer, 'register'> {
  return { register } as unknown as Pick<ServiceWorkerContainer, 'register'>;
}

describe('PWA Manifest', () => {
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
  let manifest: LauncherManifest;

  beforeAll(() => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(content) as LauncherManifest;
  });

  it('exists and parses as valid JSON', () => {
    expect(manifest).toBeDefined();
  });

  it('contains required fields and values', () => {
    expect(manifest.id).toBe('/');
    expect(manifest.start_url).toBe('/app');
    expect(manifest.scope).toBe('/');
    expect(manifest.name).toBe('Launcher');
    expect(manifest.short_name).toBe('Launcher');
    expect(manifest.display).toBe('standalone');
  });

  it('declares correct icon entries and MIME types', () => {
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    for (const icon of manifest.icons) {
      expect(icon.src).toMatch(/^\/icons\/icon-/);
      expect(icon.type).toBe('image/png');
      expect(['any', 'maskable']).toContain(icon.purpose);
    }
  });

  it('declared icons physically exist and have valid PNG dimensions', () => {
    for (const icon of manifest.icons) {
      const iconPath = path.join(PUBLIC_DIR, icon.src.slice(1));
      expect(fs.existsSync(iconPath)).toBe(true);

      const buffer = fs.readFileSync(iconPath);
      expect(Array.from(buffer.subarray(0, 8))).toEqual([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ]);

      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      const expectedSize = Number.parseInt(icon.sizes.split('x')[0], 10);
      expect(width).toBe(expectedSize);
      expect(height).toBe(expectedSize);
    }
  });
});

describe('Service Worker', () => {
  const swPath = path.join(PUBLIC_DIR, 'sw.js');

  it('exists physically and does not use Cache Storage or fetch events', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).not.toMatch(/caches/i);
    expect(swContent).not.toMatch(/addEventListener\(['"]fetch['"]/i);
  });

  it('reports unsupported browsers without throwing', async () => {
    const result = await registerServiceWorker({
      isDevelopment: false,
      serviceWorker: null,
      eventTarget: new EventTarget(),
    });

    expect(result.state).toBe('unsupported');
    expect(result.supported).toBe(false);
    expect(result.registered).toBe(false);
  });

  it('does not attempt registration during development', async () => {
    const register = vi.fn();
    const result = await registerServiceWorker({
      isDevelopment: true,
      serviceWorker: mockServiceWorkerContainer(register),
      eventTarget: new EventTarget(),
    });

    expect(register).not.toHaveBeenCalled();
    expect(result.state).toBe('disabled-in-development');
    expect(result.supported).toBe(true);
    expect(result.disabledInDev).toBe(true);
  });

  it('reports successful production registration', async () => {
    const register = vi
      .fn()
      .mockResolvedValue({} as ServiceWorkerRegistration);
    const eventTarget = new EventTarget();
    const statusListener = vi.fn();
    eventTarget.addEventListener(PWA_STATUS_CHANGED_EVENT, statusListener);

    const result = await registerServiceWorker({
      isDevelopment: false,
      serviceWorker: mockServiceWorkerContainer(register),
      eventTarget,
    });

    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(result.state).toBe('registered');
    expect(result.registered).toBe(true);
    expect(statusListener).toHaveBeenCalledTimes(2);
  });

  it('handles production registration rejection without throwing', async () => {
    const register = vi.fn().mockRejectedValue(new Error('Test rejection'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await registerServiceWorker({
      isDevelopment: false,
      serviceWorker: mockServiceWorkerContainer(register),
      eventTarget: new EventTarget(),
    });

    expect(result.state).toBe('failed');
    expect(result.registered).toBe(false);
    expect(result.error).toBe('Test rejection');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('Dev Page PWA Status', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders the required PWA status fields', async () => {
    await registerServiceWorker({
      isDevelopment: true,
      serviceWorker: mockServiceWorkerContainer(vi.fn()),
      eventTarget: new EventTarget(),
    });

    const element = renderDevPage();

    expect(element.innerHTML).toContain('<h2>PWA Status</h2>');
    expect(element.textContent).toContain('Manifest URL');
    expect(element.textContent).toContain('Service Worker State');
    expect(element.textContent).toContain('Disabled in development');
    expect(element.textContent).toContain(
      'Application-managed caching and offline behavior are not implemented',
    );
  });

  it('updates a directly rendered page after asynchronous registration completes', async () => {
    let resolveRegistration: ((value: ServiceWorkerRegistration) => void) | undefined;
    const pendingRegistration = new Promise<ServiceWorkerRegistration>((resolve) => {
      resolveRegistration = resolve;
    });
    const register = vi.fn().mockReturnValue(pendingRegistration);

    const registrationPromise = registerServiceWorker({
      isDevelopment: false,
      serviceWorker: mockServiceWorkerContainer(register),
      eventTarget: window,
    });
    const element = renderDevPage();

    expect(element.querySelector('[data-pwa-state]')?.textContent).toBe(
      'Registering',
    );

    resolveRegistration?.({} as ServiceWorkerRegistration);
    await registrationPromise;

    expect(element.querySelector('[data-pwa-state]')?.textContent).toBe(
      'Registered',
    );
    expect(element.querySelector('[data-pwa-registered]')?.textContent).toBe(
      'Yes',
    );
  });

  it('renders registration errors as text rather than markup', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const register = vi
      .fn()
      .mockRejectedValue(new Error('<img src=x onerror=alert(1)>'));

    await registerServiceWorker({
      isDevelopment: false,
      serviceWorker: mockServiceWorkerContainer(register),
      eventTarget: new EventTarget(),
    });

    const element = renderDevPage();
    const errorElement = element.querySelector<HTMLElement>('[data-pwa-error]');

    expect(errorElement?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(errorElement?.querySelector('img')).toBeNull();
    consoleError.mockRestore();
  });
});
