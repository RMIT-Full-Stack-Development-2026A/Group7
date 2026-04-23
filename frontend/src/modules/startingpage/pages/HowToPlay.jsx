import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Users, Trophy } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

export function HowToPlay() {
  const navigate = useNavigate();

  const rules = [
    {
      icon: Target,
      title: 'Objective',
      description: 'Be the first to get five of your marks in a row (horizontally, vertically, or diagonally).',
    },
    {
      icon: Users,
      title: 'Players',
      description: 'Two players take turns placing their marks (X or O) on a 5x5 grid.',
    },
    {
      icon: Trophy,
      title: 'Winning',
      description: 'The game is won when one player successfully places five marks in a straight line.',
    },
  ];

  const exampleCells = [
    { mark: 'X', color: 'text-blue-400' },
    { mark: 'O', color: 'text-purple-400' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: 'X', color: 'text-blue-400' },
    { mark: '', color: '' },
    { mark: 'O', color: 'text-purple-400' },
    { mark: 'O', color: 'text-purple-400' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: 'X', color: 'text-blue-400' },
    { mark: 'O', color: 'text-purple-400' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: 'O', color: 'text-purple-400' },
    { mark: '', color: '' },
    { mark: 'X', color: 'text-blue-400' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: '', color: '' },
    { mark: 'X', color: 'text-blue-400' },
  ];

  return (
    <div className="full-bleed-page neon-page px-4 py-8">
      <div className="neon-shell mx-auto w-full max-w-5xl">
        <button
          onClick={() => navigate(ROUTES.MAIN_MENU)}
          className="neon-outline-button neon-back-button mb-8 px-4 py-3 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Menu
        </button>

        <div className="neon-card neon-card-strong rounded-3xl p-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-white">How to Play</h1>

          <div className="mb-8 space-y-6">
            {rules.map((rule) => {
              const Icon = rule.icon;
              return (
                <div key={rule.title} className="neon-secondary-panel flex items-start gap-4 rounded-3xl p-6">
                  <div className="rounded-2xl bg-blue-500/20 p-3">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-white">{rule.title}</h3>
                    <p className="neon-helper-text">{rule.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="neon-secondary-panel rounded-3xl p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Example Game</h3>
            <div className="flex justify-center">
              <div className="how-to-play-grid grid h-64 w-64 grid-cols-5 gap-2 rounded-2xl p-4">
                {exampleCells.map((cell, index) => (
                  <div
                    key={index}
                    className="how-to-play-grid-cell flex items-center justify-center rounded-xl"
                  >
                    {cell.mark ? (
                      <span className={`text-4xl font-bold ${cell.color}`}>{cell.mark}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <p className="neon-helper-text mt-4 text-center">Player X wins with a diagonal line!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
