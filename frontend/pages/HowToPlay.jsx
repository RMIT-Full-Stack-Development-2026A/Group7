import { useNavigate } from 'react-router';
import { ArrowLeft, Target, Users, Trophy } from 'lucide-react';

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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">How to Play</h1>
          
          <div className="space-y-6 mb-8">
            {rules.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-700/50 rounded-xl p-6 flex items-start gap-4"
                >
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{rule.title}</h3>
                    <p className="text-slate-400">{rule.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Example Game</h3>
            <div className="flex justify-center">
              <div className="grid grid-cols-5 gap-2 w-64 h-64 p-4 bg-slate-800/50 rounded-xl">
                {[
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
                ].map((cell, i) => (
                  <div
                    key={i}
                    className="bg-slate-700/50 rounded-lg flex items-center justify-center"
                  >
                    {cell.mark && (
                      <span className={`text-4xl font-bold ${cell.color}`}>
                        {cell.mark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-slate-400 text-center mt-4">Player X wins with a diagonal line!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
