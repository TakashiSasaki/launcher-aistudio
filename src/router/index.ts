import {
  renderAdminPage,
  renderAppPage,
  renderDemoPage,
  renderDevPage,
  renderHomePage,
  renderNotFoundPage,
} from '../pages/index';

type RouteHandler = () => HTMLElement;

const routes: Record<string, RouteHandler> = {
  '/': renderHomePage,
  '/app': renderAppPage,
  '/admin': renderAdminPage,
  '/dev': renderDevPage,
  '/demo': renderDemoPage,
};

export function resolveRoute(path: string): HTMLElement {
  return (routes[path] || renderNotFoundPage)();
}

export function initRouter(appElement: HTMLElement) {
  let currentPage: HTMLElement | null = null;

  const render = () => {
    currentPage?.dispatchEvent(new Event('launcher:cleanup'));
    appElement.replaceChildren();

    currentPage = resolveRoute(window.location.pathname);
    appElement.appendChild(currentPage);
  };

  window.addEventListener('popstate', render);

  document.body.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;

    const link = event.target.closest('a');
    if (!link?.hasAttribute('data-link')) return;

    event.preventDefault();
    window.history.pushState(null, '', link.href);
    render();
  });

  render();
}
