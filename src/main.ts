import { initRouter } from './router';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    initRouter(appElement);
  }
});
