export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive' | 'google-sheets';

export type ExportDestination = 'email' | 'cloud' | 'share' | 'schedule';

export type ExportFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: 'csv' | 'pdf' | 'json' | 'excel';
  includeFields: string[];
  filters?: {
    categories?: string[];
    dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
}

export interface CloudIntegration {
  id: CloudProvider;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  autoSync?: boolean;
}

export interface ScheduledExport {
  id: string;
  name: string;
  template: string;
  frequency: ExportFrequency;
  destination: string;
  nextRun: string;
  enabled: boolean;
  lastRun?: string;
}

export interface ExportHistory {
  id: string;
  timestamp: string;
  template: string;
  destination: string;
  status: 'success' | 'failed' | 'pending';
  recordCount: number;
  fileSize?: string;
  downloadUrl?: string;
}

export interface ShareableLink {
  id: string;
  url: string;
  expiresAt: string;
  views: number;
  maxViews?: number;
  password?: boolean;
  qrCode?: string;
}
