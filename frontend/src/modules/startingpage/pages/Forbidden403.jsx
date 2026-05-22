import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

export function Forbidden403({
  title = 'Access denied',
  message = 'You do not have permission to view this page. If you believe this is a mistake, contact an administrator.',
  returnTo = ROUTES.MAIN_MENU,
  returnLabel = 'Back to Main Menu',
}) {
  return (
    <div className="full-bleed-page neon-page px-4 py-16">
      <div className="neon-shell mx-auto max-w-2xl rounded-[32px] neon-card neon-card-strong p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
          <ShieldAlert className="h-9 w-9" />
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-rose-300">Error 403</p>
        <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
        <p className="neon-helper-text mt-4">{message}</p>
        <NavLink
          to={returnTo}
          className="neon-primary-button mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {returnLabel}
        </NavLink>
      </div>
    </div>
  );
}

export default Forbidden403;
