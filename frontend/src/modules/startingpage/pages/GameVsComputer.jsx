import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

export function GameVsComputer() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

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
          <h1 className="mb-4 text-4xl font-bold text-white">Play vs Computer</h1>
          <p className="neon-helper-text mb-8">Game will be implemented here</p>

          <div className="neon-secondary-panel mb-8 rounded-3xl p-6 text-left">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-5 w-5 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">AI Difficulty</h2>
                <p className="neon-helper-text text-sm">Choose how tough the computer opponent should be.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`mode-option-button rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    difficulty === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="capitalize">{level}</span>
                </button>
              ))}
            </div>
            <p className="neon-helper-text mt-4 text-sm">
              Selected: <span className="font-semibold capitalize text-white">{difficulty}</span>
            </p>
          </div>

          <div className="neon-secondary-panel rounded-3xl p-12">
            <p className="neon-helper-text">Game board and AI logic coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
