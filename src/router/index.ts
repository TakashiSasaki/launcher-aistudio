import { 
  renderHomePage, 
  renderAppPage, 
  renderAdminPage, 
  renderDevPage, 
  renderDemoPage, 
  renderNotFoundPage 
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
  const handler = routes[path];
  if (handler) {
    return handler();
  }
  return renderNotFoundPage();
}

export function initRouter(appElement: HTMLElement) {
  const render = () => {
    appElement.innerHTML = '';
    const path = window.location.pathname;
    const page = resolveRoute(path);
    appElement.appendChild(page);
  };

  window.addEventListener('popstate', render);

  document.body.addEventListener('click', e => {
    if (e.target instanceof HTMLElement) {
      // Find the closest link in case we clicked inside an 'a' tag
      const link = e.target.closest('a');
      if (link && link.hasAttribute('data-link')) {
        e.preventDefault();
        window.history.pushState(null, '', link.href);
        render();
      }
    }
  });

  render();
}
