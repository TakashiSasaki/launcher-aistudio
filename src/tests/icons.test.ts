import { describe, it, expect } from 'vitest';
import { getIconSvg, iconPrimitives } from '../components/icons';

describe('Icon Rendering', () => {
  it('returns the correct SVG for known types', () => {
    expect(getIconSvg('mail')).toBe(iconPrimitives['mail']);
    expect(getIconSvg('shopping')).toBe(iconPrimitives['shopping']);
  });

  it('falls back to globe for unknown types without evaluating arbitrary injection', () => {
    expect(getIconSvg('unknown-type')).toBe(iconPrimitives['globe']);
    expect(getIconSvg('<script>alert(1)</script>')).toBe(iconPrimitives['globe']);
  });
});
