import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Palette } from 'lucide-react';

export function GameVsComputer() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

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
          <h1 className="text-4xl font-bold text-white mb-4">Play vs Computer</h1>
          <p className="text-slate-400 mb-8">Game will be implemented here</p>
          
          <div className="bg-slate-700/50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">AI Difficulty</h2>
                <p className="text-sm text-slate-400">Choose how tough the computer opponent should be.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    difficulty === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="capitalize">{level}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">Selected: <span className="text-white font-semibold capitalize">{difficulty}</span></p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-12">
            <p className="text-slate-500">Game board and AI logic coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
