import { BroadcastHistoryItem, PresetTemplate, TeachingItem } from '../types';

export const OFFICIAL_CHURCH_ASSETS = {
  logo: '/icon.svg',
  sermonArtwork: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=800&auto=format&fit=crop',
  sermonGrace: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop',
  devotionalArtwork: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=800&auto=format&fit=crop',
  eventArtwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
  announcementArtwork: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
  prayerArtwork: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop',
};

export const RECENT_TEACHINGS: TeachingItem[] = [];

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'preset-sermon-latest',
    name: 'New Audio Teaching (Sunday)',
    type: 'audio',
    title: 'New Sunday Teaching Available',
    subtitle: 'Sunday Service • Senior Pastor',
    body: 'Listen to the powerful new Sunday message. Tap to stream directly in the Spirit of Faith App.',
    imageUrl: OFFICIAL_CHURCH_ASSETS.sermonArtwork,
    data: {
      type: 'audio',
      priority: 'high',
    },
  },
  {
    id: 'preset-devotional-today',
    name: 'Daily Devotional (Morning)',
    type: 'devotional',
    title: 'Today’s Word: Walking in God’s Peace',
    subtitle: 'Daily Faith Walk',
    body: 'Start your morning in God’s presence with today’s scripture meditation, faith confession, and prayer focus.',
    imageUrl: OFFICIAL_CHURCH_ASSETS.devotionalArtwork,
    data: {
      type: 'devotional',
      devotionalDate: new Date().toISOString().split('T')[0],
      priority: 'default',
    },
  },
  {
    id: 'preset-communion-service',
    name: 'Midweek Communion Service',
    type: 'event',
    title: 'Midweek Communion & Word Service Tonight',
    subtitle: '6:30 PM • In-Person & Live Stream',
    body: 'Join us for an uplifting evening of worship, the Word, and the Lord’s Table.',
    imageUrl: OFFICIAL_CHURCH_ASSETS.eventArtwork,
    data: {
      type: 'event',
      linkUrl: 'https://spiritoffaith.org/live',
      priority: 'high',
    },
  },
  {
    id: 'preset-fasting-prayer',
    name: 'Global Prayer Alert',
    type: 'announcement',
    title: 'Corporate Prayer Call: 12:00 PM',
    subtitle: 'Prayer Chain',
    body: 'Join our corporate prayer line for 15 minutes of unified intercession and faith declaration.',
    imageUrl: OFFICIAL_CHURCH_ASSETS.prayerArtwork,
    data: {
      type: 'announcement',
      priority: 'high',
    },
  },
];

export const INITIAL_BROADCAST_HISTORY: BroadcastHistoryItem[] = [];

