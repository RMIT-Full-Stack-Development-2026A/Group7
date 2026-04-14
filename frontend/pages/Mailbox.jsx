import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Trash2, Clock } from 'lucide-react';

export function Mailbox() {
  const navigate = useNavigate();

  const messages = [
    {
      id: 1,
      from: 'System',
      subject: 'Welcome to TicTacToang!',
      preview: 'Thanks for joining our game. Your journey to become a TicTacToang master starts here. Good luck and have fun playing!',
      time: '2 days ago',
      unread: true,
    },
    {
      id: 2,
      from: 'RandomAhhOpponent',
      subject: 'Friend Request',
      preview: 'Well played. Wanna play again sometime?',
      time: '5 hours ago',
      unread: true,
    },
    {
      id: 3,
      from: 'Tournament',
      subject: 'Weekly Tournament Starting',
      preview: 'The weekly tournament begins in 2 days. Sign up now to compete...',
      time: '1 hour ago',
      unread: false,
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Mailbox</h1>
            </div>
            <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              2 new
            </span>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-slate-700/50 rounded-xl p-6 hover:bg-slate-700 transition-colors cursor-pointer ${
                  message.unread ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-bold ${message.unread ? 'text-white' : 'text-slate-300'}`}>
                        {message.from}
                      </h3>
                      {message.unread && (
                        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <h4 className={`font-semibold mb-2 ${message.unread ? 'text-white' : 'text-slate-400'}`}>
                      {message.subject}
                    </h4>
                    <p className="text-slate-500 text-sm mb-3">{message.preview}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{message.time}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
