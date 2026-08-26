import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminAuth,
  BroadcastHistoryItem,
  BroadcastPayload,
  BroadcastResult,
  PollerStatus,
  PresetTemplate,
  ToastMessage,
} from '../types';
import { apiService } from '../services/api';
import { INITIAL_BROADCAST_HISTORY, OFFICIAL_CHURCH_ASSETS, PRESET_TEMPLATES } from '../data/mockData';

const DEFAULT_PIN = (import.meta.env.VITE_ADMIN_PIN as string) || '7777';
const INITIAL_DRAFT: BroadcastPayload = {
  title: '',
  subtitle: '',
  body: '',
  type: 'audio',
  imageUrl: OFFICIAL_CHURCH_ASSETS.sermonArtwork,
  data: {
    type: 'audio',
    priority: 'high',
  },
  isTest: false,
  testToken: null,
};

interface AdminContextType {
  auth: AdminAuth;
  login: (pin: string, rememberMe?: boolean) => boolean;
  logout: () => void;
  lock: () => void;
  updateCredentials: (workerUrl: string, adminKey: string, isDemoMode: boolean, newPin?: string) => void;
  
  pollerStatus: PollerStatus;
  isPollingLoading: boolean;
  triggerPollNow: () => Promise<{ success: boolean; message: string; newItemsFound: boolean }>;
  
