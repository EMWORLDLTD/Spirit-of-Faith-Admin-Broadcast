import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { apiService } from '../services/api';
import { RegisteredDevice } from '../types';
import {
  Smartphone,
  Copy,
  CheckCircle2,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Apple,
  Cpu,
  Trash2,
  AlertTriangle,
  BellOff,
  Flame,
} from 'lucide-react';

interface DeviceManagerProps {
  onSendTestToDevice: (token: string, label: string) => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({ onSendTestToDevice }) => {
  const { addToast } = useAdmin();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'revoked' | 'unsubscribed'>('all');

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getRegisteredDevices();
      if (res.success) {
        setDevices(res.devices);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (token: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove this inactive device (${name}) from your registry?`)) {
      return;
    }
    setDeletingToken(token);
    try {
      const res = await apiService.deleteDevice(token);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Device Removed',
          description: `${name} has been removed from your subscriber list.`,
          duration: 3000,
        });
        setDevices((prev) => prev.filter((d) => d.token !== token));
      } else {
        addToast({
          type: 'error',
          title: 'Cannot Delete Device',
          description: res.message || 'Could not delete device.',
          duration: 4000,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: err.message || 'Failed to remove device.',
        duration: 3500,
      });
    } finally {
      setDeletingToken(null);
    }
  };

  const handlePruneRevoked = async () => {
    const revokedCount = devices.filter((d) => d.status === 'revoked').length;
    if (revokedCount === 0) {
      addToast({
        type: 'info',
        title: 'No Dead Devices',
        description: 'There are no revoked devices to prune.',
        duration: 2500,
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to purge all ${revokedCount} revoked / dead device tokens?`)) {
      return;
    }

    setIsPruning(true);
    try {
      const res = await apiService.pruneRevokedDevices();
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Dead Devices Pruned',
          description: res.message || `Successfully removed ${revokedCount} dead devices.`,
          duration: 3500,
        });
        setDevices((prev) => prev.filter((d) => d.status !== 'revoked'));
      } else {
        addToast({
          type: 'error',
          title: 'Prune Failed',
          description: res.message || 'Failed to prune devices.',
          duration: 4000,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: err.message || 'Failed to prune dead devices.',
        duration: 4000,
      });
    } finally {
      setIsPruning(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    addToast({
      type: 'success',
      title: 'Token Copied',
      description: 'Expo Push Token copied to clipboard.',
      duration: 2500,
    });
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Counts by status
  const activeCount = devices.filter((d) => (d.status || 'active') === 'active').length;
  const revokedCount = devices.filter((d) => d.status === 'revoked').length;
  const unsubscribedCount = devices.filter((d) => d.status === 'unsubscribed').length;

  const filteredDevices = devices
    .filter((d) => {
      const currentStatus = d.status || 'active';
      if (activeTab === 'active') return currentStatus === 'active';
      if (activeTab === 'revoked') return currentStatus === 'revoked';
      if (activeTab === 'unsubscribed') return currentStatus === 'unsubscribed';
      return true;
    })
    .filter((d) => {
      const q = searchQuery.toLowerCase();
      return (
        (d.deviceModel && d.deviceModel.toLowerCase().includes(q)) ||
        (d.platform && d.platform.toLowerCase().includes(q)) ||
        (d.token && d.token.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Devices</span>
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {devices.length}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border-l-4 border-emerald-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Active</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border-l-4 border-rose-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Revoked / Dead</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
            {revokedCount}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border-l-4 border-amber-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Muted</span>
            <BellOff className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
            {unsubscribedCount}
          </div>
        </div>
      </div>

      {/* Tabs & Search & Prune Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            All ({devices.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('revoked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'revoked'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-300" />
            Revoked ({revokedCount})
          </button>
          <button
            onClick={() => setActiveTab('unsubscribed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'unsubscribed'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300" />
            Muted ({unsubscribedCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {revokedCount > 0 && (
            <button
              onClick={handlePruneRevoked}
              disabled={isPruning}
              title="Bulk delete all dead/uninstalled tokens"
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isPruning ? 'animate-spin' : ''}`} />
              Prune Dead ({revokedCount})
            </button>
          )}

          <button
            onClick={fetchDevices}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="rounded-2xl bg-white dark:bg-[#18181b] shadow-sm overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center text-xs">
            <Smartphone className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">
              {searchQuery ? 'No matching devices' : `No ${activeTab !== 'all' ? activeTab : ''} devices found`}
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a] font-medium">
                {filteredDevices.map((dev, idx) => {
                  const status = dev.status || 'active';
                  const isActive = status === 'active';
                  const isRevoked = status === 'revoked';
                  const isUnsubscribed = status === 'unsubscribed';

                  return (
                    <tr
                      key={dev.token || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-zinc-100 font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{dev.deviceModel || 'Mobile Device'}</span>
                          {isActive && (
                            <span title="Active & Protected" className="text-emerald-500">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td className="px-4 py-3">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                        {isRevoked && (
                          <span
                            title={dev.revokedReason || 'Device uninstalled or storage cleared'}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-help"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Revoked
                          </span>
                        )}
                        {isUnsubscribed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Muted
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {dev.platform || 'Android'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 text-[11px]">
                        {dev.registeredAt ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                              {new Date(dev.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(dev.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          'Recent'
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <code className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded max-w-[140px] truncate inline-block">
                          {dev.token}
                        </code>
                      </td>

                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleCopy(dev.token)}
                          title="Copy Push Token"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 inline-flex items-center"
                        >
                          {copiedToken === dev.token ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onSendTestToDevice(dev.token, dev.deviceModel || 'Device')}
                          title="Send Test Notification"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Test
                        </button>

                        {/* Protected vs Removable Trash button */}
                        {isActive ? (
                          <button
                            disabled
                            title="Active Subscriber: Protected against deletion"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600 inline-flex items-center cursor-not-allowed opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteDevice(dev.token, dev.deviceModel || 'Device')}
                            disabled={deletingToken === dev.token}
                            title="Remove Inactive Device"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 inline-flex items-center disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
