import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { BroadcastHistoryItem, NotificationType } from '../types';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [inspectPayloadItem, setInspectPayloadItem] = useState<BroadcastHistoryItem | null>(null);

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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541]/80 border border-slate-200 dark:border-slate-700/80 shadow-md dark:shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
          <div>
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">
              Broadcast History Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditable records of all push alerts and test dispatches sent through the portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-history"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
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
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-history-search"
              type="text"
              placeholder="Search title, content, speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'All Logs' },
              { key: 'audio', label: 'Audio' },
              { key: 'devotional', label: 'Devotional' },
              { key: 'event', label: 'Events' },
              { key: 'announcement', label: 'Notices' },
              { key: 'test', label: 'Test Pushes' },
            ].map((tab) => (
              <button
                key={tab.key}
                id={`filter-tab-${tab.key}`}
                onClick={() => setSelectedTypeFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTypeFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
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
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
          <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No broadcasts found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? 'Try modifying your search filter.'
              : 'Broadcast history logs will appear here when notifications are dispatched.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C2541]/70 border border-slate-200 dark:border-slate-700/70 hover:border-blue-300 dark:hover:border-slate-600 transition-all shadow-xs dark:shadow-md backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Category Thumbnail / Icon */}
                  <div className="shrink-0 relative">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
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
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    {item.isTest && (
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                        Test
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {formattedDate}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.type === 'audio'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20'
                            : item.type === 'devotional'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20'
                            : item.type === 'event'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20'
                            : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/20'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.isTest ? '1 Test Device' : `${item.recipientCount.toLocaleString()} Devices`}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">
                      {item.title}
                    </h4>

                    {item.subtitle && (
                      <p className="text-xs text-blue-600 dark:text-blue-300 font-medium truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700/60 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    id={`btn-payload-${item.id}`}
                    onClick={() => setInspectPayloadItem(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs transition-colors flex items-center gap-1.5"
                    title="View Raw JSON Payload"
                  >
                    <Code className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="hidden md:inline">Payload</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-resend-${item.id}`}
                    onClick={() => onDuplicateToComposer(item)}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                    title="Load back into Composer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend / Edit</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-delete-${item.id}`}
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw Payload Inspector Modal */}
      {inspectPayloadItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Broadcast Delivery Receipt</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {inspectPayloadItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectPayloadItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span>
                  Timestamp: <strong className="text-slate-900 dark:text-white">{inspectPayloadItem.timestamp}</strong>
                </span>
                <span>
                  Recipients:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {inspectPayloadItem.recipientCount.toLocaleString()}
                  </strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5 uppercase">
                  Raw JSON Payload (Sent to /api/admin/broadcast)
                </label>
                <pre className="p-3.5 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-400 dark:text-emerald-300 overflow-x-auto select-all max-h-60">
                  {JSON.stringify(inspectPayloadItem.payload, null, 2)}
                </pre>
              </div>

              {inspectPayloadItem.resultDetails && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-900 dark:text-blue-300">
                  <strong>Expo Delivery Breakdown:</strong>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {inspectPayloadItem.resultDetails.ticketSummary || 'All tickets confirmed by Expo Push service.'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectPayloadItem.payload, null, 2));
                  addToast({
                    type: 'success',
                    title: 'Copied to Clipboard',
                    description: 'JSON payload copied.',
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
              <button
                onClick={() => setInspectPayloadItem(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
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
