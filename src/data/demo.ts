import { LauncherItem } from '../types/launcher';
import { sortKeyForIndex } from '../utils/sort-key';

export const demoData: LauncherItem[] = [
  {
    schemaVersion: 1,
    itemId: '018b1a80-1234-7000-8000-000000000001',
    url: 'https://example.com/search',
    label: 'Search Engine',
    icon: { type: 'generic-web', foreground: '#ffffff', background: '#4285f4' },
    sortKey: sortKeyForIndex(0),
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'demo', datasetId: 'default' },
    demoManaged: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    schemaVersion: 1,
    itemId: '018b1a80-1234-7000-8000-000000000002',
    url: 'https://example.com/mail',
    label: 'Email',
    icon: { type: 'mail', foreground: '#ffffff', background: '#ea4335' },
    sortKey: sortKeyForIndex(1),
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'demo', datasetId: 'default' },
    demoManaged: true,
    createdAt: null,
    updatedAt: null,
  },
];
