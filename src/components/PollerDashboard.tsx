import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Activity,
  RefreshCw,
  Clock,
  Smartphone,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  Calendar,
  User,
  ExternalLink,
  Flame,
} from 'lucide-react';

export const PollerDashboard: React.FC<{
  onComposeWithTeaching?: () => void;
}> = ({ onComposeWithTeaching }) => {
  const { pollerStatus, isPollingLoading, triggerPollNow, auth } = useAdmin();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [timeAgo, setTimeAgo] = useState('Just now');
  const [nextPollSeconds, setNextPollSeconds] = useState(pollerStatus.nextScheduledPollSeconds || 660);

  useEffect(() => {
    const updateRelativeTime = () => {
      const last = new Date(pollerStatus.lastCheckTimestamp).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - last) / 1000));

      if (diffSec < 45) {
        setTimeAgo('Just now');
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins}m ago`);
      } else {
        const hours = Math.floor(diffSec / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);
    return () => clearInterval(interval);
  }, [pollerStatus.lastCheckTimestamp]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setNextPollSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isOperational = pollerStatus.status === 'operational';
  const isError = pollerStatus.status === 'error';
  const isConfigured = Boolean(auth.workerUrl?.trim() && auth.adminKey?.trim());

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Error / Unconfigured Alert Banner */}
      {(!isConfigured || isError) && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">
              {!isConfigured ? 'Worker URL & API Key Required in Settings' : pollerStatus.errorMessage || 'Worker Poller Error'}
            </span>
          </div>
        </div>
      )}

      {/* Header Banner - Compact Bento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 shrink-0">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {isOperational && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-outfit font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Poller Dashboard
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isOperational
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : isError || !isConfigured
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isOperational ? 'Live' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              15-minute background feed automation worker
            </p>
          </div>
        </div>

        <button
          id="btn-poller-run-check"
          onClick={triggerPollNow}
          disabled={isPollingLoading}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPollingLoading ? 'animate-spin' : ''}`} />
          <span>{isPollingLoading ? 'Checking...' : 'Run Check Now'}</span>
        </button>
      </div>

      {/* 2:2 Grid Column Card for Mobile, 4 columns for Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Poller Connection */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Poller Connection</span>
            <Radio
              className={`w-4 h-4 ${
                isOperational ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 truncate">
            {isConfigured && isOperational ? 'Cloudflare Live' : isConfigured ? 'Worker Offline' : 'Not Configured'}
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] sm:text-[11px] mt-1 font-medium ${
              isOperational ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isOperational ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
            <span className="truncate">{isOperational ? 'Active schedule' : 'Needs config'}</span>
          </div>
        </div>

        {/* Metric 2: Last Automatic Check */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Last Check</span>
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
            {timeAgo}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
            <span>Next: {formatCountdown(nextPollSeconds)}</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">15m</span>
          </div>
        </div>

        {/* Metric 3: Active Congregation Devices */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Active Devices</span>
            <Smartphone className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
            {(pollerStatus.activeTokens ?? pollerStatus.totalTokens).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
            <span className="text-blue-600 dark:text-blue-400 font-medium">iOS: {(pollerStatus.iosTokens ?? 0).toLocaleString()}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Android: {(pollerStatus.androidTokens ?? (pollerStatus.activeTokens ?? pollerStatus.totalTokens)).toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 4: Sync Operations */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Sync Operations</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
            {pollerStatus.historyCheckCount} Done
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            0 feed errors
          </div>
        </div>
      </div>

      {/* Newest Detected Message & Audio Feed Card */}
      {pollerStatus.lastDetectedTeaching ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-200 dark:border-[#27272a]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Latest Detected Sermon
              </span>
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-zinc-100 mt-0.5">
                {pollerStatus.lastDetectedTeaching.title}
              </h3>
            </div>

            {onComposeWithTeaching && (
              <button
                id="btn-compose-from-poller"
                onClick={onComposeWithTeaching}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Load Into Composer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Speaker: <strong className="text-slate-900 dark:text-zinc-100">{pollerStatus.lastDetectedTeaching.speaker || 'Pastor'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Date: <strong className="text-slate-900 dark:text-zinc-100">{pollerStatus.lastDetectedTeaching.publishedAt ? new Date(pollerStatus.lastDetectedTeaching.publishedAt).toLocaleDateString() : 'Recent'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Length: <strong className="text-slate-900 dark:text-zinc-100">{pollerStatus.lastDetectedTeaching.duration || 'Full sermon'}</strong>
              </span>
            </div>
          </div>

          {/* Audio Stream Preview */}
          {pollerStatus.lastDetectedTeaching.audioUrl && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#27272a] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  id="btn-play-sample-audio"
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isPlayingPreview ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isPlayingPreview ? (
                    <div className="w-2.5 h-2.5 flex gap-0.5 items-center justify-center">
                      <span className="w-0.5 h-2.5 bg-slate-950 rounded-sm" />
                      <span className="w-0.5 h-2.5 bg-slate-950 rounded-sm" />
                    </div>
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>
                <span className="truncate font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                  {pollerStatus.lastDetectedTeaching.audioUrl}
                </span>
              </div>

              <a
                href={pollerStatus.lastDetectedTeaching.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] font-medium flex items-center gap-1 shrink-0"
              >
                <span>MP3</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
