import React, { useState } from 'react';
import { BroadcastPayload } from '../types';
import {
  Smartphone,
  Eye,
  Maximize2,
  Minimize2,
  Volume2,
  BookOpen,
  Calendar,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface LockScreenSimulatorProps {
  draft: BroadcastPayload;
}

export const LockScreenSimulator: React.FC<LockScreenSimulatorProps> = ({ draft }) => {
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android'>('ios');
  const [isExpanded, setIsExpanded] = useState(true);
  const [simulatedTime, setSimulatedTime] = useState('9:41');

  // Real-time clock format
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes();
      hours = hours % 12 || 12;
      setSimulatedTime(`${hours}:${mins < 10 ? '0' : ''}${mins}`);
    };
    updateTime();
  }, []);

  const displayTitle = draft.title.trim() || 'New Notification Title';
  const displayBody = draft.body.trim() || 'Notification body content will appear here...';
  const displaySubtitle = draft.subtitle?.trim();
  const displayImage = draft.imageUrl;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-md dark:shadow-xl backdrop-blur-md">
      {/* Simulator Control Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Live Device Preview
          </span>
        </div>

        {/* Platform Toggle Tabs */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              id="preview-tab-ios"
              type="button"
              onClick={() => setDevicePlatform('ios')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                devicePlatform === 'ios'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>iOS 18</span>
            </button>
            <button
              id="preview-tab-android"
              type="button"
              onClick={() => setDevicePlatform('android')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                devicePlatform === 'android'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Android 16</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Media Banner' : 'Expand Media Banner'}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Realistic Device Screen Wrapper */}
      <div className="flex-1 flex items-center justify-center p-2">
        {devicePlatform === 'ios' ? (
          /* ================= iOS 18 LOCK SCREEN SIMULATOR ================= */
          <div className="w-full max-w-[340px] rounded-[44px] bg-[#0A0D14] border-[7px] border-slate-800 shadow-2xl overflow-hidden p-3 relative text-white font-sans select-none flex flex-col justify-between min-h-[480px] sm:min-h-[520px]">
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 z-30 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-medium text-slate-400">SOF</span>
              </div>
            </div>

            {/* Lock Screen Top Clock */}
            <div className="pt-8 text-center">
              <span className="text-[11px] font-semibold tracking-wide text-slate-300">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <h1 className="text-5xl font-light tracking-tight text-white/90 font-outfit mt-0.5">
                {simulatedTime}
              </h1>
            </div>

            {/* iOS Notification Banner Card */}
            <div className="my-auto pt-4 pb-2">
              <div className="relative rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 p-3.5 shadow-2xl transition-all">
                {/* Header line: App Icon + App Name + Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#0B132B] border border-blue-500/40 p-0.5 shadow flex items-center justify-center">
                      <img src="/icon.svg" alt="SOF" className="w-4 h-4 object-contain" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                      SPIRIT OF FAITH
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">NOW</span>
                </div>

                {/* Main Content Area */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug break-words">
                      {displayTitle}
                    </h4>
                    {displaySubtitle && (
                      <p className="text-[11px] font-medium text-blue-300 mt-0.5 leading-tight">
                        {displaySubtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-3 break-words">
                      {displayBody}
                    </p>
                  </div>

                  {/* Thumbnail / Right Icon if not expanded */}
                  {!isExpanded && displayImage && (
                    <div className="shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Rich Expanded Artwork Card (iOS Media Preview) */}
                {isExpanded && displayImage && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/9] relative group">
                    <img
                      src={displayImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                      <div className="flex items-center justify-between w-full text-[10px] text-white/90">
                        <span className="flex items-center gap-1">
                          {draft.type === 'audio' && <Volume2 className="w-3 h-3 text-blue-400" />}
                          {draft.type === 'devotional' && <BookOpen className="w-3 h-3 text-amber-400" />}
                          {draft.type === 'event' && <Calendar className="w-3 h-3 text-emerald-400" />}
                          {draft.type === 'announcement' && <Bell className="w-3 h-3 text-purple-400" />}
                          <span className="capitalize font-semibold">{draft.type} Feed</span>
                        </span>
                        <span className="text-blue-300 font-medium">Tap to open</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Button for iOS Expanded Notification */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                  <span className="flex items-center gap-1 hover:text-blue-300 cursor-pointer">
                    {draft.type === 'audio' ? '▶ Listen in App' : 'Open in App'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Lock Screen Bottom Bar: Flashlight & Camera */}
            <div className="pb-3 flex items-center justify-between px-4">
              <div className="w-9 h-9 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-slate-300 text-xs">
                🔦
              </div>
              <div className="w-24 h-1 bg-white/40 rounded-full" />
              <div className="w-9 h-9 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-slate-300 text-xs">
                📷
              </div>
            </div>
          </div>
        ) : (
          /* ================= ANDROID 16 MATERIAL 3 BANNER ================= */
          <div className="w-full max-w-[340px] rounded-[36px] bg-[#121318] border-[6px] border-slate-800 shadow-2xl overflow-hidden p-3.5 relative text-slate-100 font-sans select-none flex flex-col justify-between min-h-[480px] sm:min-h-[520px]">
            {/* Android Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 px-2 pt-1 pb-4">
              <span>{simulatedTime}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-slate-400 rounded-xs" />
                <span>5G</span>
                <span className="w-4 h-2 bg-emerald-400 rounded-sm" />
              </div>
            </div>

            {/* Android Material 3 Notification Shade Card */}
            <div className="my-auto">
              <div className="rounded-2xl bg-[#1E2029] border border-slate-700/60 p-3.5 shadow-lg">
                {/* Header: App Icon + App Name + Subtext + Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 p-0.5 flex items-center justify-center">
                      <img src="/icon.svg" alt="SOF" className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Spirit of Faith
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400 capitalize">{draft.type}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">now</span>
                </div>

                {/* Title & Body */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {displayTitle}
                    </h4>
                    {displaySubtitle && (
                      <p className="text-[11px] font-medium text-indigo-300 mt-0.5">
                        {displaySubtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-1 leading-normal line-clamp-3">
                      {displayBody}
                    </p>
                  </div>

                  {!isExpanded && displayImage && (
                    <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Android Big Picture Style Artwork */}
                {isExpanded && displayImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-700 aspect-[16/9] bg-slate-950">
                    <img
                      src={displayImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                )}

                {/* Material 3 Action Chips */}
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-medium border border-blue-500/30 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{draft.type === 'audio' ? 'Play Sermon' : 'Open App'}</span>
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium hover:text-slate-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            {/* Android Navigation Pill */}
            <div className="pb-2 flex justify-center">
              <div className="w-20 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Simulator Footer Diagnostics */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Rendering 100% vector simulated canvas</span>
        </span>
        <span className="font-mono text-slate-400 dark:text-slate-500">Expo Push v2.x</span>
      </div>
    </div>
  );
};
