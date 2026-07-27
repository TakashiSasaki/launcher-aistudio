export interface LauncherItemData {
  itemId: string;
  url: string;
  label: string;
  iconType: string;
  iconColor: string;
}

export function isValidHttpsUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
