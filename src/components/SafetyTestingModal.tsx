import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { BroadcastPayload } from '../types';
import {
  AlertTriangle,
  Smartphone,
  Send,
  X,
  CheckCircle2,
  Users,
  ShieldAlert,
  Loader2,
  Radio,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react';

interface SafetyTestingModalProps {
  type: 'test' | 'broadcastAll';
  onClose: () => void;
  draft: BroadcastPayload;
}

export const SafetyTestingModal: React.FC<SafetyTestingModalProps> = ({
  type,
  onClose,
  draft,
}) => {
  const {
    auth,
    pollerStatus,
    sendBroadcast,
    savedTestToken,
    setSavedTestToken,
    addToast,
  } = useAdmin();

  const isConfigured = Boolean(auth.workerUrl?.trim() && auth.adminKey?.trim());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Test Push Modal State
  const [tokenInput, setTokenInput] = useState(savedTestToken);
  const [newDeviceLabel, setNewDeviceLabel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);

  // User-managed saved device tokens
  const [savedDevices, setSavedDevices] = useState<Array<{ id: string; label: string; token: string }>>(() => {
    const saved = localStorage.getItem('sof_admin_saved_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const handleSaveCurrentDevice = () => {
    if (!tokenInput.trim()) return;
    const label = newDeviceLabel.trim() || `Device ${savedDevices.length + 1}`;
    const updated = [...savedDevices, { id: `dev-${Date.now()}`, label, token: tokenInput.trim() }];
    setSavedDevices(updated);
    localStorage.setItem('sof_admin_saved_devices', JSON.stringify(updated));
    setNewDeviceLabel('');
    setShowAddDevice(false);
    addToast({
      type: 'success',
      title: 'Device Saved',
      description: `Saved "${label}" to your test devices.`,
    });
  };

  const handleDeleteDevice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDevices.filter((d) => d.id !== id);
    setSavedDevices(updated);
    localStorage.setItem('sof_admin_saved_devices', JSON.stringify(updated));
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      addToast({
        type: 'warning',
        title: 'Push Token Required',
        description: 'Please provide an Expo push token (ExponentPushToken[...])',
      });
      return;
    }

    setIsSending(true);
    setSavedTestToken(tokenInput.trim());

    const testPayload: BroadcastPayload = {
      ...draft,
      title: `[TEST] ${draft.title}`,
      isTest: true,
      testToken: tokenInput.trim(),
    };

    setErrorMessage(null);
    const res = await sendBroadcast(testPayload);
    setIsSending(false);
    if (res.success) {
      setSendSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setErrorMessage(res.error || res.message || 'Push transmission failed');
    }
  };

  const handleBroadcastAll = async () => {
    if (!confirmedCheck) return;
    setIsSending(true);
    setErrorMessage(null);

    const fullPayload: BroadcastPayload = {
      ...draft,
      isTest: false,
      testToken: null,
    };

    const res = await sendBroadcast(fullPayload);
    setIsSending(false);
    if (res.success) {
      setSendSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } else {
      setErrorMessage(res.error || res.message || 'Broadcast transmission failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                type === 'test'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30'
                  : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
              }`}
            >
              {type === 'test' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {type === 'test' ? 'Send Test Push to Device' : 'Confirm Congregation Broadcast'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'test'
                  ? 'Verify display & sound on a single physical device before blast'
                  : `You are about to notify ${pollerStatus.totalTokens.toLocaleString()} registered mobile devices`}
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Notification Summary
              </span>
              <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-transparent font-semibold">
                {draft.type}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Title: </span>
              <strong className="text-slate-900 dark:text-white">{draft.title}</strong>
            </div>
            {draft.subtitle && (
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subtitle: </span>
                <span className="text-blue-600 dark:text-blue-300 font-medium">{draft.subtitle}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Body: </span>
              <span className="text-slate-700 dark:text-slate-300">{draft.body}</span>
            </div>
          </div>

          {type === 'test' ? (
            /* ================= TEST PUSH FORM ================= */
            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Expo Push Token
                </label>
                <input
                  id="input-test-expo-token"
                  type="text"
                  placeholder="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Format must begin with <code className="text-blue-600 dark:text-blue-400 font-mono">ExponentPushToken[...]</code>
                </p>
              </div>

              {/* Quick Select Saved Device Tokens */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Saved Physical Test Devices:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(!showAddDevice)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddDevice ? 'Cancel' : 'Save Current Token'}</span>
                  </button>
                </div>

                {showAddDevice && (
                  <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Device Label (e.g. Media Desk iPad, Admin Phone)"
                      value={newDeviceLabel}
                      onChange={(e) => setNewDeviceLabel(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCurrentDevice}
                      disabled={!tokenInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Save Device
                    </button>
                  </div>
                )}

                {savedDevices.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {savedDevices.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setTokenInput(item.token)}
                        className={`w-full p-2 rounded-lg text-left text-xs border transition-all flex items-center justify-between cursor-pointer ${
                          tokenInput === item.token
                            ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-600/20 dark:border-blue-500 dark:text-white'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                            {item.token}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDevice(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Remove device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    No test devices saved yet. Enter an Expo push token above and save it for one-click testing.
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Transmission Failed: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Test push sent successfully to Expo Gateway!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-send-test"
                  disabled={isSending || !tokenInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Test...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Test Push</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ================= BROADCAST ALL FORM ================= */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Safety Broadcast Safeguard</span>
                </div>
                <p className="leading-relaxed">
                  This action will immediately transmit push notifications via Cloudflare & Expo to{' '}
                  <strong className="text-slate-900 dark:text-white underline">
                    {pollerStatus.totalTokens.toLocaleString()} registered congregation devices
                  </strong>
                  . Once sent, push notifications cannot be recalled or edited.
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <input
                  id="checkbox-safety-confirm"
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={(e) => setConfirmedCheck(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  I verify that the headline, copy, and media payload are finalized and authorized for
                  church-wide broadcast.
                </span>
              </label>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Broadcast Blocked / Failed: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {sendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Broadcast transmission in progress! Check History log.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-broadcast-all"
                  disabled={isSending || !confirmedCheck}
                  onClick={handleBroadcastAll}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Broadcasting to Congregation...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Broadcast to {pollerStatus.totalTokens.toLocaleString()} Devices</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
