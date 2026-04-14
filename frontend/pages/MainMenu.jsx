import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Settings as SettingsIcon, Trophy, Users, BookOpen, Swords, Sparkles, ShieldCheck, User, Check, X, FlaskConical } from 'lucide-react';
import BackendStatus from '../components/BackendStatus';

export function MainMenu() {
  const navigate = useNavigate();
  const [sidebarTab, setSidebarTab] = useState('friends');

  // Mock player data
  const playerData = {
    name: 'TheOneWhoAsked',
    rank: 'Gold III ',
    elo: 1847, isAdmin: true,
    isPremium: true, profilePic: 'https://imgs.search.brave.com/C2nuScHmfw9UxSbEfgpPErzoYJJgY7fco8288B7CyZE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/Y29tZS10by10aGlu/ay1vZi1pdC1pLWhh/dmUtbm8taWRlYS1v/Zi13aG9zLXRoaXMt/bWFtYm8tdGhhdC12/MC1jZ2k2ZmUyeXV5/Z2YxLmpwZWc_d2lk/dGg9NTU4JmZvcm1h/dD1wanBnJmF1dG89/d2VicCZzPTk1NGU0/OTE2MGRjNTk3YjFh/NTg0MDliNTcxZWQ0/MjAzNTY0ZDQyNDA',
  };

  const mainButtons = [
    {
      title: 'Create Match',
      description: 'Custom game vs AI or Friend',
      icon: Users,
      path: '/create-match',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Casual Game',
      description: 'Play against random opponents',
      icon: Swords,
      path: '/casual-game',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Ranked Mode',
      description: 'Competitive matchmaking',
      icon: Trophy,
      path: '/ranked-mode',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'How to Play',
      description: 'Confused? Learn the basics!',
      icon: BookOpen,
      path: '/how-to-play',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Subscription',
      description: 'Unlock premium features',
      icon: Sparkles,
      path: '/subscription',
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Special Modes',
      description: 'Bored? Try go crazy with more fun variants',
      icon: FlaskConical,
      path: '/special-modes',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const friends = [
    { name: 'NeoNinja', status: 'Online', statusColor: 'bg-emerald-400', lastSeen: 'Playing now' },
    { name: 'PixelPirate', status: 'Away', statusColor: 'bg-amber-400', lastSeen: '10m ago' },
    { name: 'RogueRey', status: 'Online', statusColor: 'bg-emerald-400', lastSeen: 'Ready to play' },
  ];

  const recentMatch = {
    opponent: 'ClankrMaster',
    result: 'Victory',
    score: '3 - 1',
    date: 'Today, 11:24 AM',
  };

  const notifications = [
    {
      id: 1,
      title: 'Challenge Request',
      description: 'RandomAhhOpponent wants a rematch.',
      time: '5 minutes ago',
      badge: 'NEW',
    },
    {
      id: 2,
      title: 'Rank Milestone',
      description: 'You reached Gold III after your last win.',
      time: '1 hour ago',
    },
    {
      id: 3,
      title: 'Tournament Live',
      description: 'Weekly tournament starts in 2 days.',
      time: '2 hours ago',
    },
  ];

  const request = [
    {
      opponent: 'RandomAhhOpponent',
      time: '5 mins ago',
    },
    {
      opponent: 'AnotherRandomOpponent',
      time: '1 hour ago',
    },
    {
      opponent: 'YetAnotherOpponentCuzWhyNot',
      time: '2 hours ago',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {/* Player Info - Left */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-[40px] p-4 flex-1 min-w-0 text-left hover:bg-slate-700/60 transition-colors focus:outline-none overflow-hidden"
            style={{ borderRadius: '20px' }}
          >
            <img
              src={playerData.profilePic}
              alt="Profile"
              className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{playerData.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-slate-900 whitespace-nowrap">
                  <Trophy size={16} className="text-slate-900" />
                  {playerData.rank}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-sm text-slate-400">ELO: <span className="text-white font-semibold">{playerData.elo}</span></span>
              </div>
            </div>
          </button>

          {/* Settings and Mailbox - Right */}
          <div className="flex items-center gap-3">
            <BackendStatus />
            {playerData.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-3xl hover:bg-slate-700/50 transition-colors group"
                style={{ borderRadius: '10px' }}
              >
                <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            )}
            <button
              onClick={() => navigate('/subscription')}
              className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-3xl hover:bg-slate-700/50 transition-colors group"
              style={{ borderRadius: '10px' }}
            >
              <Sparkles className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <button
              onClick={() => navigate('/mailbox')}
              className="relative p-4 bg-slate-800/50 backdrop-blur-sm rounded-3xl hover:bg-slate-700/50 transition-colors group"
              style={{ borderRadius: '10px' }}
            >
              <Mail className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" style={{ borderRadius: '10px' }} />
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-3xl hover:bg-slate-700/50 transition-colors group"
              style={{ borderRadius: '10px' }}
            >
              <SettingsIcon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8">
        <div className="flex-1">
          {/* Game Title */}
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <h1 className="text-7xl font-black text-white mb-2 tracking-tight">
                TicTacToang
              </h1>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            </div>
            <p className="text-slate-400 text-lg mt-2">The classic game reimagined</p>
          </div>

          {/* Grid Display */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-3 gap-2 w-32 h-32 p-4 bg-slate-800/50 rounded-2xl backdrop-blur-sm">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-700/50 rounded-lg flex items-center justify-center"
                >
                  {i === 0 && <span className="text-3xl text-blue-400 font-bold">X</span>}
                  {i === 4 && <span className="text-3xl text-purple-400 font-bold">O</span>}
                  {i === 8 && <span className="text-3xl text-blue-400 font-bold">X</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainButtons.map((button) => {
              const Icon = button.icon;
              return (
                <button
                  key={button.path}
                  onClick={() => navigate(button.path)}
                  className={`group relative bg-gradient-to-br ${button.color} p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden`}
                  style={{ borderRadius: '40px' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:bg-white/30 transition-colors" style={{ borderRadius: '30px' }}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {button.title}
                      </h3>
                      <p className="text-sm text-white/80">{button.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-3xl transition-colors" style={{ borderRadius: '40px' }}></div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>Select a game mode to begin</p>
          </div>
        </div>

        <aside className="mt-10 lg:mt-0 w-full lg:w-110 shrink-0 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-4 border border-white/10">
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'friends', label: 'Friends' },
                { id: 'recent', label: 'Recent' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'requests', label: 'Requests' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSidebarTab(tab.id)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${sidebarTab === tab.id
                      ? 'bg-slate-900 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                      : 'text-slate-400 hover:bg-slate-900/60'
                    }`}
                  style={{ borderRadius: '10px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {sidebarTab === 'friends' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Friends</h2>
                <span className="text-slate-400 text-sm">{friends.length} online</span>
              </div>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.name} className="flex items-center justify-between gap-4 p-3 bg-slate-900/40 rounded-2xl">
                    <div>
                      <p className="font-semibold text-white">{friend.name}</p>
                      <p className="text-xs text-slate-400">{friend.lastSeen}</p>
                    </div>
                    <span className={`h-3.5 w-3.5 rounded-full ${friend.statusColor}`}></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'recent' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Match</h2>
                <span className="text-slate-400 text-sm">{recentMatch.date}</span>
              </div>
              <div className="rounded-3xl bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400 mb-2">Opponent</p>
                <p className="text-xl font-bold text-white mb-4">{recentMatch.opponent}</p>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
                    <p className="text-lg font-semibold text-emerald-400">{recentMatch.result}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</p>
                    <p className="text-lg font-semibold text-white">{recentMatch.score}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'alerts' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Alerts</h2>
                <span className="text-slate-400 text-sm">{notifications.length}</span>
              </div>
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-slate-900/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{note.title}</p>
                        <p className="text-sm text-slate-400">{note.description}</p>
                      </div>
                      {note.badge ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] bg-rose-500 text-white px-2 py-1 rounded-full">{note.badge}</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">{note.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'requests' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Friend Request</h2>
                <span className="text-slate-400 text-sm">{request.length}</span>
              </div>
              <div className="space-y-3">
                {request.map((req, index) => (
                  <div key={index} className="rounded-2xl bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{req.opponent}</p>
                        <p className="text-xs text-slate-400">{req.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
