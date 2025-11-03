'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense } from '@/types/expense';
import {
  Cloud,
  Mail,
  Share2,
  Clock,
  History,
  FileText,
  CloudOff,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  QrCode,
  Trash2,
  RefreshCw,
  Settings,
  Zap,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/helpers';
import QRCodeLib from 'qrcode';
import {
  ExportTemplate,
  CloudIntegration,
  ScheduledExport,
  ExportHistory,
  ShareableLink,
  CloudProvider,
  ExportFrequency
} from '@/types/cloudExport';

interface CloudExportHubProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'templates' | 'email' | 'cloud' | 'schedule' | 'share' | 'history';

// Mock data for demonstration
const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'Detailed report formatted for tax filing',
    icon: '📊',
    format: 'pdf',
    includeFields: ['date', 'category', 'amount', 'description'],
    filters: { dateRange: 'year' }
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'Quick overview of monthly expenses',
    icon: '📅',
    format: 'pdf',
    includeFields: ['category', 'amount'],
    filters: { dateRange: 'month' }
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Breakdown by spending categories',
    icon: '🎯',
    format: 'excel',
    includeFields: ['category', 'amount'],
  },
  {
    id: 'full-export',
    name: 'Complete Data Export',
    description: 'All expenses in CSV format',
    icon: '💾',
    format: 'csv',
    includeFields: ['date', 'category', 'amount', 'description', 'createdAt'],
  }
];

const CLOUD_INTEGRATIONS: CloudIntegration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '📁',
    connected: false,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    connected: false,
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    connected: false,
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
    connected: false,
  }
];

