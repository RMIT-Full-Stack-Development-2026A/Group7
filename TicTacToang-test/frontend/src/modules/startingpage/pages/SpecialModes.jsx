import { NavLink } from 'react-router-dom';
import ROUTES from '../../../router/routes.config';

export function SpecialModes() {
  return (
    <div className="full-bleed-page neon-page px-4 py-12">
      <div className="neon-shell mx-auto max-w-3xl rounded-[32px] neon-card neon-card-strong p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
          <span className="text-2xl font-bold">S</span>
        </div>
        <h1 className="text-3xl font-black text-white">Special Modes</h1>
        <p className="neon-helper-text mt-3">
          This area is ready for limited-time rule sets, wild boards, and event playlists.
        </p>
        <NavLink
          to={ROUTES.MAIN_MENU}
          className="neon-primary-button mt-6 inline-flex items-center rounded-full px-5 py-3 text-sm font-bold transition"
        >
          Back to Main Menu
        </NavLink>
      </div>
    </div>
  );
}
