import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import GameSessionHistory from '../components/GameSessionHistory.jsx';

export function MatchHistory() {
  return (
    <div className="neon-page min-h-screen px-4 py-8">
      <div className="neon-shell mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <NavLink
            to={ROUTES.MAIN_MENU}
            className="neon-outline-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </NavLink>
        </div>

        <GameSessionHistory />
      </div>
    </div>
  );
}

export default MatchHistory;
