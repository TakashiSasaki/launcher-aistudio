import { setupAuthListener, loginWithGoogle, loginAnonymously, logoutUser } from '../firebase/auth';
import { createOrUpdateProfile, subscribeToLauncherItems, addLauncherItem, updateLauncherItem, deleteLauncherItem } from '../firebase/db';
import { appConfig } from '../firebase/config';
import { User } from 'firebase/auth';
import { LauncherItem } from '../types/launcher';
import { renderLauncherGrid } from '../components/launcher-grid';

export function renderAppPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container app-container';
  
  if (appConfig.mode === 'unconfigured') {
    container.innerHTML = `
      <h1>App</h1>
      <p>Configuration required. Firebase is not configured.</p>
      <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
    `;
    return container;
  }
  
  container.innerHTML = `
    <h1>App</h1>
    <div id="auth-state" style="margin-bottom: 20px;">
      <p>Loading...</p>
    </div>
    <div id="app-content" style="display: none;">
      <div id="error-feedback" style="color: red; margin-bottom: 10px;"></div>
      <div style="margin-bottom: 20px;">
        <button id="btn-create" style="padding: 8px 16px;">Create Item</button>
        <button id="btn-signout" style="padding: 8px 16px;">Sign Out</button>
      </div>
      <div id="item-form-container" style="display: none; border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h3 id="form-title">Create Item</h3>
        <input type="hidden" id="form-item-id">
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">Label</label>
          <input type="text" id="form-label" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">URL (https://)</label>
          <input type="url" id="form-url" style="width: 100%; padding: 8px;" pattern="^https://.*">
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">Icon Background Color (#Hex)</label>
          <input type="text" id="form-bg" style="width: 100%; padding: 8px;" value="#3367d6" pattern="^#[0-9a-fA-F]{6}$">
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">Icon Foreground Color (#Hex)</label>
          <input type="text" id="form-fg" style="width: 100%; padding: 8px;" value="#ffffff" pattern="^#[0-9a-fA-F]{6}$">
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">Icon Type</label>
          <select id="form-icon-type" style="width: 100%; padding: 8px;">
            <option value="generic-web">Generic Web</option>
            <option value="link">Link</option>
            <option value="book">Book</option>
            <option value="mail">Mail</option>
          </select>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">
            <input type="checkbox" id="form-enabled" checked> Enabled
          </label>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display:block;margin-bottom:5px;">Sort Key (for ordering)</label>
          <input type="text" id="form-sort-key" style="width: 100%; padding: 8px;" value="1000">
        </div>
        <div>
          <button id="btn-save" style="padding: 8px 16px; background: #3367d6; color: white; border: none;">Save</button>
          <button id="btn-cancel" style="padding: 8px 16px;">Cancel</button>
        </div>
      </div>
      <div id="grid-container"></div>
      <div id="empty-state" style="display: none; padding: 20px; text-align: center; color: #666;">
        No items yet. Create one above!
      </div>
      <div id="list-management" style="margin-top: 30px;">
        <h3>Manage Items</h3>
        <ul id="manage-list" style="list-style-type: none; padding: 0;"></ul>
      </div>
    </div>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;
  
  const authStateEl = container.querySelector('#auth-state') as HTMLElement;
  const appContentEl = container.querySelector('#app-content') as HTMLElement;
  const gridContainer = container.querySelector('#grid-container') as HTMLElement;
  const emptyState = container.querySelector('#empty-state') as HTMLElement;
  const manageList = container.querySelector('#manage-list') as HTMLElement;
  const errorFeedback = container.querySelector('#error-feedback') as HTMLElement;
  
  const formContainer = container.querySelector('#item-form-container') as HTMLElement;
  const formTitle = container.querySelector('#form-title') as HTMLElement;
  const formItemId = container.querySelector('#form-item-id') as HTMLInputElement;
  const formLabel = container.querySelector('#form-label') as HTMLInputElement;
  const formUrl = container.querySelector('#form-url') as HTMLInputElement;
  const formBg = container.querySelector('#form-bg') as HTMLInputElement;
  const formFg = container.querySelector('#form-fg') as HTMLInputElement;
  const formIconType = container.querySelector('#form-icon-type') as HTMLSelectElement;
  const formEnabled = container.querySelector('#form-enabled') as HTMLInputElement;
  const formSortKey = container.querySelector('#form-sort-key') as HTMLInputElement;
  
  let currentUser: User | null = null;
  let currentItems: LauncherItem[] = [];
  let unsubscribeItems: (() => void) | null = null;
  
  const showError = (msg: string) => {
    errorFeedback.textContent = msg;
    setTimeout(() => { errorFeedback.textContent = ''; }, 5000);
  };
  
  const renderManageList = () => {
    manageList.innerHTML = '';
    currentItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.style.marginBottom = '10px';
      li.style.padding = '10px';
      li.style.border = '1px solid #ddd';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      
      const info = document.createElement('span');
      info.textContent = `${item.label} (${item.enabled ? 'Enabled' : 'Disabled'}) - Sort: ${item.sortKey}`;
      if (!item.enabled) {
        info.style.color = '#999';
        info.style.textDecoration = 'line-through';
      }
      li.appendChild(info);
      
      const controls = document.createElement('div');
      
      const btnUp = document.createElement('button');
      btnUp.textContent = '↑';
      btnUp.disabled = index === 0;
      btnUp.onclick = async () => {
        if (!currentUser || index === 0) return;
        const prevItem = currentItems[index - 1];
        try {
          const newSortKey = (parseInt(prevItem.sortKey, 10) - 10).toString();
          await updateLauncherItem(currentUser.uid, item.itemId, { sortKey: newSortKey });
        } catch(e) {
          showError('Failed to move up');
        }
      };
      
      const btnDown = document.createElement('button');
      btnDown.textContent = '↓';
      btnDown.disabled = index === currentItems.length - 1;
      btnDown.onclick = async () => {
        if (!currentUser || index === currentItems.length - 1) return;
        const nextItem = currentItems[index + 1];
        try {
          const newSortKey = (parseInt(nextItem.sortKey, 10) + 10).toString();
          await updateLauncherItem(currentUser.uid, item.itemId, { sortKey: newSortKey });
        } catch(e) {
          showError('Failed to move down');
        }
      };
      
      const btnToggle = document.createElement('button');
      btnToggle.textContent = item.enabled ? 'Disable' : 'Enable';
      btnToggle.style.marginLeft = '10px';
      btnToggle.onclick = async () => {
        if (!currentUser) return;
        try {
          await updateLauncherItem(currentUser.uid, item.itemId, { enabled: !item.enabled });
        } catch (e) {
          showError('Failed to toggle status');
        }
      };
      
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Edit';
      btnEdit.style.marginLeft = '10px';
      btnEdit.onclick = () => {
        formTitle.textContent = 'Edit Item';
        formItemId.value = item.itemId;
        formLabel.value = item.label;
        formUrl.value = item.url;
        formBg.value = item.icon.background;
        formFg.value = item.icon.foreground;
        formIconType.value = item.icon.type;
        formEnabled.checked = item.enabled;
        formSortKey.value = item.sortKey;
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
      };
      
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Delete';
      btnDelete.style.marginLeft = '10px';
      btnDelete.style.color = 'red';
      btnDelete.onclick = async () => {
        if (!currentUser) return;
        if (confirm(`Are you sure you want to delete "${item.label}"?`)) {
          try {
            await deleteLauncherItem(currentUser.uid, item.itemId);
          } catch(e) {
            showError('Failed to delete item');
          }
        }
      };
      
      controls.appendChild(btnUp);
      controls.appendChild(btnDown);
      controls.appendChild(btnToggle);
      controls.appendChild(btnEdit);
      controls.appendChild(btnDelete);
      li.appendChild(controls);
      manageList.appendChild(li);
    });
  };
  
  const updateGrid = () => {
    gridContainer.innerHTML = '';
    if (currentItems.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      gridContainer.appendChild(renderLauncherGrid(currentItems));
    }
    renderManageList();
  };
  
  setupAuthListener((user) => {
    currentUser = user;
    if (user) {
      createOrUpdateProfile(user);
      authStateEl.innerHTML = `<p>Signed in as ${user.isAnonymous ? 'Anonymous User' : user.displayName || user.email}</p>`;
      appContentEl.style.display = 'block';
      
      if (unsubscribeItems) unsubscribeItems();
      unsubscribeItems = subscribeToLauncherItems(user.uid, (items) => {
        currentItems = items;
        updateGrid();
      });
    } else {
      appContentEl.style.display = 'none';
      if (unsubscribeItems) unsubscribeItems();
      authStateEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
          <button id="btn-login-google" style="padding: 10px;">Continue with Google</button>
          <button id="btn-login-anon" style="padding: 10px;">Continue anonymously</button>
        </div>
      `;
      authStateEl.querySelector('#btn-login-google')?.addEventListener('click', loginWithGoogle);
      authStateEl.querySelector('#btn-login-anon')?.addEventListener('click', loginAnonymously);
    }
  });
  
  container.querySelector('#btn-signout')?.addEventListener('click', logoutUser);
  
  container.querySelector('#btn-create')?.addEventListener('click', () => {
    formTitle.textContent = 'Create Item';
    formItemId.value = '';
    formLabel.value = '';
    formUrl.value = '';
    formBg.value = '#3367d6';
    formFg.value = '#ffffff';
    formIconType.value = 'generic-web';
    formEnabled.checked = true;
    
    // Auto increment sort key based on last item
    const lastSortKey = currentItems.length > 0 ? parseInt(currentItems[currentItems.length - 1].sortKey, 10) : 0;
    formSortKey.value = (lastSortKey ? lastSortKey + 1000 : 1000).toString();
    
    formContainer.style.display = 'block';
  });
  
  container.querySelector('#btn-cancel')?.addEventListener('click', () => {
    formContainer.style.display = 'none';
  });
  
  container.querySelector('#btn-save')?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    const label = formLabel.value.trim();
    let urlStr = formUrl.value.trim();
    if (!urlStr.startsWith('https://')) {
      showError('URL must start with https://');
      return;
    }
    
    // validate url syntax
    try {
      new URL(urlStr);
    } catch(e) {
      showError('Invalid URL format');
      return;
    }
    
    const fg = formFg.value.trim();
    const bg = formBg.value.trim();
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    if (!hexRegex.test(fg) || !hexRegex.test(bg)) {
      showError('Colors must be 6-digit hex codes e.g. #ffffff');
      return;
    }
    
    const itemData = {
      label,
      url: urlStr,
      icon: {
        type: formIconType.value,
        foreground: fg,
        background: bg
      },
      sortKey: formSortKey.value || '1000',
      openMode: 'new-tab' as const,
      enabled: formEnabled.checked,
      schemaVersion: 1,
    };
    
    try {
      if (formItemId.value) {
        await updateLauncherItem(currentUser.uid, formItemId.value, itemData);
      } else {
        await addLauncherItem(currentUser.uid, itemData);
      }
      formContainer.style.display = 'none';
    } catch(e: any) {
      showError('Failed to save item: ' + (e.message || String(e)));
    }
  });

  // Cleanup on dismount (in a real framework, we'd hook into unmount)
  // For this vanilla JS router, we just let it leak or we'd need to add a cleanup hook to the router.
  
  return container;
}
