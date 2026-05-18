import { NavLink, useRouteError } from 'react-router-dom';
import ROUTES from '../../../router/routes.config';

export function NotFound() {
  const error = useRouteError();

  return (
    <div className="full-bleed-page neon-page px-4 py-16">
      <div className="neon-shell mx-auto max-w-2xl rounded-[32px] neon-card neon-card-strong p-8 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-300">Route Error</p>
        <h1 className="mt-3 text-4xl font-black text-white">Page not found</h1>
        <p className="neon-helper-text mt-4">
          {error?.statusText || error?.message || 'The route you tried to open does not exist.'}
        </p>
        <NavLink
          to={ROUTES.MAIN_MENU}
          className="neon-primary-button mt-6 inline-flex items-center rounded-full px-5 py-3 text-sm font-bold transition"
        >
          Return Home
        </NavLink>
      </div>
    </div>
  );
}
