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
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {devices.length} Devices
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active push notification endpoints
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Android Phones</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {androidCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            FCM / Google Play push channels
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Apple iOS</span>
            <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {iosCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            APNs Apple push channels
          </p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device model or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchDevices}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Devices List / Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="p-12 text-center">
            <Smartphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No matching devices found' : 'No Devices Registered Yet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Devices will appear here automatically as soon as users or testers open the Spirit of Faith app and allow notifications.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Device / Phone Model</th>
                  <th className="px-5 py-3.5">Platform</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5">Expo Push Token</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredDevices.map((dev, idx) => (
                  <tr
                    key={dev.token || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold">{dev.deviceModel || 'Mobile Device'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          dev.platform === 'ios'
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        }`}
                      >
                        {dev.platform || 'Android'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {dev.registeredAt
                        ? new Date(dev.registeredAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </td>

                    <td className="px-5 py-3.5">
                      <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded max-w-[200px] truncate inline-block">
                        {dev.token}
                      </code>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleCopy(dev.token)}
                        title="Copy Push Token"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors inline-flex items-center"
                      >
                        {copiedToken === dev.token ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onSendTestToDevice(dev.token, dev.deviceModel || 'Device')}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send Test
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
