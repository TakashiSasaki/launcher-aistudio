import { describe, expect, it, vi } from 'vitest';
import { initRouter, resolveRoute } from '../router/index';

describe('Route Resolution', () => {
  it('resolves the root path', () => {
    const element = resolveRoute('/');
    expect(element.querySelector('h1')?.textContent).toBe('Launcher PWA');
  });

  it('resolves the app surface', () => {
    const element = resolveRoute('/app');
    expect(element.querySelector('h1')?.textContent).toBe('App');
  });

  it('resolves the admin placeholder', () => {
    const element = resolveRoute('/admin');
    expect(element.querySelector('h1')?.textContent).toBe('Admin');
  });

  it('resolves the developer info page', () => {
    const element = resolveRoute('/dev');
    expect(element.querySelector('h1')?.textContent).toBe('Developer Info');
  });

  it('resolves the demo grid page', () => {
    const element = resolveRoute('/demo');
    expect(element.querySelector('h1')?.textContent).toBe('Demo Grid');
  });

  it('returns a 404 for unknown routes', () => {
    const element = resolveRoute('/unknown-path-123');
    expect(element.querySelector('h1')?.textContent).toContain('404');
  });

  it('notifies the current page before route replacement', () => {
    const appElement = document.createElement('div');
    window.history.replaceState(null, '', '/');
    initRouter(appElement);

    const cleanup = vi.fn();
    appElement.firstElementChild?.addEventListener('launcher:cleanup', cleanup);

    window.history.pushState(null, '', '/demo');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(cleanup).toHaveBeenCalledOnce();
    expect(appElement.querySelector('h1')?.textContent).toBe('Demo Grid');
  });
});
