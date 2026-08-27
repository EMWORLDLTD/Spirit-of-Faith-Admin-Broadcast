import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Lock,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  Smartphone,
  Radio,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  activeTab: 'composer' | 'feed' | 'devices' | 'poller' | 'history';
  setActiveTab: (tab: 'composer' | 'feed' | 'devices' | 'poller' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  activeTab,
  setActiveTab,
}) => {
  const {
    auth,
    lock,
    pollerStatus,
    isPollingLoading,
    triggerPollNow,
    refreshStatus,
    theme,
    toggleTheme,
  } = useAdmin();

  const isConnected = Boolean(auth.workerUrl) && !auth.isDemoMode;

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#27272a] bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] shadow-xs overflow-hidden p-1">
              <img
                src="/icon.png"
                alt="Christ Pavilion"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-zinc-100">
                  Christ Pavilion
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800">
                  Admin Portal
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
                        : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span className="truncate max-w-[100px] sm:max-w-[200px] font-medium text-slate-700 dark:text-zinc-300">
                    {isConnected ? 'Worker Live' : 'Local Mode'}
                  </span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                  <Smartphone className="w-3 h-3 text-blue-500" />
                  {pollerStatus.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-[#27272a]">
            <button
              id="tab-btn-composer"
              onClick={() => setActiveTab('composer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'composer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast Composer
            </button>
            <button
              id="tab-btn-feed"
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              In-App Notices
            </button>
            <button
              id="tab-btn-devices"
              onClick={() => setActiveTab('devices')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'devices'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Registered Devices
            </button>
            <button
              id="tab-btn-poller"
              onClick={() => setActiveTab('poller')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'poller'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Automation & Poller
            </button>
            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              History Log
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1">
            <button
              id="btn-quick-poll"
              onClick={async () => {
                await refreshStatus();
              }}
              title="Refresh Dashboard Metrics"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-[#27272a] dark:text-zinc-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              id="btn-lock-session"
              onClick={lock}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
              title="Lock Admin Portal"
              aria-label="Lock Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (App-Native Docked Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-[#27272a] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl px-2 py-1.5 flex justify-around items-center shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
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
      </div>
    </header>
  );
};
