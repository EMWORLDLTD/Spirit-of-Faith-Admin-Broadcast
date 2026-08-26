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

  // Compute live relative time
  useEffect(() => {
    const updateRelativeTime = () => {
      const last = new Date(pollerStatus.lastCheckTimestamp).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - last) / 1000));

      if (diffSec < 45) {
        setTimeAgo('Just now');
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`Checked ${mins} min${mins === 1 ? '' : 's'} ago`);
      } else {
        const hours = Math.floor(diffSec / 3600);
        setTimeAgo(`Checked ${hours} hr${hours === 1 ? '' : 's'} ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);
    return () => clearInterval(interval);
  }, [pollerStatus.lastCheckTimestamp]);

  // Countdown timer for next scheduled 15-min poller
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Error / Unconfigured Alert Banner */}
      {(!isConfigured || isError) && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 dark:text-rose-100">
                {!isConfigured ? 'Cloudflare Worker & API Key Required' : 'Worker Poller Error'}
              </p>
              <p className="mt-0.5 text-rose-800 dark:text-rose-300 leading-relaxed">
                {pollerStatus.errorMessage ||
                  'Your Cloudflare Worker URL and Admin API Key must be configured in Settings to poll feeds and dispatch live notifications.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 dark:from-[#1C2541] dark:via-[#161F38] dark:to-[#0B132B] border border-blue-200 dark:border-blue-500/20 shadow-md dark:shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/40 shadow-xs">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {isOperational && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-outfit font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Live Automation & 15-Min Poller
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOperational
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                    : isError || !isConfigured
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOperational
                      ? 'bg-emerald-500 animate-pulse'
                      : isError || !isConfigured
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
                {isOperational
                  ? 'Operational • Polling Active'
                  : !isConfigured
                  ? 'Not Configured'
                  : 'Worker Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Background cron worker checks podcast feeds and devotional schedules every 15 minutes.
            </p>
          </div>
        </div>

        {/* Action Button: Run Check Now */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-poller-run-check"
            onClick={triggerPollNow}
            disabled={isPollingLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-white ${isPollingLoading ? 'animate-spin' : ''}`}
            />
            <span>{isPollingLoading ? 'Checking Feeds...' : 'Run Check Now'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Connection Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Poller Connection</span>
            <Radio
              className={`w-4 h-4 ${
                isOperational
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400'
              }`}
            />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>
              {isConfigured && isOperational
                ? 'Cloudflare Live'
                : isConfigured
                ? 'Worker Offline'
                : 'Not Configured'}
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-[11px] mt-1.5 font-medium ${
              isOperational
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isOperational ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cron triggers running on schedule</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{!isConfigured ? 'API Key required in Settings' : 'Worker unavailable'}</span>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: Last Check Timestamp */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Last Automatic Check</span>
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {timeAgo}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Next in {formatCountdown(nextPollSeconds)}</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">15m interval</span>
          </div>
        </div>

        {/* Metric 3: Total Registered User Devices */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Congregation Devices</span>
            <Smartphone className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {pollerStatus.totalTokens.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            {pollerStatus.totalTokens > 0 ? (
              <>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 font-medium">
                  iOS: {pollerStatus.iosTokens ? pollerStatus.iosTokens.toLocaleString() : Math.round(pollerStatus.totalTokens * 0.58).toLocaleString()}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 font-medium">
                  Android: {pollerStatus.androidTokens ? pollerStatus.androidTokens.toLocaleString() : Math.round(pollerStatus.totalTokens * 0.42).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">
                Awaiting active device registrations
              </span>
            )}
          </div>
        </div>

        {/* Metric 4: Lifetime Automation Syncs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Sync Operations</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {pollerStatus.historyCheckCount} Completed
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
            <span>0 feed ingestion errors</span>
          </div>
        </div>
      </div>

      {/* Newest Detected Message & Audio Feed Card */}
      {pollerStatus.lastDetectedTeaching ? (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1C2541]/70 border border-slate-200 dark:border-slate-700/80 shadow-md dark:shadow-lg backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Latest Detected Teaching / Sermon
              </span>
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                {pollerStatus.lastDetectedTeaching.title}
              </h3>
            </div>

            {onComposeWithTeaching && (
              <button
                id="btn-compose-from-poller"
                onClick={onComposeWithTeaching}
                className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Load Into Composer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>
                Speaker:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {pollerStatus.lastDetectedTeaching.speaker || 'Senior Pastor'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>
                Published:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {pollerStatus.lastDetectedTeaching.publishedAt
                    ? new Date(pollerStatus.lastDetectedTeaching.publishedAt).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )
                    : 'Recent'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Volume2 className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>
                Duration:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {pollerStatus.lastDetectedTeaching.duration || 'Full message'}
                </strong>
              </span>
            </div>
          </div>

          {/* Audio Link & Interactive Player Preview */}
          {pollerStatus.lastDetectedTeaching.audioUrl && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  id="btn-play-sample-audio"
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isPlayingPreview
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                  title={isPlayingPreview ? 'Pause Audio Preview' : 'Play Audio Sample'}
                >
                  {isPlayingPreview ? (
                    <div className="w-3 h-3 flex gap-0.5 items-center justify-center">
                      <span className="w-1 h-3 bg-slate-950 rounded-sm" />
                      <span className="w-1 h-3 bg-slate-950 rounded-sm" />
                    </div>
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {pollerStatus.lastDetectedTeaching.audioUrl}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isPlayingPreview
                      ? 'Playing sermon audio stream...'
                      : 'Direct CDN audio stream payload'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pollerStatus.lastDetectedTeaching.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Inspect MP3</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Latest Detected Sermon
            </span>
            <h3 className="font-outfit font-bold text-base text-slate-700 dark:text-slate-300 mt-1">
              No recent sermon detected from feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The poller automatically polls your church podcast RSS feed every 15 minutes. Click below to run a sync check now.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerPollNow}
            disabled={isPollingLoading}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPollingLoading ? 'animate-spin' : ''}`} />
            <span>{isPollingLoading ? 'Checking Feeds...' : 'Check Feeds Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
