import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { apiService } from '../services/api';
import {
  Settings,
  Globe,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Lock,
  Radio,
  Server,
  Zap,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { auth, updateCredentials, addToast } = useAdmin();

  const [workerUrl, setWorkerUrl] = useState(auth.workerUrl);
  const [adminKey, setAdminKey] = useState(auth.adminKey);
  const [newPin, setNewPin] = useState(auth.pin);
  const [showKey, setShowKey] = useState(false);

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    apiService.updateConfig({ workerUrl, adminKey });
    const result = await apiService.testConnection();

    setIsTesting(false);
    setTestResult({
      tested: true,
      connected: result.connected,
      latencyMs: result.latencyMs,
      message: result.message,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentials(workerUrl, adminKey, false, newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl overflow-hidden text-slate-800 dark:text-zinc-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-zinc-100">
                Settings
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Worker URL */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Cloudflare Worker URL
            </label>
            <input
              id="settings-worker-url"
              type="url"
              placeholder="https://sof-worker.domain.workers.dev"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Admin Secret Key */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Admin API Secret Key
            </label>
            <div className="relative">
              <input
                id="settings-admin-key"
                type={showKey ? 'text' : 'password'}
                placeholder="Bearer secret key token"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <button
              type="button"
              id="btn-test-connection"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-blue-600 dark:text-blue-300 border border-slate-200 dark:border-[#27272a] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing connection...' : 'Test Connection'}</span>
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.connected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-500/40 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-500/40 dark:text-rose-300'
                }`}
              >
                {testResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{testResult.message} ({testResult.latencyMs}ms)</span>
              </div>
            )}
          </div>

          {/* Security PIN */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#27272a]">
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Admin PIN
            </label>
            <input
              id="settings-new-pin"
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="7777"
              className="w-full sm:w-40 px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl font-mono text-slate-900 dark:text-zinc-100 tracking-widest focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-settings"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
