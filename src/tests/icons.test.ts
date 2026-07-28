import { describe, expect, it } from 'vitest';
import { getIconSvg, iconPrimitives } from '../components/icons';
import { ICON_TYPES } from '../types/launcher';

describe('Icon Rendering', () => {
  it('returns the maintained SVG for every persisted icon type', () => {
    for (const iconType of ICON_TYPES) {
      expect(getIconSvg(iconType)).toBe(iconPrimitives[iconType]);
    }
  });

  it('falls back to generic-web without evaluating arbitrary input', () => {
    expect(getIconSvg('unknown-type')).toBe(iconPrimitives['generic-web']);
    expect(getIconSvg('<script>alert(1)</script>')).toBe(
      iconPrimitives['generic-web'],
    );
  });
});
