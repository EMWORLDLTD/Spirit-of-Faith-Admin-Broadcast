import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { PollerDashboard } from './components/PollerDashboard';
import { BroadcastComposer } from './components/BroadcastComposer';
import { LockScreenSimulator } from './components/LockScreenSimulator';
import { SafetyTestingModal } from './components/SafetyTestingModal';
import { BroadcastHistory } from './components/BroadcastHistory';
import { DeviceManager } from './components/DeviceManager';
import { FeedManager } from './components/FeedManager';
import { BottomNav } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { BroadcastHistoryItem, AnnouncementItem } from './types';
import { ShieldCheck, Heart, Sparkles, Radio, Eye } from 'lucide-react';

const AdminPortalMain: React.FC = () => {
  const { auth, activeDraft, updateActiveDraft, pollerStatus, setSavedTestToken } = useAdmin();
  const [activeTab, setActiveTab] = useState<'composer' | 'feed' | 'history' | 'poller' | 'devices'>('composer');
  const [mobileComposerView, setMobileComposerView] = useState<'form' | 'preview'>('form');
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

  const handleDuplicateAnnouncementToComposer = (item: AnnouncementItem) => {
    updateActiveDraft({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      type: item.type,
      imageUrl: item.imageUrl,
      expiresAt: item.expiresAt,
      publishAt: item.publishAt,
      saveToFeed: item.pinToFeed !== false,
      displayType: item.displayType,
      popupStyle: item.popupStyle,
      actionText: item.actionText,
      actionRoute: item.actionRoute,
      isDismissible: item.isDismissible,
      showOnce: item.showOnce,
      data: { type: item.type, linkUrl: item.linkUrl },
    });
    setActiveTab('composer');
  };

  const handleComposeWithLatestTeaching = () => {
    const teaching = pollerStatus.lastDetectedTeaching;
    if (teaching) {
      updateActiveDraft({
        title: `New Message: ${teaching.title}`,
        subtitle: `${teaching.speaker || 'Senior Pastor'} • Sunday Service`,
        body: `Listen to the latest message "${teaching.title}". Tap to listen now on Spirit of Faith.`,
        type: 'audio',
        imageUrl: teaching.imageUrl || undefined,
        data: {
          type: 'audio',
          audioId: teaching.id,
          audioUrl: teaching.audioUrl,
        },
      });
    }
    setActiveTab('composer');
  };

  const handleSendTestToSpecificDevice = (token: string, label: string) => {
    setSavedTestToken(token);
    setSafetyModal({ isOpen: true, type: 'test' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3.5 pb-28 md:py-6">
        {/* PWA Mobile Install Banner */}
        <PwaInstallBanner />

        {/* Tab 1: Broadcast Composer & Live Lock-Screen Simulator */}
        {activeTab === 'composer' && (
          <div>
            {/* Mobile-Only Segmented Control: Form vs Preview */}
            <div className="flex lg:hidden items-center p-1 bg-slate-200/80 dark:bg-zinc-900 rounded-xl mb-3.5 border border-slate-300/60 dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setMobileComposerView('form')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileComposerView === 'form'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span>Notice Form</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileComposerView('preview')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileComposerView === 'preview'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Preview</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Broadcast Composer */}
              <div className={`lg:col-span-7 space-y-5 ${mobileComposerView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <BroadcastComposer
                  onOpenTestModal={() => setSafetyModal({ isOpen: true, type: 'test' })}
                  onOpenBroadcastModal={() =>
                    setSafetyModal({ isOpen: true, type: 'broadcastAll' })
                  }
                />
              </div>

              {/* Right Column: Live Lock-Screen Simulator */}
              <div className={`lg:col-span-5 lg:sticky lg:top-20 ${mobileComposerView === 'form' ? 'hidden lg:block' : 'block'}`}>
                <LockScreenSimulator draft={activeDraft} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: In-App Announcements & Notice Board Manager */}
        {activeTab === 'feed' && (
          <FeedManager onDuplicateToComposer={handleDuplicateAnnouncementToComposer} />
        )}

        {/* Tab 3: Registered Devices Manager */}
        {activeTab === 'devices' && (
          <DeviceManager onSendTestToDevice={handleSendTestToSpecificDevice} />
        )}

        {/* Tab 3: Automation & 15-Min Poller Status */}
        {activeTab === 'poller' && (
          <div className="space-y-5">
            <PollerDashboard onComposeWithTeaching={handleComposeWithLatestTeaching} />
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-xs space-y-3">
              <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                Automation Architecture
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a]">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-0.5">1. Audio Sermons</span>
                  <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Auto-scrapes messages & metadata every 15m.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a]">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">2. Daily Devotionals</span>
                  <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Checks morning readings & notifications.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">3. Push Gateway</span>
                  <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Dispatches push payloads via Expo Push.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Broadcast History Log */}
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

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-200 dark:border-[#27272a] bg-white/80 dark:bg-[#09090b]/80 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500">
          <span className="font-medium text-slate-700 dark:text-zinc-400">Spirit of Faith Admin</span>
          <span>Expo Push & Cloudflare Workers</span>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
