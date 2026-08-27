import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { apiService } from '../services/api';
import { AnnouncementItem, NotificationType } from '../types';
import {
  Bell,
  RefreshCw,
  Search,
  Trash2,
  Clock,
  ExternalLink,
  Volume2,
  BookOpen,
  Calendar,
  Sparkles,
  Copy,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface FeedManagerProps {
  onDuplicateToComposer: (item: AnnouncementItem) => void;
}

export const FeedManager: React.FC<FeedManagerProps> = ({ onDuplicateToComposer }) => {
  const { addToast } = useAdmin();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to unpublish and remove "${title}" from all user devices?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await apiService.deleteAnnouncement(id);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Announcement Removed',
          description: `"${title}" was removed from the live in-app feed.`,
          duration: 3500,
        });
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Remove',
          description: res.message || 'Could not delete announcement.',
          duration: 4000,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: err.message || 'Network error occurred.',
        duration: 4000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-blue-500" />;
      case 'devotional':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
      case 'event':
        return <Calendar className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  const evergreenCount = announcements.filter((a) => !a.expiresAt).length;
  const expiringCount = announcements.filter((a) => Boolean(a.expiresAt)).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Live In-App Notices</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {announcements.length}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border-l-4 border-emerald-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Evergreen (No Expiry)</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {evergreenCount}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Scheduled Auto-Expiry</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
            {expiringCount}
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchAnnouncements}
          disabled={isLoading}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-xs bg-white dark:bg-[#18181b] rounded-2xl shadow-sm">
            <Bell className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
              {searchQuery ? 'No matching announcements' : 'No Active In-App Announcements'}
            </h4>
            <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1 max-w-sm mx-auto">
              Announcements published from the Broadcast Composer with "Pin to App Announcements" enabled will appear here and in members' apps.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const hasExpiry = Boolean(item.expiresAt);
            const expiryDate = item.expiresAt ? new Date(item.expiresAt) : null;
            const isExpiringSoon =
              expiryDate && expiryDate.getTime() - Date.now() < 48 * 60 * 60 * 1000;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border border-slate-100 dark:border-[#27272a] flex flex-col md:flex-row gap-4 items-start justify-between"
              >
                {/* Left: Thumbnail & Content */}
                <div className="flex flex-col sm:flex-row gap-3.5 items-start flex-1 w-full">
                  {/* Banner Image Thumbnail */}
                  {item.imageUrl && (
                    <div className="w-full sm:w-32 h-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 shrink-0 border border-slate-200 dark:border-[#27272a]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Text Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>

                      {/* Expiry Pill */}
                      {hasExpiry && expiryDate ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpiringSoon
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          Auto-Removes: {expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                          {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-3 h-3" />
                          Evergreen
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        {item.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {item.body}
                    </p>

                    {item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{item.linkUrl}</span>
                      </a>
                    )}

                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 pt-1">
                      Published: {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#27272a]">
                  <button
                    onClick={() => onDuplicateToComposer(item)}
                    title="Load into Composer Draft"
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>

                  <button
                    onClick={() => handleDeleteAnnouncement(item.id, item.title)}
                    disabled={deletingId === item.id}
                    title="Remove from all user phones"
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === item.id ? 'Removing...' : 'Unpublish'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