  broadcastHistory: BroadcastHistoryItem[];
  sendBroadcast: (payload: BroadcastPayload) => Promise<BroadcastResult>;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  
  activeDraft: BroadcastPayload;
  updateActiveDraft: (partial: Partial<BroadcastPayload>) => void;
  loadPreset: (preset: PresetTemplate) => void;
  resetDraft: () => void;
  
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  savedTestToken: string;
  setSavedTestToken: (token: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth & Credentials State
  const [auth, setAuth] = useState<AdminAuth>(() => {
    const savedPin = localStorage.getItem('sof_admin_saved_pin') || DEFAULT_PIN;
    const remembered = localStorage.getItem('sof_admin_remembered') === 'true';
    const isAuth = localStorage.getItem('sof_admin_authenticated') === 'true';
    const config = apiService.getConfig();

    return {
      isAuthenticated: remembered && isAuth,
      pin: savedPin,
      rememberMe: remembered,
      workerUrl: config.workerUrl,
      adminKey: config.adminKey,
      lastLoginAt: localStorage.getItem('sof_admin_last_login') || undefined,
    };
  });

  // 2. Poller Status
  const [pollerStatus, setPollerStatus] = useState<PollerStatus>(() => {
    const isConfigured = apiService.isConfigured();
    return {
      status: isConfigured ? 'operational' : 'error',
      lastCheckTimestamp: new Date().toISOString(),
      totalTokens: 0,
      lastDetectedItem: '',
      lastDetectedTeaching: null,
      nextScheduledPollSeconds: isConfigured ? 900 : 0,
      autoPollingActive: isConfigured,
      historyCheckCount: 0,
      errorMessage: isConfigured
        ? undefined
        : 'Backend unconfigured: Please enter your Cloudflare Worker URL and Admin API Key in Settings.',
    };
  });
  const [isPollingLoading, setIsPollingLoading] = useState(false);

  // 3. Draft Composer State
  const [activeDraft, setActiveDraft] = useState<BroadcastPayload>(() => {
    const saved = localStorage.getItem('sof_active_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title === 'New Teaching: The Law of the Spirit of Life') {
          return INITIAL_DRAFT;
        }
        return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_DRAFT;
  });

  // 4. History Logs
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastHistoryItem[]>(() => {
    const saved = localStorage.getItem('sof_broadcast_history');
    if (saved) {
      try {
        const parsed: BroadcastHistoryItem[] = JSON.parse(saved);
        // Purge legacy mock history items
        const clean = parsed.filter(
          (item) => !['hist-001', 'hist-002', 'hist-003'].includes(item.id)
        );
        return clean;
      } catch {
        // ignore
      }
    }
    return INITIAL_BROADCAST_HISTORY;
  });

  // 5. Test Token
  const [savedTestToken, setSavedTestTokenState] = useState<string>(() => {
    return localStorage.getItem('sof_saved_test_token') || '';
  });

  // 6. Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 7. Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sof_portal_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('sof_portal_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync draft to localStorage
  useEffect(() => {
    localStorage.setItem('sof_active_draft', JSON.stringify(activeDraft));
  }, [activeDraft]);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('sof_broadcast_history', JSON.stringify(broadcastHistory));
  }, [broadcastHistory]);

  // Periodic Status Fetch
  const refreshStatus = useCallback(async () => {
    try {
      const status = await apiService.getStatus();
      setPollerStatus(status);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshStatus();
      const interval = setInterval(refreshStatus, 30000); // 30s background heartbeat
      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, refreshStatus]);

  // Auth Functions
  const login = useCallback(
    (enteredPin: string, remember = true): boolean => {
      const validPin = auth.pin || DEFAULT_PIN;
      if (enteredPin.trim() === validPin.trim()) {
        const now = new Date().toISOString();
        setAuth((prev) => ({
          ...prev,
          isAuthenticated: true,
          rememberMe: remember,
          lastLoginAt: now,
        }));
        localStorage.setItem('sof_admin_authenticated', 'true');
        localStorage.setItem('sof_admin_remembered', String(remember));
        localStorage.setItem('sof_admin_last_login', now);
        addToast({
          type: 'success',
          title: 'Session Authenticated',
          description: 'Welcome to Spirit of Faith Admin Broadcast Portal.',
        });
        return true;
      }
      addToast({
        type: 'error',
        title: 'Access Denied',
        description: 'Incorrect security PIN entered. Please try again.',
      });
      return false;
    },
    [auth.pin, addToast]
  );

  const lock = useCallback(() => {
    setAuth((prev) => ({ ...prev, isAuthenticated: false }));
    localStorage.setItem('sof_admin_authenticated', 'false');
    addToast({
      type: 'info',
      title: 'Portal Locked',
      description: 'Enter your administrator PIN to resume.',
    });
  }, [addToast]);

  const logout = useCallback(() => {
    setAuth((prev) => ({ ...prev, isAuthenticated: false, rememberMe: false }));
    localStorage.setItem('sof_admin_authenticated', 'false');
    localStorage.setItem('sof_admin_remembered', 'false');
    addToast({
      type: 'info',
      title: 'Signed Out',
      description: 'Session ended successfully.',
    });
  }, [addToast]);

  const updateCredentials = useCallback(
    (workerUrl: string, adminKey: string, _isDemoMode?: boolean, newPin?: string) => {
      apiService.updateConfig({ workerUrl, adminKey });
      setAuth((prev) => ({
        ...prev,
        workerUrl,
        adminKey,
        pin: newPin && newPin.length >= 4 ? newPin : prev.pin,
      }));
      if (newPin && newPin.length >= 4) {
        localStorage.setItem('sof_admin_saved_pin', newPin);
      }
      addToast({
        type: 'success',
        title: 'Settings Saved',
        description: 'Cloudflare Worker credentials updated.',
      });
      refreshStatus();
    },
    [addToast, refreshStatus]
  );

  // Trigger Check Now
  const triggerPollNow = useCallback(async () => {
    setIsPollingLoading(true);
    try {
      const result = await apiService.triggerImmediatePoll();
      if (result.success) {
        setPollerStatus((prev) => ({
          ...prev,
          lastCheckTimestamp: new Date().toISOString(),
          historyCheckCount: prev.historyCheckCount + 1,
        }));
        addToast({
          type: 'success',
          title: 'Automation Sync Completed',
          description: result.message,
        });
        await refreshStatus();
        return result;
      } else {
        throw new Error(result.message || 'Worker sync failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to trigger worker sync';
      addToast({
        type: 'error',
        title: 'Sync Failed',
        description: msg,
      });
      return { success: false, message: msg, newItemsFound: false };
    } finally {
      setIsPollingLoading(false);
    }
  }, [addToast, refreshStatus]);

  // Send Broadcast
  const sendBroadcast = useCallback(
    async (payload: BroadcastPayload): Promise<BroadcastResult> => {
      const result = await apiService.sendBroadcast(payload);

      if (result.success) {
        const historyItem: BroadcastHistoryItem = {
          id: result.broadcastId || `bcast-${Date.now()}`,
          timestamp: result.timestamp,
          type: payload.type,
          title: payload.title,
          subtitle: payload.subtitle,
          body: payload.body,
          imageUrl: payload.imageUrl,
          status: 'delivered',
          recipientCount: result.recipientCount || (payload.isTest ? 1 : pollerStatus.totalTokens),
          isTest: payload.isTest,
          testToken: payload.testToken,
          payload,
          resultDetails: {
            successCount: result.recipientCount || (payload.isTest ? 1 : pollerStatus.totalTokens),
            failedCount: 0,
            ticketSummary: result.message,
          },
        };

        setBroadcastHistory((prev) => [historyItem, ...prev]);

        addToast({
          type: 'success',
          title: payload.isTest ? 'Test Push Delivered' : 'Broadcast Sent Successfully!',
          description: result.message,
          duration: 6000,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Broadcast Error',
          description: result.error || result.message || 'Push transmission failed.',
          duration: 6000,
        });
      }

      return result;
    },
    [addToast, pollerStatus.totalTokens]
  );

  const deleteHistoryItem = useCallback(
    (id: string) => {
      setBroadcastHistory((prev) => prev.filter((item) => item.id !== id));
      addToast({
        type: 'info',
        title: 'Record Removed',
        description: 'Broadcast log item removed.',
      });
    },
    [addToast]
  );

  const clearHistory = useCallback(() => {
    setBroadcastHistory([]);
    addToast({
      type: 'info',
      title: 'History Cleared',
      description: 'All past broadcast logs have been removed.',
    });
  }, [addToast]);

  const updateActiveDraft = useCallback((partial: Partial<BroadcastPayload>) => {
    setActiveDraft((prev) => ({
      ...prev,
      ...partial,
      data: {
        ...prev.data,
        ...(partial.data || {}),
        type: partial.type || prev.type,
      },
    }));
  }, []);

  const loadPreset = useCallback(
    (preset: PresetTemplate) => {
      setActiveDraft({
        title: preset.title,
        subtitle: preset.subtitle,
        body: preset.body,
        type: preset.type,
        imageUrl: preset.imageUrl,
        data: { ...preset.data },
        isTest: false,
        testToken: null,
      });
      addToast({
        type: 'info',
        title: 'Template Loaded',
        description: `Loaded "${preset.name}".`,
      });
    },
    [addToast]
  );

  const resetDraft = useCallback(() => {
    setActiveDraft(INITIAL_DRAFT);
    addToast({
      type: 'info',
      title: 'Composer Reset',
      description: 'Draft restored to default template.',
    });
  }, [addToast]);

  const setSavedTestToken = useCallback((token: string) => {
    setSavedTestTokenState(token);
    localStorage.setItem('sof_saved_test_token', token);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        auth,
        login,
        logout,
        lock,
        updateCredentials,
        pollerStatus,
        isPollingLoading,
        triggerPollNow,
        broadcastHistory,
        sendBroadcast,
        deleteHistoryItem,
        clearHistory,
        activeDraft,
        updateActiveDraft,
        loadPreset,
        resetDraft,
        toasts,
        addToast,
        removeToast,
        theme,
        toggleTheme,
        savedTestToken,
        setSavedTestToken,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
