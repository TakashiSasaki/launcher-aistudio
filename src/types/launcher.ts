export const ICON_TYPES = ['generic-web', 'link', 'book', 'mail'] as const;

export type IconType = (typeof ICON_TYPES)[number];

export interface LauncherIcon {
  type: IconType;
  foreground: string;
  background: string;
}

export type LauncherItemOrigin =
  | { type: 'user' }
  | {
      type: 'demo';
      datasetId: string;
      datasetVersion?: number;
      templateItemId?: string;
      demoLoadId?: string;
    };

export interface LauncherItem {
  schemaVersion: 1;
  itemId: string;
  label: string;
  url: string;
  icon: LauncherIcon;
  sortKey: string;
  openMode: 'new-tab';
  enabled: boolean;
  origin: LauncherItemOrigin;
  demoManaged: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface NewLauncherItem {
  label: string;
  url: string;
  icon: LauncherIcon;
  sortKey: string;
  openMode: 'new-tab';
  enabled: boolean;
}

export type LauncherItemUpdates = Partial<
  Pick<LauncherItem, 'label' | 'url' | 'icon' | 'sortKey' | 'openMode' | 'enabled'>
>;

export function isIconType(value: string): value is IconType {
  return (ICON_TYPES as readonly string[]).includes(value);
}

export function isValidHttpsUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
