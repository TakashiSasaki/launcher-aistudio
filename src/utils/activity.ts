export const ACTIVITY_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function isActivityUpdateDue(
  lastActiveAtMs: number | null,
  nowMs: number = Date.now(),
): boolean {
  if (lastActiveAtMs === null) {
    return true;
  }

  return nowMs - lastActiveAtMs >= ACTIVITY_UPDATE_INTERVAL_MS;
}
