import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(isRunningStandalone));

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      setDismissed(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mb-4">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-950/70 dark:via-slate-900/90 dark:to-blue-950/70 border border-blue-200 dark:border-blue-500/30 shadow-md dark:shadow-lg flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              Install Spirit of Faith Portal PWA
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Add to your home screen for rapid full-screen admin broadcast access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosInstructions && (
        <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in shadow-md">
          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
            <span>Install on iOS Safari:</span>
            <button onClick={() => setShowIosInstructions(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-1.5">
              <span>1. Tap the Share button</span>
              <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
              <span>at the bottom of Safari.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>2. Scroll and select</span>
              <span className="font-semibold text-slate-900 dark:text-white">"Add to Home Screen"</span>
              <PlusSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />.
            </li>
            <li>3. Tap "Add" to launch as a standalone app!</li>
          </ol>
        </div>
      )}
    </div>
  );
};
