import { initRouter } from './router';
import { registerServiceWorker } from './pwa/registration';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    initRouter(appElement);
  }
  registerServiceWorker();
});
