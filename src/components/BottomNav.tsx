import React from 'react';
import { Radio, Layers, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'composer' | 'feed' | 'devices' | 'poller' | 'history';
  setActiveTab: (tab: 'composer' | 'feed' | 'devices' | 'poller' | 'history') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-[#27272a] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl px-2 py-1.5 flex justify-around items-center pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <button
        id="mobile-tab-composer"
        onClick={() => setActiveTab('composer')}
        className={`flex-1 py-1 px-1 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
          activeTab === 'composer'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'composer'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-[10px] tracking-tight">Compose</span>
      </button>

      <button
        id="mobile-tab-feed"
        onClick={() => setActiveTab('feed')}
        className={`flex-1 py-1 px-1 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
          activeTab === 'feed'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'feed'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-[10px] tracking-tight">Notices</span>
      </button>

      <button
        id="mobile-tab-devices"
        onClick={() => setActiveTab('devices')}
        className={`flex-1 py-1 px-1 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
          activeTab === 'devices'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'devices'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-[10px] tracking-tight">Devices</span>
      </button>

      <button
        id="mobile-tab-poller"
        onClick={() => setActiveTab('poller')}
        className={`flex-1 py-1 px-1 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
          activeTab === 'poller'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'poller'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-[10px] tracking-tight">Poller</span>
      </button>

      <button
        id="mobile-tab-history"
        onClick={() => setActiveTab('history')}
        className={`flex-1 py-1 px-1 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
          activeTab === 'history'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 font-medium'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-[10px] tracking-tight">History</span>
      </button>
    </nav>
  );
};
