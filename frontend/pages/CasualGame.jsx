import { useNavigate } from 'react-router';
import { ArrowLeft, Users, Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function CasualGame() {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);

  const handleFindMatch = () => {
    setSearching(true);
    // Simulate matchmaking, not a thing just yet
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

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-2xl mb-6">
            <Globe className="w-16 h-16 text-green-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">Casual Game</h1>
          <p className="text-slate-400 mb-8">Match with a random opponent for a friendly game</p>
          
          <div className="bg-slate-700/50 rounded-xl p-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-slate-300">Players online: <span className="text-white font-semibold">1,247</span></span>
            </div>
            
            {searching ? (
              <div className="py-8">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-semibold text-lg mb-2">Searching for opponent...</p>
                <p className="text-slate-400 text-sm">This may take a few moments</p>
              </div>
            ) : (
              <button
                onClick={handleFindMatch}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95" style={{ borderRadius: '30px' }}
              >
                Find Match
              </button>
            )}
          </div>

          <div className="text-left bg-slate-700/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Casual Mode Features:</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>No rank changes - play for fun</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Quick matchmaking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Practice against real players</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
