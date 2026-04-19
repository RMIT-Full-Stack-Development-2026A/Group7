import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ROUTES from '../../../router/routes.config';

export function CompetitiveMode() {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);

  const playerStats = {
    recentWins: 12,
    activeSessions: 4,
    dailyGoal: 3,
    progressLabel: 'Daily challenge progress',
  };

  const handleFindCompetitive = () => {
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

        <div className="neon-card neon-card-strong rounded-3xl p-8">
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-purple-500/20 p-4">
              <Trophy className="h-16 w-16 text-purple-400" />
            </div>

            <h1 className="mb-3 text-4xl font-bold text-white">Competitive Mode</h1>
            <p className="neon-helper-text">Face focused opponents in a more intense queue</p>
          </div>

          <div className="mb-6 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award className="h-12 w-12 text-yellow-400" />
                <div>
                  <p className="neon-helper-text text-sm">Recent wins</p>
                  <h3 className="text-2xl font-bold text-white">{playerStats.recentWins}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="neon-helper-text text-sm">Active sessions</p>
                <h3 className="text-2xl font-bold text-white">{playerStats.activeSessions}</h3>
              </div>
            </div>
            <div className="mt-4 border-t border-yellow-500/20 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="neon-helper-text">{playerStats.progressLabel}</span>
                <span className="font-semibold text-yellow-400">{playerStats.dailyGoal} matches remaining</span>
              </div>
              <div className="ranked-progress-track h-2 w-full rounded-full bg-slate-700/50">
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          <div className="neon-secondary-panel mb-6 rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <span className="neon-helper-text">
                Competitive players online: <span className="font-semibold text-white">432</span>
              </span>
            </div>

            {searching ? (
              <div className="py-8">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
                <p className="mb-2 text-lg font-semibold text-white">Finding competitive opponent...</p>
                <p className="neon-helper-text text-sm">Pairing you with players in the active queue</p>
              </div>
            ) : (
              <button
                onClick={handleFindCompetitive}
                className="w-full rounded-[30px] bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Start Competitive Match
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="neon-secondary-panel rounded-3xl p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <Trophy className="h-5 w-5 text-purple-400" />
                Queue Benefits
              </h3>
              <ul className="space-y-2 text-sm neon-helper-text">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">+</span>
                  <span>Faster access to active players</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">+</span>
                  <span>More focused match pacing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">+</span>
                  <span>Unlock achievements</span>
                </li>
              </ul>
            </div>

            <div className="neon-secondary-panel rounded-3xl p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <Award className="h-5 w-5 text-yellow-400" />
                Match Focus
              </h3>
              <ul className="space-y-2 text-sm neon-helper-text">
                <li>Consistent matchmaking windows</li>
                <li>Head-to-head competitive sessions</li>
                <li>Progress tracking through match history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