export const CloudExportHub: React.FC<CloudExportHubProps> = ({
  expenses,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState('');
  const [cloudIntegrations, setCloudIntegrations] = useState<CloudIntegration[]>(CLOUD_INTEGRATIONS);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'templates' as TabType, label: 'Templates', icon: FileText },
    { id: 'email' as TabType, label: 'Email', icon: Mail },
    { id: 'cloud' as TabType, label: 'Cloud Storage', icon: Cloud },
    { id: 'schedule' as TabType, label: 'Scheduled', icon: Clock },
    { id: 'share' as TabType, label: 'Share', icon: Share2 },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  // Generate QR code when shareable link is created
  useEffect(() => {
    if (shareableLink?.url) {
      QRCodeLib.toDataURL(shareableLink.url, { width: 200 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [shareableLink]);

  const handleConnectCloud = (providerId: CloudProvider) => {
    setCloudIntegrations(prev =>
      prev.map(integration =>
        integration.id === providerId
          ? { ...integration, connected: !integration.connected, lastSync: new Date().toISOString() }
          : integration
      )
    );
  };

  const handleEmailExport = () => {
    if (!emailAddress || !selectedTemplate) {
      alert('Please select a template and enter an email address');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newHistoryItem: ExportHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        template: selectedTemplate,
        destination: `Email: ${emailAddress}`,
        status: 'success',
        recordCount: expenses.length,
        fileSize: '2.4 MB'
      };
      setExportHistory(prev => [newHistoryItem, ...prev]);
      setIsProcessing(false);
      alert(`Export sent to ${emailAddress}!`);
      setActiveTab('history');
    }, 2000);
  };

  const handleCloudSync = (providerId: CloudProvider) => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const provider = cloudIntegrations.find(c => c.id === providerId);
      const newHistoryItem: ExportHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        template: selectedTemplate,
        destination: provider?.name || 'Cloud',
        status: 'success',
        recordCount: expenses.length,
        fileSize: '2.4 MB'
      };
      setExportHistory(prev => [newHistoryItem, ...prev]);
      setIsProcessing(false);
      alert(`Synced to ${provider?.name}!`);
      setActiveTab('history');
    }, 2000);
  };

  const handleScheduleExport = (frequency: ExportFrequency, destination: string) => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    const nextRun = new Date();
    if (frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1);
    if (frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
    if (frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);

    const newSchedule: ScheduledExport = {
      id: Date.now().toString(),
      name: `${frequency} export to ${destination}`,
      template: selectedTemplate,
      frequency,
      destination,
      nextRun: nextRun.toISOString(),
      enabled: true,
    };

    setScheduledExports(prev => [newSchedule, ...prev]);
    alert('Scheduled export created!');
  };

  const handleGenerateShareLink = () => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newLink: ShareableLink = {
      id: Date.now().toString(),
      url: `https://expenses.app/share/${Date.now()}`,
      expiresAt: expiresAt.toISOString(),
      views: 0,
      maxViews: 100,
    };

    setShareableLink(newLink);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cloud Export Hub" size="xl">
      <div className="space-y-4">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <div className="text-sm opacity-90">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <div className="text-sm opacity-90">Total Amount</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{exportHistory.length}</div>
              <div className="text-sm opacity-90">Exports</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Zap size={16} className="text-yellow-500" />
                <span>Choose a pre-configured template to get started quickly</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {EXPORT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{template.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {template.format.toUpperCase()}
                          </span>
                          {template.filters?.dateRange && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {template.filters.dateRange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedTemplate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm text-green-800">
                    Template selected! Choose a destination in the tabs above.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-blue-900">Email Export</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Send your expense report directly to your email inbox
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Template
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {selectedTemplate ? (
                    <span className="text-gray-900 font-medium">
                      {EXPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">No template selected</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-700">Include summary statistics</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-700">Attach as PDF</span>
                </label>
              </div>

              <Button
                onClick={handleEmailExport}
                disabled={!selectedTemplate || !emailAddress || isProcessing}
                className="w-full flex items-center justify-center gap-2"
                variant="primary"
              >
                <Mail size={18} />
                {isProcessing ? 'Sending...' : 'Send Email Export'}
              </Button>
            </div>
          )}

          {/* Cloud Storage Tab */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Cloud className="text-purple-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-purple-900">Cloud Integrations</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Connect your favorite cloud services for automatic syncing
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cloudIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="border-2 border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          {integration.connected && integration.lastSync && (
                            <p className="text-xs text-gray-500">
                              Synced {format(new Date(integration.lastSync), 'MMM dd, HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                      {integration.connected ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <CloudOff className="text-gray-400" size={20} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleConnectCloud(integration.id)}
                        variant={integration.connected ? 'secondary' : 'primary'}
                        className="w-full text-sm"
                        size="sm"
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                      {integration.connected && (
                        <Button
                          onClick={() => handleCloudSync(integration.id)}
                          variant="secondary"
                          className="w-full text-sm"
                          size="sm"
                          disabled={!selectedTemplate || isProcessing}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Sync Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!selectedTemplate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Select a template first to enable syncing
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Scheduled Exports Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-green-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900">Automated Exports</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Set up recurring exports to run automatically
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['daily', 'weekly', 'monthly'] as ExportFrequency[]).map((freq) => (
                  <Button
                    key={freq}
                    onClick={() => handleScheduleExport(freq, 'Email')}
                    disabled={!selectedTemplate}
                    variant="secondary"
                    className="capitalize"
                  >
                    <Clock size={16} className="mr-2" />
                    Schedule {freq}
                  </Button>
                ))}
              </div>

              {scheduledExports.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Active Schedules</h4>
                  {scheduledExports.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{schedule.name}</h5>
                        <p className="text-sm text-gray-600">
                          Next: {format(new Date(schedule.nextRun), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          schedule.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {schedule.enabled ? 'Active' : 'Paused'}
                        </span>
                        <button
                          onClick={() => setScheduledExports(prev => prev.filter(s => s.id !== schedule.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Share2 className="text-pink-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-pink-900">Share Your Data</h3>
                    <p className="text-sm text-pink-700 mt-1">
                      Generate secure, temporary links to share your expense reports
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateShareLink}
                disabled={!selectedTemplate}
                className="w-full"
                variant="primary"
              >
                <Share2 size={18} className="mr-2" />
                Generate Shareable Link
              </Button>

              {shareableLink && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Shareable Link</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Link URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={shareableLink.url}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(shareableLink.url)}
                        variant="secondary"
                        size="sm"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Views:</span>
                      <span className="ml-2 font-semibold">{shareableLink.views} / {shareableLink.maxViews}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Expires:</span>
                      <span className="ml-2 font-semibold">
                        {format(new Date(shareableLink.expiresAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode size={18} className="text-gray-700" />
                        <span className="font-medium text-gray-900">QR Code</span>
                      </div>
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Scan to access the shared expense report
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                    >
                      <Settings size={14} className="mr-1" />
                      Configure
                    </Button>
                    <Button
                      onClick={() => setShareableLink(null)}
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Revoke
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <History className="text-gray-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Export History</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Track all your past exports and downloads
                    </p>
                  </div>
                </div>
              </div>

              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Database size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No export history yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your exports will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exportHistory.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900">
                              {EXPORT_TEMPLATES.find(t => t.id === item.template)?.name || item.template}
                            </h5>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : item.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.destination}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>{format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                            <span>{item.recordCount} records</span>
                            {item.fileSize && <span>{item.fileSize}</span>}
                          </div>
                        </div>
                        {item.downloadUrl && (
                          <Button variant="secondary" size="sm">
                            <Download size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
