export type NotificationType = 'audio' | 'devotional' | 'event' | 'announcement';

export interface AdminAuth {
  isAuthenticated: boolean;
  pin: string;
  rememberMe: boolean;
  workerUrl: string;
  adminKey: string;
  isDemoMode: boolean;
  lastLoginAt?: string;
}

export interface TeachingItem {
  id: string;
  title: string;
  speaker: string;
  series?: string;
  publishedAt: string;
  audioUrl: string;
  duration?: string;
  imageUrl?: string;
  summary?: string;
}

export interface PollerStatus {
  status: 'operational' | 'polling' | 'degraded' | 'error';
  lastCheckTimestamp: string;
  totalTokens: number;
  activeTokens?: number;
  revokedTokens?: number;
  unsubscribedTokens?: number;
  iosTokens?: number;
  androidTokens?: number;
  pwaTokens?: number;
  lastDetectedItem: string;
  lastDetectedTeaching?: TeachingItem | null;
  nextScheduledPollSeconds: number;
  autoPollingActive: boolean;
  historyCheckCount: number;
  errorMessage?: string;
}

export interface BroadcastDataPayload {
  type: NotificationType;
  audioId?: string;
  audioUrl?: string;
  devotionalDate?: string;
  eventId?: string;
  linkUrl?: string;
  category?: string;
  priority?: 'default' | 'high';
  [key: string]: unknown;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  subtitle?: string;
  type: NotificationType;
  imageUrl?: string;
  createdAt: string;
  expiresAt?: string;
  linkUrl?: string;
  priority?: 'normal' | 'high';
  status?: 'published' | 'unpublished';
  displayType?: 'inline' | 'popup_modal';
  popupStyle?: 'card' | 'image_only';
  actionText?: string;
  actionRoute?: string;
  isDismissible?: boolean;
  showOnce?: boolean;
  publishAt?: string;
  pinToFeed?: boolean;
}

export interface BroadcastPayload {
  title: string;
  subtitle?: string;
  body: string;
  type: NotificationType;
  imageUrl?: string;
  data: BroadcastDataPayload;
  isTest: boolean;
  testToken?: string | null;
  sendPush?: boolean;
  saveToFeed?: boolean;
  expiresAt?: string;
  publishAt?: string;
  pinToFeed?: boolean;
  displayType?: 'inline' | 'popup_modal';
  popupStyle?: 'card' | 'image_only';
  actionText?: string;
  actionRoute?: string;
  isDismissible?: boolean;
  showOnce?: boolean;
}

export interface BroadcastResult {
  success: boolean;
  message: string;
  broadcastId?: string;
  recipientCount?: number;
  tickets?: Array<{ id: string; status: 'ok' | 'error'; message?: string }>;
  timestamp: string;
  error?: string;
}

export interface BroadcastHistoryItem {
  id: string;
  timestamp: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  body: string;
  imageUrl?: string;
  status: 'delivered' | 'sent' | 'failed';
  recipientCount: number;
  isTest: boolean;
  testToken?: string | null;
  payload: BroadcastPayload;
  resultDetails?: {
    successCount: number;
    failedCount: number;
    ticketSummary?: string;
  };
}

export interface PresetTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  body: string;
  imageUrl: string;
  data: BroadcastDataPayload;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

export interface RegisteredDevice {
  token: string;
  platform: 'ios' | 'android' | 'web' | 'ios_pwa';
  registeredAt: string;
  lastActiveAt: string;
  deviceModel?: string;
  appVersion?: string;
  status?: 'active' | 'revoked' | 'unsubscribed';
  revokedAt?: string;
  revokedReason?: string;
}
