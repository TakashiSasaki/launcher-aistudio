import { describe, it, expect } from 'vitest';
import { resolveRoute } from '../router/index';

describe('Route Resolution', () => {
  it('resolves the root path', () => {
    const el = resolveRoute('/');
    expect(el.querySelector('h1')?.textContent).toBe('Launcher PWA');
  });

  it('resolves the app placeholder', () => {
    const el = resolveRoute('/app');
    expect(el.querySelector('h1')?.textContent).toBe('App');
  });

  it('resolves the admin placeholder', () => {
    const el = resolveRoute('/admin');
    expect(el.querySelector('h1')?.textContent).toBe('Admin');
  });

  it('resolves the developer info page', () => {
    const el = resolveRoute('/dev');
    expect(el.querySelector('h1')?.textContent).toBe('Developer Info');
  });

  it('resolves the demo grid page', () => {
    const el = resolveRoute('/demo');
    expect(el.querySelector('h1')?.textContent).toBe('Demo Grid');
  });

  it('returns a 404 for unknown routes', () => {
    const el = resolveRoute('/unknown-path-123');
    expect(el.querySelector('h1')?.textContent).toContain('404');
  });
});
