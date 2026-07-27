import { LauncherItemData } from '../types/launcher';
import { getIconSvg } from './icons';

export function renderLauncherItem(item: LauncherItemData): HTMLElement {
  const a = document.createElement('a');
  a.className = 'launcher-item';
  a.href = item.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  // Use data attribute instead of id to allow multiple instances if needed, or stick to item ID invariants
  a.dataset.itemId = item.itemId;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'launcher-icon';
  iconDiv.style.backgroundColor = item.iconColor;
  iconDiv.style.color = '#ffffff'; // White icon stroke for contrast against colored background
  iconDiv.innerHTML = getIconSvg(item.iconType);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'launcher-label';
  labelDiv.textContent = item.label;

  a.appendChild(iconDiv);
  a.appendChild(labelDiv);

  return a;
}

export function renderLauncherGrid(items: LauncherItemData[]): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'launcher-grid';

  items.forEach(item => {
    grid.appendChild(renderLauncherItem(item));
  });

  return grid;
}
