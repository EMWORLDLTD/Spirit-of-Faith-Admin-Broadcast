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
      {/* Stats Summary Cards - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">In-App Notices</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {announcements.length}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border-l-4 border-l-emerald-500 border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Evergreen</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {evergreenCount}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border-l-4 border-l-blue-500 border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Scheduled</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400">
            {expiringCount}
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-2.5">
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

      {/* Announcements List - 2 Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full p-10 sm:p-12 text-center text-xs bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl">
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
                className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] flex flex-col justify-between gap-3.5"
              >
                {/* Top Section: Banner + Details */}
                <div className="space-y-3">
                  {/* Banner Image Thumbnail */}
                  {item.imageUrl && (
                    <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 shrink-0 border border-slate-200 dark:border-[#27272a]">
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

                  {/* Header Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a]">
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
                        Expires: {expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Sparkles className="w-3 h-3" />
                        Evergreen
                      </span>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug">
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
                        <span className="truncate max-w-[240px]">{item.linkUrl}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Section: Published Time & Actions */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-[#27272a] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateToComposer(item)}
                      title="Load into Composer Draft"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAnnouncement(item.id, item.title)}
                      disabled={deletingId === item.id}
                      title="Remove from all user phones"
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === item.id ? '...' : 'Unpublish'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
