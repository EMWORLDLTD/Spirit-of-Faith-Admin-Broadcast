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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-[#09090b] relative overflow-hidden transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-[#27272a] p-6 sm:p-8 text-slate-800 dark:text-zinc-100 relative z-10">
        {/* Logo & Identity */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] p-2 mb-2.5 flex items-center justify-center">
            <img
              src="/icon.png"
              alt="Christ Pavilion"
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-outfit font-bold text-xl text-slate-900 dark:text-zinc-100 tracking-tight">
            Christ Pavilion
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase mt-0.5">
            Admin Broadcast Portal
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PIN Indicator Dots */}
          <div className="flex flex-col items-center">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Enter Admin PIN
            </label>

            <div className="flex items-center gap-3.5 my-2">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      pinError
                        ? 'bg-rose-500 scale-110'
                        : isFilled
                        ? 'bg-blue-600 dark:bg-blue-500 scale-110'
                        : 'bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-[#27272a]'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                Invalid Security PIN.
              </p>
            )}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                id={`btn-pin-${digit}`}
                onClick={() => handleKeyPress(digit)}
                className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-[#27272a] text-base font-semibold text-slate-800 dark:text-zinc-100 transition-all active:scale-95"
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
              className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              id="btn-pin-0"
              onClick={() => handleKeyPress('0')}
              className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-[#27272a] text-base font-semibold text-slate-800 dark:text-zinc-100 transition-all active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              id="btn-pin-backspace"
              onClick={handleBackspace}
              className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center justify-center"
              aria-label="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Remember Me & Unlock */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-zinc-400">
              <input
                id="remember-me-toggle"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember session</span>
            </label>

            <button
              type="submit"
              id="btn-submit-unlock"
              disabled={isSubmitting || pin.length < 4}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Portal</span>
            </button>
          </div>
        </form>

        {/* Worker Endpoint Dropdown */}
        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#27272a]">
          <button
            type="button"
            id="toggle-worker-config"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Configure Cloudflare Worker
            </span>
            {showConfig ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 space-y-2.5 text-xs animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Worker URL
                </label>
                <input
                  id="input-worker-url"
                  type="url"
                  placeholder="https://sof-worker.domain.workers.dev"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Admin Secret Key
                </label>
                <input
                  id="input-admin-key"
                  type="password"
                  placeholder="Bearer token or secret key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={(e) => setIsDemoMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800 text-blue-600"
                  />
                  <span>Standalone Mode</span>
                </label>

                <button
                  type="submit"
                  id="btn-save-worker-config"
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-[#27272a] text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
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
