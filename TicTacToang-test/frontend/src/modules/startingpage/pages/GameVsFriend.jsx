import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

export function GameVsFriend() {
  const navigate = useNavigate();

  return (
    <div className="full-bleed-page neon-page px-4 py-8">
      <div className="neon-shell mx-auto w-full max-w-4xl">
        <button
          onClick={() => navigate(ROUTES.MAIN_MENU)}
          className="neon-outline-button neon-back-button mb-8 px-4 py-3 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Menu
        </button>

        <div className="neon-card neon-card-strong rounded-3xl p-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Play vs Friend</h1>
          <p className="neon-helper-text mb-8">Local multiplayer mode</p>

          <div className="neon-secondary-panel rounded-3xl p-12">
            <p className="neon-helper-text">Game board for two players coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
