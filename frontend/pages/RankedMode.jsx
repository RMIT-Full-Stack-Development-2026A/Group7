import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function RankedMode() {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);

  const playerStats = {
    currentElo: 1847,
    rank: 'Gold III',
    winsNeeded: 3,
    nextRank: 'Gold II',
  };

  const handleFindRanked = () => {
    setSearching(true);
    // Simulate matchmaking
    setTimeout(() => {
      setSearching(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-purple-500/20 rounded-2xl mb-6">
              <Trophy className="w-16 h-16 text-purple-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3">Ranked Mode</h1>
            <p className="text-slate-400">Compete with opponents at your skill level</p>
          </div>

          {/* Current Rank Display */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-yellow-400" />
                <div>
                  <p className="text-sm text-slate-400">Current Rank</p>
                  <h3 className="text-2xl font-bold text-white">{playerStats.rank}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">ELO Rating</p>
                <h3 className="text-2xl font-bold text-white">{playerStats.currentElo}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-500/20">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Progress to {playerStats.nextRank}</span>
                <span className="text-yellow-400 font-semibold">{playerStats.winsNeeded} wins needed</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          {/* Matchmaking Area */}
          <div className="bg-slate-700/50 rounded-xl p-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="text-slate-300">Ranked players online: <span className="text-white font-semibold">432</span></span>
            </div>
            
            {searching ? (
              <div className="py-8">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-semibold text-lg mb-2">Finding ranked opponent...</p>
                <p className="text-slate-400 text-sm">Matching with similar ELO players</p>
              </div>
            ) : (
              <button
                onClick={handleFindRanked} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95" style={{ borderRadius: '30px' }}
              >
                Start Ranked Match
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Win Rewards
              </h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">+</span>
                  <span>Gain ELO points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">+</span>
                  <span>Climb rank tiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">+</span>
                  <span>Unlock achievements</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Rank Tiers
              </h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Bronze • Silver • Gold</li>
                <li>Platinum • Diamond</li>
                <li>Master • Grandmaster</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
