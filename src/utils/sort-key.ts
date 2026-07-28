export const SORT_KEY_WIDTH = 12;
export const SORT_KEY_STEP = 1000;

const SORT_KEY_PATTERN = new RegExp(`^[0-9]{${SORT_KEY_WIDTH}}$`);
const MAX_SORT_VALUE = Number('9'.repeat(SORT_KEY_WIDTH));

export function isValidSortKey(value: string): boolean {
  return SORT_KEY_PATTERN.test(value);
}

export function formatSortKey(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_SORT_VALUE) {
    throw new RangeError(`Sort-key value must be an integer between 0 and ${MAX_SORT_VALUE}.`);
  }

  return String(value).padStart(SORT_KEY_WIDTH, '0');
}

export function sortKeyForIndex(index: number): string {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new RangeError('Sort-key index must be a non-negative integer.');
  }

  return formatSortKey((index + 1) * SORT_KEY_STEP);
}

export function nextSortKey(existingSortKeys: readonly string[]): string {
  const maximum = existingSortKeys.reduce((currentMaximum, sortKey) => {
    if (!isValidSortKey(sortKey)) {
      throw new Error(`Invalid existing sort key: ${sortKey}`);
    }

    return Math.max(currentMaximum, Number(sortKey));
  }, 0);

  return formatSortKey(maximum + SORT_KEY_STEP);
}

export function orderedItemIdsAfterMove(
  itemIds: readonly string[],
  itemId: string,
  direction: -1 | 1,
): string[] {
  const fromIndex = itemIds.indexOf(itemId);
  if (fromIndex < 0) {
    throw new Error(`Unknown launcher item: ${itemId}`);
  }

  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= itemIds.length) {
    return [...itemIds];
  }

  const reordered = [...itemIds];
  [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];
  return reordered;
}
