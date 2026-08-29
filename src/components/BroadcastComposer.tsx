import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { NotificationType, PresetTemplate } from '../types';
import { PRESET_TEMPLATES } from '../data/mockData';
import {
  Volume2,
  BookOpen,
  Calendar,
  Bell,
  Sparkles,
  Send,
  Smartphone,
  RotateCcw,
  Image as ImageIcon,
  Link,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface BroadcastComposerProps {
  onOpenTestModal: () => void;
  onOpenBroadcastModal: () => void;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({
  onOpenTestModal,
  onOpenBroadcastModal,
}) => {
  const {
    activeDraft,
    updateActiveDraft,
    loadPreset,
    resetDraft,
    pollerStatus,
  } = useAdmin();

  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  const typeOptions: {
    type: NotificationType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'audio',
      label: 'Audio Teaching',
      description: 'Sunday sermons & audio series',
      icon: <Volume2 className="w-4 h-4 text-blue-400" />,
    },
    {
      type: 'devotional',
      label: 'Daily Devotional',
      description: 'Daily scripture & readings',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
    },
    {
      type: 'event',
      label: 'Church Event',
      description: 'Conferences & services',
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
    },
    {
      type: 'announcement',
      label: 'General Notice',
      description: 'Ministry updates & notices',
      icon: <Bell className="w-4 h-4 text-purple-400" />,
    },
  ];

  const handleTypeChange = (newType: NotificationType) => {
    let newImageUrl = activeDraft.imageUrl;
    if (newType === 'devotional') {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      newImageUrl = `https://res.cloudinary.com/ggfhaver/image/upload/c_fill,w_1080,h_1080,q_auto:best,f_auto/devotionals/${yyyy}_${mm}_${dd}.jpg`;
    }
    updateActiveDraft({
      type: newType,
      imageUrl: newImageUrl,
      data: {
        ...activeDraft.data,
        type: newType,
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Quick Presets */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets
          </span>
          <button
            type="button"
            id="btn-reset-draft"
            onClick={resetDraft}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_TEMPLATES.map((preset: PresetTemplate) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => loadPreset(preset)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-0.5">
                <span className="truncate">{preset.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272a]">
          <h2 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
            Broadcast Composer
          </h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 font-semibold">
            {pollerStatus.totalTokens.toLocaleString()} Devices Target
          </span>
        </div>

        {/* 1. Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map((opt) => {
              const isSelected = activeDraft.type === opt.type;
              return (
                <button
                  key={opt.type}
                  id={`type-selector-${opt.type}`}
                  type="button"
                  onClick={() => handleTypeChange(opt.type)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-900 dark:border-[#27272a] dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-[#27272a]">
                      {opt.icon}
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{opt.label}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Notification Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Notification Title
          </label>
          <input
            id="composer-input-title"
            type="text"
            placeholder="e.g. Sunday Teaching: Walking in Divine Grace"
            value={activeDraft.title}
            onChange={(e) => updateActiveDraft({ title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 3. Subtitle / Speaker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Subtitle / Speaker
          </label>
          <input
            id="composer-input-subtitle"
            type="text"
            placeholder="e.g. Pastor Michael Adesanya"
            value={activeDraft.subtitle || ''}
            onChange={(e) => updateActiveDraft({ subtitle: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 4. Message Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Message Body
          </label>
          <textarea
            id="composer-input-body"
            rows={3}
            placeholder="Enter notification message..."
            value={activeDraft.body}
            onChange={(e) => updateActiveDraft({ body: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* 5. Image URL Input (Direct Input Field Only) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            Image URL
          </label>
          <input
            id="composer-input-image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={activeDraft.imageUrl || ''}
            onChange={(e) => updateActiveDraft({ imageUrl: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* 6. Deep Link / Payload Options (Collapsible) */}
        <div>
          <button
            type="button"
            id="toggle-payload-details"
            onClick={() => setShowPayloadDetails(!showPayloadDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Advanced Deep Link Options
            </span>
            {showPayloadDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPayloadDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-2.5 text-xs">
              {activeDraft.type === 'audio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    id="input-payload-audio-id"
                    type="text"
                    placeholder="Audio Message ID"
                    value={activeDraft.data.audioId || ''}
                    onChange={(e) =>
                      updateActiveDraft({
                        data: { ...activeDraft.data, audioId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:border-blue-500"
                  />
                  <input
                    id="input-payload-audio-url"
                    type="url"
                    placeholder="Audio Streaming URL"
                    value={activeDraft.data.audioUrl || ''}
                    onChange={(e) =>
                      updateActiveDraft({
                        data: { ...activeDraft.data, audioUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:border-blue-500 font-mono"
                  />
                </div>
              )}

              {activeDraft.type === 'devotional' && (
                <input
                  id="input-payload-devotional-date"
                  type="date"
                  value={activeDraft.data.devotionalDate || ''}
                  onChange={(e) =>
                    updateActiveDraft({
                      data: {
                        ...activeDraft.data,
                        devotionalDate: e.target.value,
                      },
                    })
                  }
                  className="w-full sm:w-60 px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:border-blue-500"
                />
              )}

              {activeDraft.type === 'event' && (
                <input
                  id="input-payload-link-url"
                  type="url"
                  placeholder="Event Registration / Stream Link"
                  value={activeDraft.data.linkUrl || ''}
                  onChange={(e) =>
                    updateActiveDraft({
                      data: { ...activeDraft.data, linkUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:border-blue-500 font-mono"
                />
              )}
            </div>
          )}
        </div>

        {/* Delivery Destination Channels */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            Delivery Channels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] cursor-pointer hover:border-blue-300 dark:hover:border-zinc-600 transition-colors">
              <input
                type="checkbox"
                checked={activeDraft.saveToFeed !== false}
                onChange={(e) => updateActiveDraft({ saveToFeed: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                  Pin to App Announcements
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Displays on mobile Home screen panel
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] cursor-pointer hover:border-blue-300 dark:hover:border-zinc-600 transition-colors">
              <input
                type="checkbox"
                checked={activeDraft.sendPush !== false}
                onChange={(e) => updateActiveDraft({ sendPush: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-[#27272a] bg-white dark:bg-zinc-800"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                  Send Push Notification
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Alerts {pollerStatus.totalTokens.toLocaleString()} mobile devices
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Auto-Expiration / Removal Setting */}
        {activeDraft.saveToFeed !== false && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Auto-Removal / Expiration</span>
              </label>
              {activeDraft.expiresAt && (
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {new Date(activeDraft.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                  {new Date(activeDraft.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateActiveDraft({ expiresAt: undefined })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !activeDraft.expiresAt
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                Never (Evergreen)
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                  updateActiveDraft({ expiresAt: d.toISOString() });
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDraft.expiresAt &&
                  Math.abs(new Date(activeDraft.expiresAt).getTime() - (Date.now() + 24 * 60 * 60 * 1000)) < 60000
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                24 Hours
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                  updateActiveDraft({ expiresAt: d.toISOString() });
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDraft.expiresAt &&
                  Math.abs(new Date(activeDraft.expiresAt).getTime() - (Date.now() + 3 * 24 * 60 * 60 * 1000)) < 60000
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                3 Days
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  updateActiveDraft({ expiresAt: d.toISOString() });
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDraft.expiresAt &&
                  Math.abs(new Date(activeDraft.expiresAt).getTime() - (Date.now() + 7 * 24 * 60 * 60 * 1000)) < 60000
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                7 Days
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  updateActiveDraft({ expiresAt: d.toISOString() });
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDraft.expiresAt &&
                  Math.abs(new Date(activeDraft.expiresAt).getTime() - (Date.now() + 30 * 24 * 60 * 60 * 1000)) < 60000
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                30 Days
              </button>

              <input
                type="datetime-local"
                value={activeDraft.expiresAt ? activeDraft.expiresAt.substring(0, 16) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const iso = new Date(e.target.value).toISOString();
                    updateActiveDraft({ expiresAt: iso });
                  } else {
                    updateActiveDraft({ expiresAt: undefined });
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              When expired, this notice is automatically removed and pruned from all user mobile devices.
            </p>
          </div>
        )}

        {/* 7. Action Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            id="btn-open-test-modal"
            onClick={onOpenTestModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-[#27272a] text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Send Test to Device</span>
          </button>

          <button
            type="button"
            id="btn-open-broadcast-modal"
            onClick={onOpenBroadcastModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>
              {activeDraft.sendPush === false
                ? 'Publish to App Feed Only'
                : `Publish & Broadcast (${pollerStatus.totalTokens.toLocaleString()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
