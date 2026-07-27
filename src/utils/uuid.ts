import { uuidv7 } from 'uuidv7';

export function generateItemId(): string {
  // UUIDv7 is naturally lowercase and canonical format
  return uuidv7();
}

export function isValidItemId(id: string): boolean {
  // Check if it's a valid canonical UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) && id === id.toLowerCase();
}
