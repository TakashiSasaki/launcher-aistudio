import { LauncherItem } from '../types/launcher';
import { getIconSvg } from './icons';

export function renderLauncherItem(item: LauncherItem): HTMLElement {
  const a = document.createElement('a');
  a.className = 'launcher-item';
  a.href = item.url;
  if (item.openMode === 'new-tab') {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  a.dataset.itemId = item.itemId;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'launcher-icon';
  iconDiv.style.backgroundColor = item.icon.background;
  iconDiv.style.color = item.icon.foreground;
  iconDiv.innerHTML = getIconSvg(item.icon.type);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'launcher-label';
  labelDiv.textContent = item.label;

  a.appendChild(iconDiv);
  a.appendChild(labelDiv);

  if (!item.enabled) {
    a.style.opacity = '0.5';
    a.style.pointerEvents = 'none';
  }

  return a;
}

export function renderLauncherGrid(items: LauncherItem[]): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'launcher-grid';
  items.filter(item => item.enabled !== false).forEach(item => {
    grid.appendChild(renderLauncherItem(item));
  });
  return grid;
}
