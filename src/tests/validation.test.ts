import { describe, it, expect } from 'vitest';
import { isValidHttpsUrl } from '../types/launcher';
import { generateItemId, isValidItemId } from '../utils/uuid';

describe('Validation Utilities', () => {
  describe('isValidHttpsUrl', () => {
    it('returns true for valid https URLs', () => {
      expect(isValidHttpsUrl('https://example.com')).toBe(true);
      expect(isValidHttpsUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('returns false for http URLs', () => {
      expect(isValidHttpsUrl('http://example.com')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidHttpsUrl('not-a-url')).toBe(false);
      expect(isValidHttpsUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('UUID Utilities', () => {
    it('generates valid UUIDv7 format in lowercase', () => {
      const id = generateItemId();
      expect(isValidItemId(id)).toBe(true);
    });

    it('validates canonical UUID format', () => {
      expect(isValidItemId('018b1a80-1234-7000-8000-000000000001')).toBe(true);
      expect(isValidItemId('018B1A80-1234-7000-8000-000000000001')).toBe(false); // Uppercase rejected
      expect(isValidItemId('invalid-uuid')).toBe(false);
    });
  });
});
