import { NavLink } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import ROUTES from '../../../../router/routes.config';
import { SUSPENSION_MESSAGE } from '../../logic/mainMenu.utils.js';

const MAIN_BUTTONS = [
  { title: 'Create Room', description: 'Custom game vs AI or Friend', icon: Users, path: ROUTES.CREATE_MATCH },
  { title: 'Join Room', description: 'Join your friend and play now', icon: Users, path: ROUTES.JOIN_MATCH },
  { title: 'How to Play', description: 'Confused? Learn the basics!', icon: BookOpen, path: ROUTES.HOW_TO_PLAY },
];

export function MainMenuHero({ isSuspended, blockIfSuspended }) {
  return (
    <div className="flex-1">
      <div className="text-center mb-12">
        <div className="inline-block relative">
          <h1 className="neon-game-title text-7xl font-black mb-2 tracking-tight">TicTacToang</h1>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full opacity-20 blur-xl" />
        </div>
        <p className="text-slate-400 text-lg mt-2">The classic game reimagined</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="neon-board-preview neon-board-preview--hero">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="neon-board-preview-cell">
              {i === 0 && <span className="text-3xl text-blue-400 font-bold">X</span>}
              {i === 4 && <span className="text-3xl text-purple-400 font-bold">O</span>}
              {i === 8 && <span className="text-3xl text-blue-400 font-bold">X</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MAIN_BUTTONS.map((button) => {
          const Icon = button.icon;
          return (
            <NavLink
              key={button.path}
              to={isSuspended ? '#' : button.path}
              onClick={(event) => blockIfSuspended(event)}
              aria-disabled={isSuspended}
              className={`neon-main-button group transition-all duration-300 active:scale-95 ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isSuspended ? SUSPENSION_MESSAGE : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="neon-main-button-icon">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="neon-main-button-title text-xl font-bold mb-1">{button.title}</h3>
                  <p className="neon-main-button-copy text-sm">{button.description}</p>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className="text-center mt-12 text-slate-500 text-sm">
        <p>Select a game mode to begin</p>
      </div>
    </div>
  );
}

export default MainMenuHero;
