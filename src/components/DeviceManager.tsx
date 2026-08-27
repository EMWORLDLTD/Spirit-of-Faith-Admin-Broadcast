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
  Clock,
  Radio,
} from 'lucide-react';

interface DeviceManagerProps {
  onSendTestToDevice: (token: string, label: string) => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({ onSendTestToDevice }) => {
  const { auth, addToast } = useAdmin();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

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

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (d.deviceModel && d.deviceModel.toLowerCase().includes(q)) ||
      (d.platform && d.platform.toLowerCase().includes(q)) ||
      (d.token && d.token.toLowerCase().includes(q))
    );
  });

  const iosCount = devices.filter((d) => d.platform === 'ios').length;
  const androidCount = devices.filter((d) => d.platform === 'android').length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total</span>
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {devices.length}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Android</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {androidCount}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">iOS</span>
            <Apple className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {iosCount}
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search device model or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchDevices}
          disabled={isLoading}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Devices Table */}
      <div className="rounded-2xl bg-white dark:bg-[#18181b] shadow-sm overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center text-xs">
            <Smartphone className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">
              {searchQuery ? 'No matching devices' : 'No Devices Registered'}
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a] font-medium">
                {filteredDevices.map((dev, idx) => (
                  <tr
                    key={dev.token || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-zinc-100 font-semibold">
                      {dev.deviceModel || 'Mobile Device'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {dev.platform || 'Android'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                      {dev.registeredAt ? new Date(dev.registeredAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded max-w-[160px] truncate inline-block">
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
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
