import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Trash2, Clock } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

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
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Mailbox</h1>
            </div>
            <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">2 new</span>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mailbox-card cursor-pointer rounded-3xl p-6 transition-colors ${
                  message.unread ? 'mailbox-card-unread' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className={`font-bold ${message.unread ? 'mailbox-heading-unread' : 'mailbox-heading-read'}`}>{message.from}</h3>
                      {message.unread ? (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                          NEW
                        </span>
                      ) : null}
                    </div>
                    <h4 className={`mb-2 font-semibold ${message.unread ? 'mailbox-subject-unread' : 'mailbox-subject-read'}`}>
                      {message.subject}
                    </h4>
                    <p className="mailbox-preview mb-3 text-sm">{message.preview}</p>
                    <div className="mailbox-meta flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{message.time}</span>
                    </div>
                  </div>
                  <button className="mailbox-delete-btn rounded-xl p-2 transition-colors">
                    <Trash2 className="mailbox-delete-icon h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="mx-auto mb-4 h-16 w-16 text-slate-600" />
              <p className="mailbox-preview">No messages yet</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
