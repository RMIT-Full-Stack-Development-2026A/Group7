import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Globe, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import ROUTES from '../../../router/routes.config';

export function CasualGame() {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);

  const handleFindMatch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
    }, 3000);
  };

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
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-green-500/20 p-4">
            <Globe className="h-16 w-16 text-green-400" />
          </div>

          <h1 className="mb-3 text-4xl font-bold text-white">Casual Game</h1>
          <p className="neon-helper-text mb-8">Match with a random opponent for a friendly game</p>

          <div className="neon-secondary-panel mb-6 rounded-3xl p-8">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-blue-400" />
              <span className="neon-helper-text">
                Players online: <span className="font-semibold text-white">1,247</span>
              </span>
            </div>

            {searching ? (
              <div className="py-8">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
                <p className="mb-2 text-lg font-semibold text-white">Searching for opponent...</p>
                <p className="neon-helper-text text-sm">This may take a few moments</p>
              </div>
            ) : (
              <button
                onClick={handleFindMatch}
                className="casual-find-match-button w-full rounded-[9999px] bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Find Match
              </button>
            )}
          </div>

          <div className="neon-secondary-panel rounded-3xl p-6 text-left">
            <h3 className="mb-3 font-semibold text-white">Casual Mode Features:</h3>
            <ul className="space-y-2 text-sm neon-helper-text">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-green-400" />
                <span>No profile progression changes - play for fun</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-green-400" />
                <span>Quick matchmaking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-green-400" />
                <span>Practice against real players</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
