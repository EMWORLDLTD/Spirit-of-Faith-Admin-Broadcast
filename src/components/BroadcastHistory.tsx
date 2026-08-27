import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AnnouncementItem, BroadcastHistoryItem, NotificationType } from '../types';
import { apiService } from '../services/api';
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ExternalLink,
  Code,
  Calendar,
  Volume2,
  BookOpen,
  Bell,
  Smartphone,
  Download,
  X,
  Radio,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface BroadcastHistoryProps {
  onDuplicateToComposer: (item: BroadcastHistoryItem) => void;
}

export const BroadcastHistory: React.FC<BroadcastHistoryProps> = ({
  onDuplicateToComposer,
}) => {
  const {
    broadcastHistory,
    deleteHistoryItem,
    clearHistory,
    addToast,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'dispatches' | 'announcements'>('dispatches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [inspectPayloadItem, setInspectPayloadItem] = useState<BroadcastHistoryItem | null>(null);

  // Live in-app announcements state
  const [liveAnnouncements, setLiveAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  const fetchLiveAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    const res = await apiService.getAnnouncements();
    setIsLoadingAnnouncements(false);
    if (res.success) {
      setLiveAnnouncements(res.announcements);
    }
  };

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchLiveAnnouncements();
    }
  }, [activeTab]);

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await apiService.deleteAnnouncement(id);
    if (res.success) {
      setLiveAnnouncements((prev) => prev.filter((item) => item.id !== id));
      addToast({
        type: 'success',
        title: 'Announcement Removed',
        description: 'Removed from mobile app Home screen feed.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: res.message || 'Could not delete announcement from server.',
      });
    }
  };

  // Filter items
  const filteredHistory = broadcastHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedTypeFilter === 'all') return true;
    if (selectedTypeFilter === 'test') return item.isTest;
    return item.type === selectedTypeFilter && !item.isTest;
  });

  const filteredAnnouncements = liveAnnouncements.filter((item) => {
    const matches =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matches;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(broadcastHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sof-broadcast-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'History Exported',
      description: 'Broadcast log downloaded as JSON.',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Tab Switcher: Dispatches vs In-App Feed */}
      <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-[#27272a] max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dispatches'
              ? 'bg-white dark:bg-[#18181b] text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-200 dark:border-[#27272a]'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-500" />
          <span>Broadcast Dispatches</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'announcements'
              ? 'bg-white dark:bg-[#18181b] text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-200 dark:border-[#27272a]'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>App Announcements Feed</span>
        </button>
      </div>

      {activeTab === 'dispatches' ? (
        <>
          {/* Header & Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#27272a]">
              <h2 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Broadcast History
              </h2>

              <div className="flex items-center gap-2">
                <button
                  id="btn-export-history"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                {broadcastHistory.length > 0 && (
                  <button
                    id="btn-clear-history"
                    onClick={clearHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-history-search"
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'audio', label: 'Audio' },
                  { key: 'devotional', label: 'Devotional' },
                  { key: 'event', label: 'Events' },
                  { key: 'announcement', label: 'Notices' },
                  { key: 'test', label: 'Test' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    id={`filter-tab-${tab.key}`}
                    onClick={() => setSelectedTypeFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedTypeFilter === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-[#27272a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History Items List */}
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#18181b]">
              <Calendar className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
              <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">No broadcasts found</h3>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((item) => {
                const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    id={`history-item-${item.id}`}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Icon & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 relative">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/icon.svg';
                              }}
                            />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5 text-[11px]">
                          <span className="font-semibold text-slate-500 dark:text-zinc-400">
                            {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="font-bold uppercase text-[10px] text-blue-600 dark:text-blue-400">
                            {item.type}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {item.isTest ? '1 Test' : `${item.recipientCount.toLocaleString()} Recip.`}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </h4>
                        {item.body && (
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                            {item.body}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        id={`btn-payload-${item.id}`}
                        onClick={() => setInspectPayloadItem(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] text-[11px]"
                        title="Payload"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-resend-${item.id}`}
                        onClick={() => onDuplicateToComposer(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-delete-${item.id}`}
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ================= IN-APP ANNOUNCEMENTS FEED MANAGER ================= */
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Live App Announcements Feed
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Active cards visible to congregation members inside the mobile app's announcement panel.
              </p>
            </div>

            <button
              onClick={fetchLiveAnnouncements}
              disabled={isLoadingAnnouncements}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnnouncements ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {isLoadingAnnouncements ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#18181b]">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">Loading announcements feed...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#18181b]">
              <Layers className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
              <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                No active in-app announcements
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                When you publish with "Pin to App Announcements", it will appear here and on the mobile app home screen.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAnnouncements.map((item) => {
                const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icon.svg';
                            }}
                          />
                        ) : (
                          <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5 text-[11px]">
                          <span className="font-semibold text-slate-500 dark:text-zinc-400">
                            {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="font-bold uppercase text-[10px] text-purple-600 dark:text-purple-400">
                            {item.type}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                            Live on App
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {item.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Unpin / Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Raw Payload Inspector Modal */}
      {inspectPayloadItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#27272a]">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100">Delivery Receipt</h3>
              <button onClick={() => setInspectPayloadItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-3 bg-slate-900 dark:bg-zinc-950 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-56">
              {JSON.stringify(inspectPayloadItem.payload, null, 2)}
            </pre>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setInspectPayloadItem(null)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
