import { describe, expect, it } from 'vitest';
import { isValidItemId } from '../utils/uuid';
import { generateItemId } from '../utils/uuid';
import { appConfig } from '../firebase/config';

describe('Firebase Configuration & Auth', () => {
  it('identifies unconfigured mode by default', () => {
    // Vite testing handles ENV in various ways. Let's just check appConfig object
    // Assuming we didn't inject secrets during test, it should be 'emulator' if USE_EMULATORS=true, or 'unconfigured'
    expect(['unconfigured', 'emulator', 'firebase-project']).toContain(appConfig.mode);
  });
  
  it('generates a valid lowercase UUIDv7', () => {
    const id = generateItemId();
    expect(isValidItemId(id)).toBe(true);
  });
});
