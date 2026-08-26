import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Delete,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, auth, updateCredentials } = useAdmin();
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [workerUrl, setWorkerUrl] = useState(auth.workerUrl);
  const [adminKey, setAdminKey] = useState(auth.adminKey);
  const [isDemoMode, setIsDemoMode] = useState(auth.isDemoMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinError, setPinError] = useState(false);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(false);
      if (nextPin.length >= 4 && nextPin === auth.pin) {
        // Auto-login if matching 4-digit PIN
        setTimeout(() => {
          login(nextPin, rememberMe);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    setIsSubmitting(true);
    const success = login(pin, rememberMe);
    if (!success) {
      setPinError(true);
      setPin('');
    }
    setIsSubmitting(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentials(workerUrl, adminKey, isDemoMode);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-[#0B132B] relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 dark:bg-[#1C2541]/90 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-xl dark:shadow-2xl p-6 sm:p-8 text-slate-800 dark:text-slate-100 relative z-10">
        {/* Church Logo & Identity */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#0B132B] dark:to-[#1C2541] border border-blue-200 dark:border-blue-500/40 p-2 shadow-md dark:shadow-xl dark:shadow-blue-950/50 mb-3 flex items-center justify-center">
            <img
              src="/icon.svg"
              alt="Spirit of Faith"
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-outfit font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            Spirit of Faith
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase mt-0.5">
            Admin Broadcast Portal
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Secure Cloudflare & Expo Hub</span>
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Indicator Dots */}
          <div className="flex flex-col items-center">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Enter Administrator Security PIN
            </label>

            <div className="flex items-center gap-4 my-2">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      pinError
                        ? 'bg-rose-500 scale-110 animate-bounce'
                        : isFilled
                        ? 'bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/50 scale-125'
                        : 'bg-slate-200 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium animate-pulse">
                Invalid Security PIN. Please verify your credentials and try again.
              </p>
            )}
          </div>

          {/* Touch Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                id={`btn-pin-${digit}`}
                onClick={() => handleKeyPress(digit)}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:active:bg-blue-600 border border-slate-200 dark:border-slate-700/70 text-lg font-semibold text-slate-800 dark:text-white transition-all active:scale-95 shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              id="btn-pin-clear"
              onClick={() => {
                setPin('');
                setPinError(false);
              }}
              title="Clear PIN"
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700/70 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center active:scale-95"
            >
              Clear
            </button>
            <button
              type="button"
              id="btn-pin-0"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:active:bg-blue-600 border border-slate-200 dark:border-slate-700/70 text-lg font-semibold text-slate-800 dark:text-white transition-all active:scale-95 shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              id="btn-pin-backspace"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-rose-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:active:bg-rose-900/60 border border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center active:scale-95 shadow-xs"
              aria-label="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Remember Me & Unlock Button */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300">
              <input
                id="remember-me-toggle"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember session on this device</span>
            </label>

            <button
              type="submit"
              id="btn-submit-unlock"
              disabled={isSubmitting || pin.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>
          </div>
        </form>

        {/* Worker & Backend Endpoint Configuration Dropdown */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            id="toggle-worker-config"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Configure Cloudflare Worker Endpoint
            </span>
            {showConfig ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-4 space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Worker Base URL (VITE_WORKER_URL)
                </label>
                <input
                  id="input-worker-url"
                  type="url"
                  placeholder="https://sof-worker.yourdomain.workers.dev"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Admin Secret Key (VITE_ADMIN_KEY)
                </label>
                <input
                  id="input-admin-key"
                  type="password"
                  placeholder="Bearer token or secret key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={(e) => setIsDemoMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600"
                  />
                  <span>Local / Standalone Mode</span>
                </label>

                <button
                  type="submit"
                  id="btn-save-worker-config"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
