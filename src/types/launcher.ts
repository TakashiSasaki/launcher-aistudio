export interface LauncherItem {
  schemaVersion: number;
  itemId: string;
  label: string;
  url: string;
  icon: {
    type: string;
    foreground: string;
    background: string;
  };
  sortKey: string;
  openMode: 'new-tab';
  enabled: boolean;
  origin: {
    type: string;
    [key: string]: any;
  };
  demoManaged: boolean;
  createdAt: any;
  updatedAt: any;
}

export function isValidHttpsUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
