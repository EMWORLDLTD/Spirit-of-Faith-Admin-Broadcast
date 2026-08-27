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
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#27272a]">
      {/* Control Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#27272a] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
            Live Preview
          </span>
        </div>

        {/* Platform Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-[#27272a]">
            <button
              id="preview-tab-ios"
              type="button"
              onClick={() => setDevicePlatform('ios')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                devicePlatform === 'ios'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              iOS
            </button>
            <button
              id="preview-tab-android"
              type="button"
              onClick={() => setDevicePlatform('android')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                devicePlatform === 'android'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Android
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-[#27272a] text-xs transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Realistic Device Screen Wrapper */}
      <div className="flex-1 flex items-center justify-center p-1">
        {devicePlatform === 'ios' ? (
          /* ================= iOS LOCK SCREEN ================= */
          <div className="w-full max-w-[320px] rounded-[40px] bg-[#0A0D14] border-[6px] border-slate-800 overflow-hidden p-3 relative text-white font-sans select-none flex flex-col justify-between min-h-[460px]">
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 z-30">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-medium text-slate-400">SOF</span>
              </div>
            </div>

            {/* Lock Screen Clock */}
            <div className="pt-6 text-center">
              <span className="text-[10px] font-semibold tracking-wide text-slate-300">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <h1 className="text-4xl font-light tracking-tight text-white/90 font-outfit mt-0.5">
                {simulatedTime}
              </h1>
            </div>

            {/* iOS Notification Card */}
            <div className="my-auto pt-3 pb-2">
              <div className="relative rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-white p-0.5 flex items-center justify-center overflow-hidden">
                      <img src="/icon.png" alt="CP" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                      CHRIST PAVILION
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-400">now</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug break-words">
                      {displayTitle}
                    </h4>
                    {displaySubtitle && (
                      <p className="text-[10px] font-medium text-blue-300 mt-0.5 truncate">
                        {displaySubtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-3 break-words">
                      {displayBody}
                    </p>
                  </div>

                  {!isExpanded && displayImage && (
                    <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.png';
                        }}
                      />
                    </div>
                  )}
                </div>

                {isExpanded && displayImage && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/9] relative">
                    <img
                      src={displayImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.png';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pb-2 flex justify-center">
              <div className="w-20 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        ) : (
          /* ================= ANDROID LOCK SCREEN ================= */
          <div className="w-full max-w-[320px] rounded-[36px] bg-[#121318] border-[5px] border-slate-800 overflow-hidden p-3 relative text-slate-100 font-sans select-none flex flex-col justify-between min-h-[460px]">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 px-2 pt-0.5 pb-2">
              <span>{simulatedTime}</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span className="w-3.5 h-2 bg-emerald-400 rounded-xs" />
              </div>
            </div>

            <div className="my-auto">
              <div className="rounded-2xl bg-[#1E2029] border border-slate-700/60 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
                      <img src="/icon.png" alt="CP" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">
                      Christ Pavilion
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">now</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {displayTitle}
                    </h4>
                    {displaySubtitle && (
                      <p className="text-[10px] font-medium text-indigo-300 mt-0.5 truncate">
                        {displaySubtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-3">
                      {displayBody}
                    </p>
                  </div>

                  {!isExpanded && displayImage && (
                    <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.png';
                        }}
                      />
                    </div>
                  )}
                </div>

                {isExpanded && displayImage && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 aspect-[16/9] bg-slate-950">
                    <img
                      src={displayImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.png';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pb-1.5 flex justify-center">
              <div className="w-16 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
