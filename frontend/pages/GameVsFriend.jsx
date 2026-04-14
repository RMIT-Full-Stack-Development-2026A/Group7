import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function GameVsFriend() {
  const navigate = useNavigate();

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
          <h1 className="text-4xl font-bold text-white mb-4">Play vs Friend</h1>
          <p className="text-slate-400 mb-8">Local multiplayer mode</p>
          
          <div className="bg-slate-700/50 rounded-xl p-12">
            <p className="text-slate-500">Game board for two players coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
