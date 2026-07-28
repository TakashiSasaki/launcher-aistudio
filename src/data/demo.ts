import { LauncherItem } from '../types/launcher';

export const demoData: LauncherItem[] = [
  {
    schemaVersion: 1,
    itemId: '018b1a80-1234-7000-8000-000000000001',
    url: 'https://example.com/search',
    label: 'Search Engine',
    icon: { type: 'generic-web', foreground: '#ffffff', background: '#4285F4' },
    sortKey: '1000',
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'demo', datasetId: 'default' },
    demoManaged: true,
    createdAt: null,
    updatedAt: null
  },
  {
    schemaVersion: 1,
    itemId: '018b1a80-1234-7000-8000-000000000002',
    url: 'https://example.com/mail',
    label: 'Email',
    icon: { type: 'mail', foreground: '#ffffff', background: '#EA4335' },
    sortKey: '2000',
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'demo', datasetId: 'default' },
    demoManaged: true,
    createdAt: null,
    updatedAt: null
  }
];
