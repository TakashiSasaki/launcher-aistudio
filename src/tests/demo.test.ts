import { describe, it, expect } from 'vitest';
import { demoData } from '../data/demo';
import { isValidHttpsUrl } from '../types/launcher';
import { isValidItemId } from '../utils/uuid';

describe('Demo Data Validation', () => {
  it('contains valid HTTPS URLs', () => {
    demoData.forEach(item => {
      expect(isValidHttpsUrl(item.url)).toBe(true);
    });
  });

  it('contains valid canonical UUIDv7 identifiers', () => {
    demoData.forEach(item => {
      // Demo uses hand-crafted ones that might technically be v7 formatted
      expect(isValidItemId(item.itemId)).toBe(true);
    });
  });
});
