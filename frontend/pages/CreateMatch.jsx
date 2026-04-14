import { useNavigate } from 'react-router';
import { ArrowLeft, Bot, Users } from 'lucide-react';

export function CreateMatch() {
  const navigate = useNavigate();

  const matchTypes = [
    {
      title: 'Play vs Computer',
      description: 'Challenge the Clankers with different difficulty levels',
      icon: Bot,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/vs-computer'),
    },
    {
      title: 'Play vs Friend',
      description: 'Play your friend on the same device',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/vs-friend'),
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
          <h1 className="text-4xl font-bold text-white mb-3 text-center">Create Custom Match</h1>
          <p className="text-slate-400 text-center mb-8">Choose your opponent type</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchTypes.map((match) => {
              const Icon = match.icon;
              return (
                <button
                  key={match.title}
                  onClick={match.onClick}
                  className={`group bg-gradient-to-br ${match.color} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95`} style={{ borderRadius: '30px' }}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {match.title}
                      </h3>
                      <p className="text-white/80">{match.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
