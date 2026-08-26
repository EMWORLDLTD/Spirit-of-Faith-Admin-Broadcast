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

    // Temporarily update service config to test input values
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Worker & Security Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure Cloudflare Worker endpoints, Expo integration & security PIN.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto">
          {/* Worker URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Cloudflare Worker Base URL (VITE_WORKER_URL)
            </label>
            <input
              id="settings-worker-url"
              type="url"
              placeholder="https://sof-worker.yourdomain.workers.dev"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Base URL where <code className="text-blue-600 dark:text-blue-400 font-mono">/api/admin/broadcast</code> and <code className="text-blue-600 dark:text-blue-400 font-mono">/api/admin/status</code> are deployed.
            </p>
          </div>

          {/* Admin Secret Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Admin API Secret Key (VITE_ADMIN_KEY)
            </label>
            <div className="relative">
              <input
                id="settings-admin-key"
                type={showKey ? 'text' : 'password'}
                placeholder="Bearer secret key token"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="space-y-2">
            <button
              type="button"
              id="btn-test-connection"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging Cloudflare Worker...' : 'Test Connection Diagnostic'}</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  testResult.connected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-500/40 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-500/40 dark:text-rose-300'
                }`}
              >
                {testResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.latencyMs > 0 && (
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Roundtrip Latency: {testResult.latencyMs}ms
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Change Security PIN */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Change Admin Security PIN (4-6 digits)
            </label>
            <input
              id="settings-new-pin"
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="7777"
              className="w-full sm:w-48 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white tracking-widest focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-settings"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
