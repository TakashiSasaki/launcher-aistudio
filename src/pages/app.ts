import { User } from 'firebase/auth';
import { renderLauncherGrid } from '../components/launcher-grid';
import {
  loginAnonymously,
  loginWithGoogle,
  logoutUser,
  setupAuthListener,
} from '../firebase/auth';
import { appConfig } from '../firebase/config';
import {
  addLauncherItem,
  createOrUpdateProfile,
  deleteLauncherItem,
  subscribeToLauncherItems,
  swapLauncherItemSortKeys,
  updateLauncherItem,
} from '../firebase/db';
import {
  LauncherItem,
  isIconType,
  isValidHttpsUrl,
} from '../types/launcher';
import { nextSortKey } from '../utils/sort-key';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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
    <div id="auth-state" style="margin-bottom: 10px;"><p>Loading...</p></div>
    <div id="auth-error-feedback" role="alert" style="color: #b00020; margin-bottom: 10px;"></div>
    <div id="app-content" style="display: none;">
      <div id="error-feedback" role="alert" style="color: #b00020; margin-bottom: 10px;"></div>
      <div style="margin-bottom: 20px;">
        <button id="btn-create" type="button" style="padding: 8px 16px;">Create Item</button>
        <button id="btn-signout" type="button" style="padding: 8px 16px;">Sign Out</button>
      </div>
      <div id="item-form-container" style="display: none; border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h3 id="form-title">Create Item</h3>
        <input type="hidden" id="form-item-id">
        <div style="margin-bottom: 10px;">
          <label for="form-label" style="display:block;margin-bottom:5px;">Label</label>
          <input type="text" id="form-label" maxlength="100" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 10px;">
          <label for="form-url" style="display:block;margin-bottom:5px;">URL (HTTPS only)</label>
          <input type="url" id="form-url" maxlength="2048" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 10px;">
          <label for="form-bg" style="display:block;margin-bottom:5px;">Icon Background Color</label>
          <input type="color" id="form-bg" value="#3367d6">
        </div>
        <div style="margin-bottom: 10px;">
          <label for="form-fg" style="display:block;margin-bottom:5px;">Icon Foreground Color</label>
          <input type="color" id="form-fg" value="#ffffff">
        </div>
        <div style="margin-bottom: 10px;">
          <label for="form-icon-type" style="display:block;margin-bottom:5px;">Icon Type</label>
          <select id="form-icon-type" style="width: 100%; padding: 8px;">
            <option value="generic-web">Generic Web</option>
            <option value="link">Link</option>
            <option value="book">Book</option>
            <option value="mail">Mail</option>
          </select>
        </div>
        <div style="margin-bottom: 10px;">
          <label><input type="checkbox" id="form-enabled" checked> Enabled</label>
        </div>
        <div>
          <button id="btn-save" type="button" style="padding: 8px 16px; background: #3367d6; color: white; border: none;">Save</button>
          <button id="btn-cancel" type="button" style="padding: 8px 16px;">Cancel</button>
        </div>
      </div>
      <div id="grid-container"></div>
      <div id="empty-state" style="display: none; padding: 20px; text-align: center; color: #666;">
        No items yet. Create one above.
      </div>
      <div id="list-management" style="margin-top: 30px;">
        <h3>Manage Items</h3>
        <ul id="manage-list" style="list-style-type: none; padding: 0;"></ul>
      </div>
    </div>
    <div style="margin-top: 20px;"><a href="/" data-link>&larr; Back to Home</a></div>
  `;

  const authStateEl = container.querySelector('#auth-state') as HTMLElement;
  const authErrorFeedback = container.querySelector('#auth-error-feedback') as HTMLElement;
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

  let currentUser: User | null = null;
  let currentItems: LauncherItem[] = [];
  let unsubscribeItems: (() => void) | null = null;

  const showError = (target: HTMLElement, message: string) => {
    target.textContent = message;
  };

  const clearError = (target: HTMLElement) => {
    target.textContent = '';
  };

  const renderManageList = () => {
    manageList.replaceChildren();

    currentItems.forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '10px';
      listItem.style.padding = '10px';
      listItem.style.border = '1px solid #ddd';
      listItem.style.display = 'flex';
      listItem.style.justifyContent = 'space-between';
      listItem.style.alignItems = 'center';

      const info = document.createElement('span');
      info.textContent = `${item.label} (${item.enabled ? 'Enabled' : 'Disabled'})`;
      if (!item.enabled) {
        info.style.color = '#666';
        info.style.textDecoration = 'line-through';
      }
      listItem.appendChild(info);

      const controls = document.createElement('div');
      const addControl = (label: string, action: () => void | Promise<void>) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.style.marginLeft = '8px';
        button.addEventListener('click', () => void action());
        controls.appendChild(button);
        return button;
      };

      const moveUp = addControl('↑', async () => {
        if (!currentUser || index === 0) return;
        try {
          await swapLauncherItemSortKeys(
            currentUser.uid,
            item,
            currentItems[index - 1],
          );
        } catch (error) {
          showError(errorFeedback, `Failed to move item: ${errorMessage(error)}`);
        }
      });
      moveUp.disabled = index === 0;

      const moveDown = addControl('↓', async () => {
        if (!currentUser || index === currentItems.length - 1) return;
        try {
          await swapLauncherItemSortKeys(
            currentUser.uid,
            item,
            currentItems[index + 1],
          );
        } catch (error) {
          showError(errorFeedback, `Failed to move item: ${errorMessage(error)}`);
        }
      });
      moveDown.disabled = index === currentItems.length - 1;

      addControl(item.enabled ? 'Disable' : 'Enable', async () => {
        if (!currentUser) return;
        try {
          await updateLauncherItem(currentUser.uid, item.itemId, {
            enabled: !item.enabled,
          });
        } catch (error) {
          showError(errorFeedback, `Failed to update item: ${errorMessage(error)}`);
        }
      });

      addControl('Edit', () => {
        formTitle.textContent = 'Edit Item';
        formItemId.value = item.itemId;
        formLabel.value = item.label;
        formUrl.value = item.url;
        formBg.value = item.icon.background;
        formFg.value = item.icon.foreground;
        formIconType.value = item.icon.type;
        formEnabled.checked = item.enabled;
        formContainer.style.display = 'block';
        formLabel.focus();
      });

      const deleteButton = addControl('Delete', async () => {
        if (!currentUser || !window.confirm(`Delete “${item.label}”?`)) return;
        try {
          await deleteLauncherItem(currentUser.uid, item.itemId);
        } catch (error) {
          showError(errorFeedback, `Failed to delete item: ${errorMessage(error)}`);
        }
      });
      deleteButton.style.color = '#b00020';

      listItem.appendChild(controls);
      manageList.appendChild(listItem);
    });
  };

  const updateGrid = () => {
    gridContainer.replaceChildren();
    emptyState.style.display = currentItems.length === 0 ? 'block' : 'none';
    if (currentItems.length > 0) {
      gridContainer.appendChild(renderLauncherGrid(currentItems));
    }
    renderManageList();
  };

  const renderSignedOut = () => {
    appContentEl.style.display = 'none';
    authStateEl.replaceChildren();

    const choices = document.createElement('div');
    choices.style.display = 'flex';
    choices.style.flexDirection = 'column';
    choices.style.gap = '10px';
    choices.style.maxWidth = '300px';

    const googleButton = document.createElement('button');
    googleButton.type = 'button';
    googleButton.textContent = 'Continue with Google';
    googleButton.addEventListener('click', async () => {
      clearError(authErrorFeedback);
      try {
        await loginWithGoogle();
      } catch (error) {
        showError(authErrorFeedback, `Google sign-in failed: ${errorMessage(error)}`);
      }
    });

    const anonymousButton = document.createElement('button');
    anonymousButton.type = 'button';
    anonymousButton.textContent = 'Continue anonymously';
    anonymousButton.addEventListener('click', async () => {
      clearError(authErrorFeedback);
      try {
        await loginAnonymously();
      } catch (error) {
        showError(authErrorFeedback, `Anonymous sign-in failed: ${errorMessage(error)}`);
      }
    });

    choices.append(googleButton, anonymousButton);
    authStateEl.appendChild(choices);
  };

  const unsubscribeAuth = setupAuthListener((user) => {
    currentUser = user;
    unsubscribeItems?.();
    unsubscribeItems = null;
    currentItems = [];
    updateGrid();
    clearError(authErrorFeedback);

    if (!user) {
      renderSignedOut();
      return;
    }

    authStateEl.replaceChildren();
    const identity = document.createElement('p');
    const displayIdentity = user.isAnonymous
      ? 'Anonymous User'
      : user.displayName || user.email || 'Google User';
    identity.textContent = `Signed in as ${displayIdentity}`;
    authStateEl.appendChild(identity);
    appContentEl.style.display = 'block';

    void createOrUpdateProfile(user).catch((error) => {
      showError(errorFeedback, `Profile update failed: ${errorMessage(error)}`);
    });

    unsubscribeItems = subscribeToLauncherItems(
      user.uid,
      (items) => {
        currentItems = items;
        updateGrid();
      },
      (error) => {
        showError(errorFeedback, `Unable to load launcher items: ${error.message}`);
      },
    );
  });

  container.querySelector('#btn-signout')?.addEventListener('click', async () => {
    clearError(errorFeedback);
    try {
      await logoutUser();
    } catch (error) {
      showError(errorFeedback, `Sign-out failed: ${errorMessage(error)}`);
    }
  });

  container.querySelector('#btn-create')?.addEventListener('click', () => {
    clearError(errorFeedback);
    formTitle.textContent = 'Create Item';
    formItemId.value = '';
    formLabel.value = '';
    formUrl.value = '';
    formBg.value = '#3367d6';
    formFg.value = '#ffffff';
    formIconType.value = 'generic-web';
    formEnabled.checked = true;
    formContainer.style.display = 'block';
    formLabel.focus();
  });

  container.querySelector('#btn-cancel')?.addEventListener('click', () => {
    formContainer.style.display = 'none';
  });

  container.querySelector('#btn-save')?.addEventListener('click', async () => {
    if (!currentUser) return;
    clearError(errorFeedback);

    const label = formLabel.value.trim();
    const url = formUrl.value.trim();
    const foreground = formFg.value.toLowerCase();
    const background = formBg.value.toLowerCase();

    if (label.length === 0 || label.length > 100) {
      showError(errorFeedback, 'Label must contain between 1 and 100 characters.');
      return;
    }
    if (url.length > 2048 || !isValidHttpsUrl(url)) {
      showError(errorFeedback, 'Enter a valid HTTPS URL of at most 2048 characters.');
      return;
    }
    if (!/^#[0-9a-f]{6}$/.test(foreground) || !/^#[0-9a-f]{6}$/.test(background)) {
      showError(errorFeedback, 'Colors must be lowercase six-digit hexadecimal values.');
      return;
    }
    if (!isIconType(formIconType.value)) {
      showError(errorFeedback, 'Select a supported icon type.');
      return;
    }

    const editableFields = {
      label,
      url,
      icon: {
        type: formIconType.value,
        foreground,
        background,
      },
      openMode: 'new-tab' as const,
      enabled: formEnabled.checked,
    };

    try {
      if (formItemId.value) {
        await updateLauncherItem(currentUser.uid, formItemId.value, editableFields);
      } else {
        await addLauncherItem(currentUser.uid, {
          ...editableFields,
          sortKey: nextSortKey(currentItems.map((item) => item.sortKey)),
        });
      }
      formContainer.style.display = 'none';
    } catch (error) {
      showError(errorFeedback, `Failed to save item: ${errorMessage(error)}`);
    }
  });

  container.addEventListener(
    'launcher:cleanup',
    () => {
      unsubscribeAuth();
      unsubscribeItems?.();
      unsubscribeItems = null;
    },
    { once: true },
  );

  return container;
}
