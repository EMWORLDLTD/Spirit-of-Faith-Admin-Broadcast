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
  AlertTriangle,
  CheckCircle2,
  Layers,
  Eye,
  EyeOff,
  Radio,
  X,
  Loader2,
  ShieldAlert,
  Edit3,
  Image as ImageIcon,
} from 'lucide-react';

interface FeedManagerProps {
  onDuplicateToComposer: (item: AnnouncementItem) => void;
}

interface ConfirmModalState {
  isOpen: boolean;
  action: 'unpublish' | 'publish' | 'delete';
  item: AnnouncementItem | null;
  isProcessing: boolean;
}

interface EditModalState {
  isOpen: boolean;
  item: AnnouncementItem | null;
  form: Partial<AnnouncementItem>;
  isSaving: boolean;
}

export const FeedManager: React.FC<FeedManagerProps> = ({ onDuplicateToComposer }) => {
  const { addToast } = useAdmin();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'published' | 'unpublished'>('all');

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    action: 'unpublish',
    item: null,
    isProcessing: false,
  });

  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    item: null,
    form: {},
    isSaving: false,
  });

  const openEditModal = (item: AnnouncementItem) => {
    setEditModal({
      isOpen: true,
      item,
      form: {
        ...item,
        displayType: item.displayType || 'inline',
        popupStyle: item.popupStyle || 'card',
        actionText: item.actionText || '',
        actionRoute: item.actionRoute || '/events',
        isDismissible: item.isDismissible !== false,
        showOnce: item.showOnce !== false,
        pinToFeed: item.pinToFeed !== false,
        publishAt: item.publishAt || '',
      },
      isSaving: false,
    });
  };

  const closeEditModal = () => {
    if (editModal.isSaving) return;
    setEditModal({
      isOpen: false,
      item: null,
      form: {},
      isSaving: false,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.item) return;

    if (!editModal.form.title?.trim() || !editModal.form.body?.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Required Fields',
        description: 'Title and body are required.',
      });
      return;
    }

    setEditModal((prev) => ({ ...prev, isSaving: true }));

    try {
      const res = await apiService.updateAnnouncement(editModal.item.id, editModal.form);
      if (res.success && res.announcement) {
        addToast({
          type: 'success',
          title: 'Notice Updated',
          description: `Changes to "${res.announcement.title}" are now live on the app.`,
          duration: 3500,
        });
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editModal.item!.id ? res.announcement! : a))
        );
        closeEditModal();
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          description: res.message || 'Could not update announcement.',
          duration: 4000,
        });
        setEditModal((prev) => ({ ...prev, isSaving: false }));
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Network Error',
        description: err.message || 'Failed to update announcement.',
        duration: 4000,
      });
      setEditModal((prev) => ({ ...prev, isSaving: false }));
    }
  };

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

  const openConfirmModal = (action: 'unpublish' | 'publish' | 'delete', item: AnnouncementItem) => {
    setConfirmModal({
      isOpen: true,
      action,
      item,
      isProcessing: false,
    });
  };

  const closeConfirmModal = () => {
    if (confirmModal.isProcessing) return;
    setConfirmModal({
      isOpen: false,
      action: 'unpublish',
      item: null,
      isProcessing: false,
    });
  };

  const handleExecuteModalAction = async () => {
    if (!confirmModal.item) return;
    const { action, item } = confirmModal;

    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'delete') {
        const res = await apiService.deleteAnnouncement(item.id);
        if (res.success) {
          addToast({
            type: 'success',
            title: 'Notice Deleted',
            description: `"${item.title}" was permanently deleted.`,
            duration: 3500,
          });
          setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
          closeConfirmModal();
        } else {
          addToast({
            type: 'error',
            title: 'Delete Failed',
            description: res.message || 'Could not delete announcement.',
            duration: 4000,
          });
          setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
        }
      } else {
        const newStatus: 'published' | 'unpublished' = action === 'publish' ? 'published' : 'unpublished';
        const res = await apiService.toggleAnnouncementStatus(item.id, newStatus);
        if (res.success) {
          addToast({
            type: 'success',
            title: action === 'publish' ? 'Notice Published' : 'Notice Unpublished',
            description:
              action === 'publish'
                ? `"${item.title}" is now live on all congregation mobile apps.`
                : `"${item.title}" is now hidden from congregation mobile apps.`,
            duration: 3500,
          });
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
          );
          closeConfirmModal();
        } else {
          addToast({
            type: 'error',
            title: 'Status Update Failed',
            description: res.message || 'Could not update status.',
            duration: 4000,
          });
          setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
        }
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: err.message || 'Network error occurred.',
        duration: 4000,
      });
      setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
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

  const publishedCount = announcements.filter((a) => (a.status || 'published') === 'published').length;
  const unpublishedCount = announcements.filter((a) => a.status === 'unpublished').length;

  const filteredAnnouncements = announcements
    .filter((item) => {
      const itemStatus = item.status || 'published';
      if (statusTab === 'published') return itemStatus === 'published';
      if (statusTab === 'unpublished') return itemStatus === 'unpublished';
      return true;
    })
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats Summary Cards - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Total Notices</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {announcements.length}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border-l-4 border-l-emerald-500 border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Published (Live)</span>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border-l-4 border-l-amber-500 border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Unpublished</span>
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-amber-600 dark:text-amber-400">
            {unpublishedCount}
          </div>
        </div>
      </div>

      {/* Toolbar, Filter Tabs & Search */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              statusTab === 'all'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            All ({announcements.length})
          </button>
          <button
            onClick={() => setStatusTab('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              statusTab === 'published'
                ? 'bg-emerald-500 text-white'
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            Live Feed ({publishedCount})
          </button>
          <button
            onClick={() => setStatusTab('unpublished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              statusTab === 'unpublished'
                ? 'bg-amber-500 text-white'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300" />
            Unpublished ({unpublishedCount})
          </button>
        </div>

        {/* Search & Refresh Bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={fetchAnnouncements}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Announcements List - 2 Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full p-10 sm:p-12 text-center text-xs bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl">
            <Bell className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
              {searchQuery
                ? 'No matching announcements'
                : statusTab === 'unpublished'
                ? 'No Unpublished Announcements'
                : 'No Active In-App Announcements'}
            </h4>
            <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1 max-w-sm mx-auto">
              {statusTab === 'unpublished'
                ? 'Unpublished notices remain archived here so you can re-publish them anytime without losing your content.'
                : 'Announcements published with "Pin to App Announcements" appear here and on congregation member home screens.'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const isPublished = (item.status || 'published') === 'published';
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
                    {/* Live Status Badge */}
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live on App
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <EyeOff className="w-3 h-3" />
                        Unpublished / Hidden
                      </span>
                    )}

                    {/* Category Type */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a]">
                      {getTypeIcon(item.type)}
                      {item.type}
                    </span>

                    {/* In-App Launch Pop-up Badge */}
                    {item.displayType === 'popup_modal' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        {item.popupStyle === 'image_only' ? 'Flyer Pop-up' : 'Card Pop-up'}
                      </span>
                    )}

                    {/* Pop-up Only / Unpinned Badge */}
                    {item.displayType === 'popup_modal' && item.pinToFeed === false && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Pop-up Only (Hidden from Feed)
                      </span>
                    )}

                    {/* Scheduled Badge */}
                    {item.publishAt && new Date(item.publishAt).getTime() > Date.now() && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Clock className="w-3 h-3 text-blue-500" />
                        Scheduled: {new Date(item.publishAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}

                    {/* Action Route Destination */}
                    {item.displayType === 'popup_modal' && item.actionRoute && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-[#27272a]">
                        <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                        {item.actionRoute}
                      </span>
                    )}

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
                        Expires: {expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-[#27272a]">
                        <Sparkles className="w-3 h-3 text-amber-500" />
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
                    {/* Edit Notice In-Place */}
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit this notice directly"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicateToComposer(item)}
                      title="Load into Composer Draft"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    {/* Unpublish vs Publish Toggle Button */}
                    {isPublished ? (
                      <button
                        onClick={() => openConfirmModal('unpublish', item)}
                        title="Hide from user apps but keep in admin archive"
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openConfirmModal('publish', item)}
                        title="Publish live to user apps"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    {/* Delete Permanently Button */}
                    <button
                      onClick={() => openConfirmModal('delete', item)}
                      title="Permanently remove from database"
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= IN-APP CONFIRMATION MODAL ================= */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl p-5 text-slate-800 dark:text-zinc-100 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    confirmModal.action === 'unpublish'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                      : confirmModal.action === 'publish'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  {confirmModal.action === 'unpublish' && <EyeOff className="w-5 h-5" />}
                  {confirmModal.action === 'publish' && <Radio className="w-5 h-5" />}
                  {confirmModal.action === 'delete' && <Trash2 className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-zinc-100">
                    {confirmModal.action === 'unpublish' && 'Unpublish Announcement?'}
                    {confirmModal.action === 'publish' && 'Publish Announcement?'}
                    {confirmModal.action === 'delete' && 'Permanently Delete Announcement?'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {confirmModal.action === 'unpublish' && 'Hide notice from congregation app feed'}
                    {confirmModal.action === 'publish' && 'Display notice on congregation app feed'}
                    {confirmModal.action === 'delete' && 'Irreversible database purge'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeConfirmModal}
                disabled={confirmModal.isProcessing}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Preview Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">
                {confirmModal.item.title}
              </span>
              <p className="text-slate-600 dark:text-zinc-400 line-clamp-2 text-[11px]">
                {confirmModal.item.body}
              </p>
            </div>

            {/* Explanation Note */}
            <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {confirmModal.action === 'unpublish' && (
                <p>
                  This announcement will immediately disappear from all members' mobile apps. It will remain saved in your Admin archive, allowing you to re-publish it anytime.
                </p>
              )}
              {confirmModal.action === 'publish' && (
                <p>
                  This announcement will immediately become visible to all congregation members in their app's announcements feed.
                </p>
              )}
              {confirmModal.action === 'delete' && (
                <p className="text-rose-600 dark:text-rose-400 font-medium">
                  Warning: This action cannot be undone. It will permanently delete this notice from the database and remove it from all devices.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={confirmModal.isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteModalAction}
                disabled={confirmModal.isProcessing}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                  confirmModal.action === 'unpublish'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : confirmModal.action === 'publish'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {confirmModal.isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {confirmModal.action === 'unpublish' && <EyeOff className="w-3.5 h-3.5" />}
                    {confirmModal.action === 'publish' && <Radio className="w-3.5 h-3.5" />}
                    {confirmModal.action === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                    <span>
                      {confirmModal.action === 'unpublish' && 'Unpublish from App'}
                      {confirmModal.action === 'publish' && 'Publish to App Feed'}
                      {confirmModal.action === 'delete' && 'Delete Permanently'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT ANNOUNCEMENT MODAL ================= */}
      {editModal.isOpen && editModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl p-4 sm:p-5 text-slate-800 dark:text-zinc-100 my-auto shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272a]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 leading-none">
                    Edit Announcement
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Update live details, pop-up options, or status
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={editModal.isSaving}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editModal.form.title || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      form: { ...prev.form, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={editModal.form.subtitle || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      form: { ...prev.form, subtitle: e.target.value },
                    }))
                  }
                  placeholder="e.g. Starting this Friday at 6:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editModal.form.body || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      form: { ...prev.form, body: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Image URL with Remove Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    Image URL (Optional)
                  </label>
                  {editModal.form.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          form: { ...prev.form, imageUrl: '' },
                        }))
                      }
                      className="text-[11px] text-red-500 hover:text-red-600 font-semibold flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      Remove Image
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg (leave blank for text-only)"
                  value={editModal.form.imageUrl || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      form: { ...prev.form, imageUrl: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Delivery Channels in Edit Modal */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModal.form.pinToFeed !== false}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          pinToFeed: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                      Pin to App Announcements
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Displays in the in-app Announcements list on the Home screen
                    </span>
                  </div>
                </label>

                <div className="pt-2 border-t border-slate-200 dark:border-[#27272a]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editModal.form.displayType === 'popup_modal'}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          form: {
                            ...prev.form,
                            displayType: e.target.checked ? 'popup_modal' : 'inline',
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Show as Pop-up Modal on App Launch
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                        Appears on user phone screen immediately when opening the app
                      </span>
                    </div>
                  </label>
                </div>

                {editModal.form.displayType === 'popup_modal' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-[#27272a] space-y-2.5">
                    {/* Style selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                        Pop-up Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, popupStyle: 'card' },
                            }))
                          }
                          className={`p-2 rounded-lg text-left border transition-all ${
                            (editModal.form.popupStyle || 'card') === 'card'
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200'
                              : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="text-xs font-bold block">Standard Card</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">Card with text & buttons</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, popupStyle: 'image_only' },
                            }))
                          }
                          className={`p-2 rounded-lg text-left border transition-all ${
                            editModal.form.popupStyle === 'image_only'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                              : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="text-xs font-bold block">Image-Only Flyer</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">Full-bleed clickable poster</span>
                        </button>
                      </div>
                    </div>

                    {/* Action button & Route */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                          Action Button Label
                        </label>
                        <input
                          type="text"
                          value={editModal.form.actionText || ''}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, actionText: e.target.value },
                            }))
                          }
                          placeholder="e.g. View Event Details"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                          Destination Route
                        </label>
                        <select
                          value={editModal.form.actionRoute || '/events'}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, actionRoute: e.target.value },
                            }))
                          }
                          className="w-full px-2 py-1.5 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs"
                        >
                          <option value="/events">Church Events (/events)</option>
                          <option value="/teachings">Audio Sermons (/teachings)</option>
                          <option value="/devotionals">Daily Devotionals (/devotionals)</option>
                          <option value="/library">Library & Saved (/library)</option>
                          <option value="/locations">Church Locations (/locations)</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editModal.form.isDismissible !== false}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, isDismissible: e.target.checked },
                            }))
                          }
                          className="w-3.5 h-3.5 rounded text-blue-600"
                        />
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Allow Dismissal ("Later" button)
                        </span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editModal.form.showOnce !== false}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, showOnce: e.target.checked },
                            }))
                          }
                          className="w-3.5 h-3.5 rounded text-blue-600"
                        />
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Show Once Only
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Status, Schedule and Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Live Status
                  </label>
                  <select
                    value={editModal.form.status || 'published'}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          status: e.target.value as 'published' | 'unpublished',
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-lg text-xs font-semibold"
                  >
                    <option value="published">Published (Live on App)</option>
                    <option value="unpublished">Unpublished (Hidden / Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Schedule Go-Live
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editModal.form.publishAt
                        ? editModal.form.publishAt.substring(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          publishAt: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Expiration (Auto-Removal)
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editModal.form.expiresAt
                        ? editModal.form.expiresAt.substring(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          expiresAt: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#27272a] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editModal.isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editModal.isSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {editModal.isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

