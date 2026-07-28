import { describe, expect, it } from 'vitest';
import {
  parseEmulatorPort,
  resolveFirebaseMode,
} from '../firebase/config';
import { isValidHttpsUrl } from '../types/launcher';
import {
  ACTIVITY_UPDATE_INTERVAL_MS,
  isActivityUpdateDue,
} from '../utils/activity';
import {
  formatSortKey,
  isValidSortKey,
  nextSortKey,
  orderedItemIdsAfterMove,
  sortKeyForIndex,
} from '../utils/sort-key';
import { generateItemId, isValidItemId } from '../utils/uuid';

describe('Firebase configuration', () => {
  it('uses emulator mode when explicitly enabled', () => {
    expect(resolveFirebaseMode({ VITE_FIREBASE_USE_EMULATORS: 'true' })).toBe('emulator');
  });

  it('requires all essential production configuration values', () => {
    expect(
      resolveFirebaseMode({
        VITE_FIREBASE_API_KEY: 'key',
        VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'example',
        VITE_FIREBASE_APP_ID: 'app-id',
      }),
    ).toBe('firebase-project');
    expect(
      resolveFirebaseMode({
        VITE_FIREBASE_API_KEY: 'key',
        VITE_FIREBASE_PROJECT_ID: 'example',
      }),
    ).toBe('unconfigured');
  });

  it('accepts valid emulator ports and rejects invalid ones', () => {
    expect(parseEmulatorPort('8080', 9999)).toBe(8080);
    expect(parseEmulatorPort('invalid', 9999)).toBe(9999);
    expect(parseEmulatorPort('70000', 9999)).toBe(9999);
  });
});

describe('Activity throttling', () => {
  const now = 2 * ACTIVITY_UPDATE_INTERVAL_MS;

  it('updates profiles with no usable stored activity timestamp', () => {
    expect(isActivityUpdateDue(null, now)).toBe(true);
  });

  it('does not update again before the rolling 24-hour interval', () => {
    expect(isActivityUpdateDue(now - ACTIVITY_UPDATE_INTERVAL_MS + 1, now)).toBe(false);
  });

  it('updates when the rolling 24-hour interval has elapsed', () => {
    expect(isActivityUpdateDue(now - ACTIVITY_UPDATE_INTERVAL_MS, now)).toBe(true);
  });
});

describe('Launcher identity and validation', () => {
  it('generates a valid lowercase UUIDv7', () => {
    expect(isValidItemId(generateItemId())).toBe(true);
  });

  it('accepts only parser-valid HTTPS URLs', () => {
    expect(isValidHttpsUrl('https://example.com/path')).toBe(true);
    expect(isValidHttpsUrl('http://example.com')).toBe(false);
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpsUrl('not a URL')).toBe(false);
  });
});

describe('Launcher sort keys', () => {
  it('formats fixed-width keys that preserve numeric order lexicographically', () => {
    const keys = [sortKeyForIndex(9), sortKeyForIndex(1), sortKeyForIndex(0)].sort();
    expect(keys).toEqual([
      formatSortKey(1000),
      formatSortKey(2000),
      formatSortKey(10000),
    ]);
  });

  it('computes a unique next key after deletions or reordering', () => {
    expect(nextSortKey([formatSortKey(1000), formatSortKey(3000)])).toBe(
      formatSortKey(4000),
    );
  });

  it('rejects non-canonical sort keys', () => {
    expect(isValidSortKey('000000001000')).toBe(true);
    expect(isValidSortKey('1000')).toBe(false);
    expect(() => nextSortKey(['1000'])).toThrow('Invalid existing sort key');
  });

  it('moves an item without losing or duplicating identities', () => {
    expect(orderedItemIdsAfterMove(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(orderedItemIdsAfterMove(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
  });
});
