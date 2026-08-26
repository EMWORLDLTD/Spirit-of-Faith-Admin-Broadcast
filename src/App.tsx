import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { PollerDashboard } from './components/PollerDashboard';
import { BroadcastComposer } from './components/BroadcastComposer';
import { LockScreenSimulator } from './components/LockScreenSimulator';
import { SafetyTestingModal } from './components/SafetyTestingModal';
import { BroadcastHistory } from './components/BroadcastHistory';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { BroadcastHistoryItem } from './types';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

const AdminPortalMain: React.FC = () => {
  const { auth, activeDraft, updateActiveDraft } = useAdmin();
  const [activeTab, setActiveTab] = useState<'composer' | 'history' | 'poller'>('composer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [safetyModal, setSafetyModal] = useState<{
    isOpen: boolean;
    type: 'test' | 'broadcastAll';
  }>({ isOpen: false, type: 'test' });

  // If not authenticated, present PIN login
  if (!auth.isAuthenticated) {
    return (
      <>
        <ToastContainer />
        <AuthScreen />
      </>
    );
  }

  const handleDuplicateToComposer = (item: BroadcastHistoryItem) => {
    updateActiveDraft({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      type: item.type,
      imageUrl: item.imageUrl,
      data: { ...item.payload.data },
    });
    setActiveTab('composer');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B132B] dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* PWA Mobile Install Banner */}
        <PwaInstallBanner />

        {/* Tab 1: Broadcast Composer & Live Lock-Screen Simulator */}
        {activeTab === 'composer' && (
          <div className="space-y-6">
            {/* Quick Poller Status Mini-Bar */}
            <PollerDashboard onComposeWithTeaching={() => setActiveTab('composer')} />

            {/* Side-by-side or stacked Composer + Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left/Main Column: Broadcast Composer */}
              <div className="lg:col-span-7 space-y-6">
                <BroadcastComposer
                  onOpenTestModal={() => setSafetyModal({ isOpen: true, type: 'test' })}
                  onOpenBroadcastModal={() =>
                    setSafetyModal({ isOpen: true, type: 'broadcastAll' })
                  }
                />
              </div>

              {/* Right Column: Live Lock-Screen Simulator */}
              <div className="lg:col-span-5 sticky top-20">
                <LockScreenSimulator draft={activeDraft} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Automation & 15-Min Poller Status */}
        {activeTab === 'poller' && (
          <div className="space-y-6">
            <PollerDashboard onComposeWithTeaching={() => setActiveTab('composer')} />
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541]/70 border border-slate-200 dark:border-slate-700/80 shadow-md dark:shadow-lg text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white">
                How Background Automation & Polling Works
              </h3>
              <p className="leading-relaxed">
                The Cloudflare Worker runs a Cron Trigger every 15 minutes to poll the church's RSS podcast feed and the Daily Devotional schedule. When a new audio sermon or devotional is detected, the poller verifies that a push notification has not yet been broadcast for that item ID, then compiles and dispatches a rich Expo Push Notification to all active tokens in the device registry.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">1. Audio Sermons</span>
                  <span>Scrapes RSS enclosures, resolves high-res cover art, and matches speaker metadata.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">2. Daily Devotionals</span>
                  <span>Extracts morning scripture readings and generates daily faith confession pushes.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">3. Expo Push Gateway</span>
                  <span>Batches payloads in chunks of 100 with exponential backoff and error logging.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Broadcast History Log */}
        {activeTab === 'history' && (
          <BroadcastHistory onDuplicateToComposer={handleDuplicateToComposer} />
        )}
      </main>

      {/* Modals */}
      {safetyModal.isOpen && (
        <SafetyTestingModal
          type={safetyModal.type}
          onClose={() => setSafetyModal({ isOpen: false, type: 'test' })}
          draft={activeDraft}
        />
      )}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">Spirit of Faith Church</span>
            <span>•</span>
            <span>Admin Broadcast Portal v2.4</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by Cloudflare Workers & Expo Push Services</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AdminPortalMain />
    </AdminProvider>
  );
}
