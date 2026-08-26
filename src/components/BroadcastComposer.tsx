import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { NotificationType, PresetTemplate } from '../types';
import { OFFICIAL_CHURCH_ASSETS, PRESET_TEMPLATES } from '../data/mockData';
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
  AlertTriangle,
  Flame,
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

  const [customImageMode, setCustomImageMode] = useState(false);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  // Notification Type Options
  const typeOptions: {
    type: NotificationType;
    label: string;
    description: string;
    icon: React.ReactNode;
    defaultImage: string;
    badgeColor: string;
  }[] = [
    {
      type: 'audio',
      label: 'Audio Teaching',
      description: 'Sunday sermons, midweek audio & series messages',
      icon: <Volume2 className="w-4 h-4 text-blue-400" />,
      defaultImage: OFFICIAL_CHURCH_ASSETS.sermonArtwork,
      badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    },
    {
      type: 'devotional',
      label: 'Daily Devotional',
      description: 'Morning Faith Walk, daily scripture & prayer focus',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      defaultImage: OFFICIAL_CHURCH_ASSETS.devotionalArtwork,
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    {
      type: 'event',
      label: 'Church Event',
      description: 'Conferences, communion services & vigils',
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      defaultImage: OFFICIAL_CHURCH_ASSETS.eventArtwork,
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    {
      type: 'announcement',
      label: 'General Notice',
      description: 'Urgent prayer calls, ministry updates & bulletins',
      icon: <Bell className="w-4 h-4 text-purple-400" />,
      defaultImage: OFFICIAL_CHURCH_ASSETS.prayerArtwork,
      badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    },
  ];

  // Handler for type change with smart image resolver
  const handleTypeChange = (newType: NotificationType) => {
    const selectedOption = typeOptions.find((opt) => opt.type === newType);
    const resolvedImage = selectedOption?.defaultImage || activeDraft.imageUrl;

    updateActiveDraft({
      type: newType,
      imageUrl: customImageMode ? activeDraft.imageUrl : resolvedImage,
      data: {
        ...activeDraft.data,
        type: newType,
      },
    });
  };

  const titleLength = activeDraft.title.length;
  const isTitleLong = titleLength > 65;
  const bodyLength = activeDraft.body.length;
  const isBodyLong = bodyLength > 180;

  return (
    <div className="space-y-6">
      {/* Top Presets Quick-Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Quick Template Presets
          </span>
          <button
            type="button"
            id="btn-reset-draft"
            onClick={resetDraft}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_TEMPLATES.map((preset: PresetTemplate) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => loadPreset(preset)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                <span className="truncate">{preset.name}</span>
                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase font-medium">
                  {preset.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1C2541]/80 border border-slate-200 dark:border-slate-700/80 shadow-md dark:shadow-xl backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
          <div>
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">
              Smart Broadcast Composer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Draft, customize, and resolve rich media payloads for instant push dispatch.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-semibold hidden sm:inline-block">
            Target: {pollerStatus.totalTokens > 0 ? `${pollerStatus.totalTokens.toLocaleString()} Devices` : 'All Registered Devices'}
          </span>
        </div>

        {/* 1. Notification Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            1. Select Notification Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {typeOptions.map((opt) => {
              const isSelected = activeDraft.type === opt.type;
              return (
                <button
                  key={opt.type}
                  id={`type-selector-${opt.type}`}
                  type="button"
                  onClick={() => handleTypeChange(opt.type)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm text-blue-900 dark:bg-blue-600/20 dark:border-blue-500 dark:shadow-md dark:shadow-blue-500/15'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs dark:bg-slate-800/80 dark:border-transparent">
                      {opt.icon}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Notification Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Notification Title
            </label>
            <span
              className={`text-[11px] font-mono font-medium ${
                isTitleLong ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {titleLength} / 65 chars
            </span>
          </div>
          <input
            id="composer-input-title"
            type="text"
            placeholder="e.g. New Teaching: The Power of Persistent Prayer"
            value={activeDraft.title}
            onChange={(e) => updateActiveDraft({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {isTitleLong && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Titles over 65 characters may truncate on smaller phone lock-screens.</span>
            </p>
          )}
        </div>

        {/* 3. Subtitle / Topic Line */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              3. Subtitle / Speaker Line (Optional)
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Secondary Header</span>
          </div>
          <input
            id="composer-input-subtitle"
            type="text"
            placeholder="e.g. Sunday Service • Pastor Michael Adesanya"
            value={activeDraft.subtitle || ''}
            onChange={(e) => updateActiveDraft({ subtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 4. Message Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              4. Notification Body Message
            </label>
            <span
              className={`text-[11px] font-mono font-medium ${
                isBodyLong ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {bodyLength} / 180 chars
            </span>
          </div>
          <textarea
            id="composer-input-body"
            rows={3}
            placeholder="Enter the full push notification message..."
            value={activeDraft.body}
            onChange={(e) => updateActiveDraft({ body: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
          {isBodyLong && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Recommended push body is under 180 chars for clean single-fold display.</span>
            </p>
          )}
        </div>

        {/* 5. Smart Image Resolver */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Smart Image Resolver
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-toggle-custom-image"
                onClick={() => setCustomImageMode(!customImageMode)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  customImageMode
                    ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-600/30 dark:text-blue-300 dark:border-blue-500/50'
                    : 'bg-white text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {customImageMode ? '✓ Custom URL Mode' : 'Switch to Custom URL'}
              </button>
            </div>
          </div>

          {/* Quick preset artwork options */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Sermon Series', url: OFFICIAL_CHURCH_ASSETS.sermonArtwork },
              { label: 'Grace & Life', url: OFFICIAL_CHURCH_ASSETS.sermonGrace },
              { label: 'Devotional', url: OFFICIAL_CHURCH_ASSETS.devotionalArtwork },
              { label: 'Church Event', url: OFFICIAL_CHURCH_ASSETS.eventArtwork },
              { label: 'Prayer Alert', url: OFFICIAL_CHURCH_ASSETS.prayerArtwork },
              { label: 'Church Emblem', url: OFFICIAL_CHURCH_ASSETS.logo },
            ].map((art) => {
              const isSelected = activeDraft.imageUrl === art.url;
              return (
                <button
                  key={art.label}
                  type="button"
                  onClick={() => updateActiveDraft({ imageUrl: art.url })}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="h-10 w-full rounded overflow-hidden mb-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <img
                      src={art.url}
                      alt={art.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium block truncate">
                    {art.label}
                  </span>
                </button>
              );
            })}
          </div>

          {customImageMode && (
            <div className="pt-2 animate-in fade-in duration-200">
              <input
                id="composer-input-image-url"
                type="url"
                placeholder="https://images.unsplash.com/... or https://cdn.spiritoffaith.org/..."
                value={activeDraft.imageUrl || ''}
                onChange={(e) => updateActiveDraft({ imageUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* 6. Deep Link & Mobile Payload Options (Collapsible) */}
        <div className="pt-1">
          <button
            type="button"
            id="toggle-payload-details"
            onClick={() => setShowPayloadDetails(!showPayloadDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Advanced Deep Linking & App Payload
            </span>
            {showPayloadDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showPayloadDetails && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
              {activeDraft.type === 'audio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Audio ID in Mobile Database
                    </label>
                    <input
                      id="input-payload-audio-id"
                      type="text"
                      placeholder="e.g. sermon-2026-08-23"
                      value={activeDraft.data.audioId || ''}
                      onChange={(e) =>
                        updateActiveDraft({
                          data: { ...activeDraft.data, audioId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Direct Audio Streaming URL
                    </label>
                    <input
                      id="input-payload-audio-url"
                      type="url"
                      placeholder="https://cdn.spiritoffaith.org/audio/..."
                      value={activeDraft.data.audioUrl || ''}
                      onChange={(e) =>
                        updateActiveDraft({
                          data: { ...activeDraft.data, audioUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {activeDraft.type === 'devotional' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Devotional Date (YYYY-MM-DD)
                  </label>
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
                    className="w-full sm:w-60 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
              )}

              {activeDraft.type === 'event' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Event Stream / Registration Link
                  </label>
                  <input
                    id="input-payload-link-url"
                    type="url"
                    placeholder="https://spiritoffaith.org/live"
                    value={activeDraft.data.linkUrl || ''}
                    onChange={(e) =>
                      updateActiveDraft({
                        data: { ...activeDraft.data, linkUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Push Priority Header
                </label>
                <select
                  value={activeDraft.data.priority || 'high'}
                  onChange={(e) =>
                    updateActiveDraft({
                      data: {
                        ...activeDraft.data,
                        priority: e.target.value as 'default' | 'high',
                      },
                    })
                  }
                  className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:border-blue-500"
                >
                  <option value="high">High (Immediate wake-up & sound)</option>
                  <option value="default">Default</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 7. Action Footer: Send Test vs Broadcast All */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            id="btn-open-test-modal"
            onClick={onOpenTestModal}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Send Test to My Phone</span>
          </button>

          <button
            type="button"
            id="btn-open-broadcast-modal"
            onClick={onOpenBroadcastModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast to All Users ({pollerStatus.totalTokens.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
