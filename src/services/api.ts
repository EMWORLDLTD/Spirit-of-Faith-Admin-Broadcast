import { BroadcastPayload, BroadcastResult, PollerStatus, TeachingItem } from '../types';

export interface ApiConfig {
  workerUrl: string;
  adminKey: string;
}

export class WorkerApiService {
  private static instance: WorkerApiService;
  private config: ApiConfig = {
    workerUrl: (import.meta.env.VITE_WORKER_URL as string) || '',
    adminKey: (import.meta.env.VITE_ADMIN_KEY as string) || '',
  };

  private constructor() {
    const savedUrl = localStorage.getItem('sof_admin_worker_url');
    const savedKey = localStorage.getItem('sof_admin_key');

    if (savedUrl !== null) this.config.workerUrl = savedUrl;
    if (savedKey !== null) this.config.adminKey = savedKey;
  }

  public static getInstance(): WorkerApiService {
    if (!WorkerApiService.instance) {
      WorkerApiService.instance = new WorkerApiService();
    }
    return WorkerApiService.instance;
  }

  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.workerUrl !== undefined) {
      localStorage.setItem('sof_admin_worker_url', newConfig.workerUrl);
    }
    if (newConfig.adminKey !== undefined) {
      localStorage.setItem('sof_admin_key', newConfig.adminKey);
    }
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.workerUrl?.trim() && this.config.adminKey?.trim());
  }

  private getCleanUrl(endpoint: string): string {
    const base = this.config.workerUrl.trim().replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.adminKey) {
      headers['Authorization'] = `Bearer ${this.config.adminKey.trim()}`;
    }
    return headers;
  }

  /**
   * 1. GET /api/admin/status
   */
  public async getStatus(): Promise<PollerStatus> {
    if (!this.config.workerUrl?.trim()) {
      return {
        status: 'error',
        lastCheckTimestamp: new Date().toISOString(),
        totalTokens: 0,
        lastDetectedItem: '',
        lastDetectedTeaching: null,
        nextScheduledPollSeconds: 0,
        autoPollingActive: false,
        historyCheckCount: 0,
        errorMessage: 'Cloudflare Worker URL is not configured. Please open Settings to set your backend URL.',
      };
    }

    if (!this.config.adminKey?.trim()) {
      return {
        status: 'error',
        lastCheckTimestamp: new Date().toISOString(),
        totalTokens: 0,
        lastDetectedItem: '',
        lastDetectedTeaching: null,
        nextScheduledPollSeconds: 0,
        autoPollingActive: false,
        historyCheckCount: 0,
        errorMessage: 'Admin API Key is missing. Please open Settings and enter your secret key.',
      };
    }

    try {
      const url = this.getCleanUrl('/api/admin/status');
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            status: 'error',
            lastCheckTimestamp: new Date().toISOString(),
            totalTokens: 0,
            lastDetectedItem: '',
            lastDetectedTeaching: null,
            nextScheduledPollSeconds: 0,
            autoPollingActive: false,
            historyCheckCount: 0,
            errorMessage: 'Authentication failed: Invalid Admin API Key.',
          };
        }
        return {
          status: 'error',
          lastCheckTimestamp: new Date().toISOString(),
          totalTokens: 0,
          lastDetectedItem: '',
          lastDetectedTeaching: null,
          nextScheduledPollSeconds: 0,
          autoPollingActive: false,
          historyCheckCount: 0,
          errorMessage: `Worker returned HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        status: data.status === 'degraded' || data.status === 'error' ? data.status : 'operational',
        lastCheckTimestamp: data.lastCheck || data.lastCheckTimestamp || new Date().toISOString(),
        totalTokens: typeof data.totalTokens === 'number' ? data.totalTokens : (data.registeredCount || 0),
        iosTokens: typeof data.iosTokens === 'number' ? data.iosTokens : undefined,
        androidTokens: typeof data.androidTokens === 'number' ? data.androidTokens : undefined,
        lastDetectedItem: data.lastItem || data.lastTeaching?.title || (data.lastDetectedItem || ''),
        lastDetectedTeaching: data.lastTeaching || data.lastDetectedTeaching || null,
        nextScheduledPollSeconds: data.nextPollSeconds || 900,
        autoPollingActive: data.autoPollingActive !== false,
        historyCheckCount: typeof data.historyCheckCount === 'number' ? data.historyCheckCount : (data.syncCount || 0),
        errorMessage: data.errorMessage,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Connection to worker failed';
      return {
        status: 'error',
        lastCheckTimestamp: new Date().toISOString(),
        totalTokens: 0,
        lastDetectedItem: '',
        lastDetectedTeaching: null,
        nextScheduledPollSeconds: 0,
        autoPollingActive: false,
        historyCheckCount: 0,
        errorMessage: `Cannot connect to Cloudflare Worker: ${errorMessage}`,
      };
    }
  }

  /**
   * 2. POST /api/admin/check-now
   */
  public async triggerImmediatePoll(): Promise<{
    success: boolean;
    message: string;
    newItemsFound: boolean;
    items?: TeachingItem[];
    timestamp: string;
  }> {
    if (!this.config.workerUrl?.trim()) {
      throw new Error(
        'Cloudflare Worker URL is not configured. Please open Settings and enter your Worker URL.'
      );
    }

    if (!this.config.adminKey?.trim()) {
      throw new Error(
        'Admin API Key is missing. Please open Settings and enter your secret key.'
      );
    }

    try {
      const url = this.getCleanUrl('/api/admin/check-now');
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ triggeredBy: 'admin-portal', timestamp: new Date().toISOString() }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: Invalid Admin API Secret Key.');
        }
        const errorText = await response.text();
        throw new Error(`Worker returned error HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Automation sync completed successfully.',
        newItemsFound: Boolean(data.newItemsFound),
        items: data.items || [],
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync request failed';
      throw new Error(msg);
    }
  }

  /**
   * 3. POST /api/admin/broadcast
   */
  public async sendBroadcast(payload: BroadcastPayload): Promise<BroadcastResult> {
    if (!this.config.workerUrl?.trim()) {
      return {
        success: false,
        message: 'Broadcast blocked: Cloudflare Worker URL is not configured in Settings.',
        error: 'Missing Cloudflare Worker URL. Open Settings to configure.',
        timestamp: new Date().toISOString(),
      };
    }

    if (!this.config.adminKey?.trim()) {
      return {
        success: false,
        message: 'Broadcast blocked: Admin API Key is missing. Enter your secret key in Settings.',
        error: 'Missing Admin API Key. Open Settings to configure.',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const url = this.getCleanUrl('/api/admin/broadcast');
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            message: 'Unauthorized: Invalid Admin API key.',
            error: 'Authentication failed: Worker rejected the admin key.',
            timestamp: new Date().toISOString(),
          };
        }
        const errorBody = await response.text();
        return {
          success: false,
          message: `Broadcast failed (HTTP ${response.status}): ${errorBody || response.statusText}`,
          error: errorBody || response.statusText,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || (payload.isTest ? 'Test push notification dispatched successfully.' : 'Congregation broadcast dispatched successfully.'),
        broadcastId: data.broadcastId || `sof-bcast-${Date.now()}`,
        recipientCount: payload.isTest ? 1 : (data.recipientCount || 0),
        tickets: data.tickets || [{ id: `ticket-${Math.random().toString(36).substring(2, 9)}`, status: 'ok' }],
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network connection failure';
      return {
        success: false,
        message: `Network error: ${errMsg}`,
        error: errMsg,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Diagnostic Connection Test
   */
  public async testConnection(): Promise<{
    connected: boolean;
    latencyMs: number;
    message: string;
    details?: Record<string, unknown>;
  }> {
    if (!this.config.workerUrl?.trim()) {
      return {
        connected: false,
        latencyMs: 0,
        message: 'No Worker URL configured. Please enter your Cloudflare Worker URL.',
      };
    }

    if (!this.config.adminKey?.trim()) {
      return {
        connected: false,
        latencyMs: 0,
        message: 'No Admin API Key provided. Please enter your secret key.',
      };
    }

    const startTime = performance.now();
    try {
      const url = this.getCleanUrl('/api/admin/status');
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        return {
          connected: true,
          latencyMs,
          message: `Connected successfully to Cloudflare Worker (${latencyMs}ms)`,
          details: body,
        };
      } else {
        return {
          connected: false,
          latencyMs,
          message: `Worker returned HTTP ${res.status}: ${res.statusText}`,
        };
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        connected: false,
        latencyMs,
        message: `Connection failed: ${err instanceof Error ? err.message : 'Network error'}`,
      };
    }
  }

  /**
   * 4. GET /api/admin/devices
   */
  public async getRegisteredDevices(): Promise<{ success: boolean; count: number; devices: any[] }> {
    if (!this.config.workerUrl?.trim() || !this.config.adminKey?.trim()) {
      return { success: false, count: 0, devices: [] };
    }

    try {
      const url = this.getCleanUrl('/api/admin/devices');
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return { success: false, count: 0, devices: [] };
      }

      const data = await response.json();
      return {
        success: true,
        count: data.count || (data.devices ? data.devices.length : 0),
        devices: data.devices || [],
      };
    } catch {
      return { success: false, count: 0, devices: [] };
    }
  }
}

export const apiService = WorkerApiService.getInstance();
