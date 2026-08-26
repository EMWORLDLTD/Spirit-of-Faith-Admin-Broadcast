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
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  activeTab: 'composer' | 'history' | 'poller';
  setActiveTab: (tab: 'composer' | 'history' | 'poller') => void;
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
    theme,
    toggleTheme,
  } = useAdmin();

  const isConnected = Boolean(auth.workerUrl) && !auth.isDemoMode;

  return (
    <header
      id="admin-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B132B]/90 backdrop-blur-xl transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#1C2541] dark:to-[#0B132B] border border-blue-200 dark:border-blue-500/30 shadow-sm dark:shadow-md dark:shadow-blue-900/20 overflow-hidden">
              <img
                src="/icon.svg"
                alt="Spirit of Faith"
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Spirit of Faith
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                  Broadcast Portal
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
                        : 'bg-amber-500 dark:bg-amber-400'
                    }`}
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[200px] font-medium text-slate-700 dark:text-slate-300">
                    {isConnected ? 'Worker Live' : 'Local Mode'}
                  </span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="hidden xs:inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Smartphone className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  {pollerStatus.totalTokens.toLocaleString()} Devices
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              id="tab-btn-composer"
              onClick={() => setActiveTab('composer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'composer'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast Composer
            </button>
            <button
              id="tab-btn-poller"
              onClick={() => setActiveTab('poller')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'poller'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent'
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
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              History Log
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Trigger Sync */}
            <button
              id="btn-quick-poll"
              onClick={triggerPollNow}
              disabled={isPollingLoading}
              title="Force Immediate Poller Sync"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/70 dark:text-slate-200 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${
                  isPollingLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Sync Now</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Settings */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 transition-colors"
              title="Worker & API Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Lock Session */}
            <button
              id="btn-lock-session"
              onClick={lock}
              className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30 transition-colors"
              title="Lock Admin Portal"
              aria-label="Lock Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/60 px-2 py-1.5 justify-around">
        <button
          id="mobile-tab-composer"
          onClick={() => setActiveTab('composer')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'composer'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Broadcast
        </button>
        <button
          id="mobile-tab-poller"
          onClick={() => setActiveTab('poller')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'poller'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Poller
        </button>
        <button
          id="mobile-tab-history"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          History
        </button>
      </div>
    </header>
  );
};
