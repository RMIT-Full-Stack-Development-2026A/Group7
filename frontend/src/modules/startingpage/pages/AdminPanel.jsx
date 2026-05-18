import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Sparkles, Users, Gamepad2 } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { useAdminPanel } from '../../admin/useAdminPanel';
import PlayersTab from '../../admin/components/PlayersTab';
import RoomsTab from '../../admin/components/RoomsTab';

export function AdminPanel() {
  const navigate = useNavigate();
  const state = useAdminPanel();
  const { activeTab, setActiveTab } = state;

  return (
    <div className="full-bleed-page neon-page px-4 py-6 sm:px-6 lg:px-10">
      <div className="neon-shell w-full">
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm font-semibold text-sky-300 admin-panel-kicker">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white">Admin control center</h1>
            <p className="neon-helper-text mt-2">
              Manage player accounts, monitor live game rooms, and intervene when necessary.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:justify-end">
            <button
              onClick={() => navigate(ROUTES.MAIN_MENU)}
              className="neon-outline-button neon-back-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to menu
            </button>
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION)}
              className="neon-back-button inline-flex w-full items-center justify-center gap-2 bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 sm:w-auto"
            >
              <Sparkles className="w-4 h-4" /> Subscription page
            </button>
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-1 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'players' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" /> Players
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'rooms' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Gamepad2 className="h-4 w-4" /> Game rooms
          </button>
        </div>

        {activeTab === 'players' && <PlayersTab {...state} />}
        {activeTab === 'rooms' && <RoomsTab {...state} />}
      </div>
    </div>
  );
}

export default AdminPanel;
