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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-zinc-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === 'test'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30'
                  : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30'
              }`}
            >
              {type === 'test' ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-zinc-100">
                {type === 'test' ? 'Send Test Push' : 'Confirm Broadcast'}
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

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 pb-1 border-b border-slate-200 dark:border-[#27272a]">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
                Summary
              </span>
              <span className="capitalize px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-[10px]">
                {draft.type}
              </span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-zinc-100">{draft.title}</strong>
            </div>
            {draft.body && (
              <p className="text-slate-600 dark:text-zinc-400 truncate">{draft.body}</p>
            )}
          </div>

          {type === 'test' ? (
            /* ================= TEST PUSH FORM ================= */
            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Expo Push Token
                </label>
                <input
                  id="input-test-expo-token"
                  type="text"
                  placeholder="ExponentPushToken[...]"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Select Saved Device Tokens */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-600 dark:text-zinc-400 text-[11px]">
                    Saved Devices:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(!showAddDevice)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddDevice ? 'Cancel' : 'Save Current'}</span>
                  </button>
                </div>

                {showAddDevice && (
                  <div className="p-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-2">
                    <input
                      type="text"
                      placeholder="Device Label"
                      value={newDeviceLabel}
                      onChange={(e) => setNewDeviceLabel(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCurrentDevice}
                      disabled={!tokenInput.trim()}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Save Device
                    </button>
                  </div>
                )}

                {savedDevices.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {savedDevices.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setTokenInput(item.token)}
                        className={`w-full p-2 rounded-lg text-left text-xs border transition-all flex items-center justify-between cursor-pointer ${
                          tokenInput === item.token
                            ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:border-blue-500 dark:text-zinc-100'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-zinc-900 dark:border-[#27272a] dark:text-zinc-300'
                        }`}
                      >
                        <span className="font-medium truncate">{item.label}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDevice(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {sendSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Test push sent!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-send-test"
                  disabled={isSending || !tokenInput.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ================= BROADCAST ALL FORM ================= */
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                draft.sendPush === false
                  ? 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:border-purple-500/40 dark:text-purple-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold ${
                  draft.sendPush === false
                    ? 'text-purple-700 dark:text-purple-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {draft.sendPush === false
                      ? 'Publish to Mobile App Announcements Panel (Silent Mode)'
                      : `Send Push Broadcast to ${pollerStatus.totalTokens.toLocaleString()} Devices`}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {draft.sendPush === false
                    ? 'This will pin the announcement to the mobile app home screen feed without buzzing devices.'
                    : draft.saveToFeed !== false
                    ? `Will dispatch push notification to ${pollerStatus.totalTokens.toLocaleString()} devices AND pin to the in-app Announcements feed.`
                    : `Will dispatch push notification to ${pollerStatus.totalTokens.toLocaleString()} devices.`}
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] cursor-pointer">
                <input
                  id="checkbox-safety-confirm"
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={(e) => setConfirmedCheck(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                  Confirm payload is finalized and ready to publish.
                </span>
              </label>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {sendSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {draft.sendPush === false
                      ? 'Published to app announcements feed!'
                      : 'Broadcast sent successfully!'}
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-broadcast-all"
                  disabled={isSending || !confirmedCheck}
                  onClick={handleBroadcastAll}
                  className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 ${
                    draft.sendPush === false
                      ? 'bg-purple-600 hover:bg-purple-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {draft.sendPush === false
                          ? 'Publish to Feed'
                          : `Broadcast to ${pollerStatus.totalTokens.toLocaleString()} Devices`}
                      </span>
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
