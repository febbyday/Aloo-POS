import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Save,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/lib/toast';

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams';
  name: string;
  enabled: boolean;
  recipients?: string[];
  webhookUrl?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface NotificationSettings {
  enableNotifications: boolean;
  channels: NotificationChannel[];
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  digestTime: string;
  digestDay?: number;
  criticalAlertChannels: string[];
  warningAlertChannels: string[];
  templates: {
    critical: string;
    warning: string;
    digest: string;
  };
}

interface AlertNotificationManagerProps {
  settings: NotificationSettings;
  templates: NotificationTemplate[];
  onSave: (settings: NotificationSettings) => Promise<void>;
  onTestNotification: (channelId: string, templateId: string) => Promise<void>;
}

export const AlertNotificationManager: React.FC<AlertNotificationManagerProps> = ({
  settings,
  templates,
  onSave,
  onTestNotification,
}) => {
  const { toast } = useToast();
  const [currentSettings, setCurrentSettings] = useState<NotificationSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<{subject: string; body: string}>({
    subject: '',
    body: ''
  });

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      channels: prev.channels.map(channel =>
        channel.id === channelId ? { ...channel, enabled } : channel
      )
    }));
  };

  const handleDigestToggle = (enabled: boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      digestEnabled: enabled
    }));
  };

  const handleDigestFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setCurrentSettings(prev => ({
      ...prev,
      digestFrequency: frequency
    }));
  };

  const handleDigestTimeChange = (time: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      digestTime: time
    }));
  };

  const handleDigestDayChange = (day: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      digestDay: parseInt(day)
    }));
  };

  const handleAlertChannelToggle = (alertType: 'critical' | 'warning', channelId: string, enabled: boolean) => {
    setCurrentSettings(prev => {
      const channelKey = `${alertType}AlertChannels` as 'criticalAlertChannels' | 'warningAlertChannels';
      const channels = [...prev[channelKey]];

      if (enabled && !channels.includes(channelId)) {
        channels.push(channelId);
      } else if (!enabled && channels.includes(channelId)) {
        const index = channels.indexOf(channelId);
        channels.splice(index, 1);
      }

      return {
        ...prev,
        [channelKey]: channels
      };
    });
  };

  const handleTemplateChange = (alertType: 'critical' | 'warning' | 'digest', templateId: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [alertType]: templateId
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await onSave(currentSettings);
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async (channelId: string) => {
    try {
      const templateId = currentSettings.templates.critical;
      await onTestNotification(channelId, templateId);
      toast({
        title: "Test Notification Sent",
        description: "A test notification has been sent to the selected channel.",
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification. Please check your settings and try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateContent({
        subject: template.subject,
        body: template.body
      });
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      case 'push':
        return <Bell className="h-5 w-5" />;
      case 'slack':
        return <MessageSquare className="h-5 w-5" />;
      case 'teams':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Stock Alert Notifications
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications for stock alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
            <TabsTrigger value="digest">Digest Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6 pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-notifications"
                checked={currentSettings.enableNotifications}
                onCheckedChange={(checked) => setCurrentSettings(prev => ({
                  ...prev,
                  enableNotifications: checked
                }))}
              />
              <Label htmlFor="enable-notifications">Enable stock alert notifications</Label>
            </div>

            <div className="space-y-4">
              {currentSettings.channels.map(channel => (
                <Card key={channel.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel.type)}
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{channel.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestNotification(channel.id)}
                          disabled={!channel.enabled}
                        >
                          Test
                        </Button>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={(checked) => handleChannelToggle(channel.id, checked)}
                        />
                      </div>
                    </div>

                    {channel.enabled && (
                      <div className="mt-4 space-y-2">
                        {channel.type === 'email' && (
                          <div>
                            <Label htmlFor={`recipients-${channel.id}`}>Recipients</Label>
                            <Input
                              id={`recipients-${channel.id}`}
                              placeholder="email1@example.com, email2@example.com"
                              value={channel.recipients?.join(', ') || ''}
                              onChange={(e) => {
                                const recipients = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                                setCurrentSettings(prev => ({
                                  ...prev,
                                  channels: prev.channels.map(c =>
                                    c.id === channel.id ? { ...c, recipients } : c
                                  )
                                }));
                              }}
                            />
                          </div>
                        )}

                        {(channel.type === 'slack' || channel.type === 'teams') && (
                          <div>
                            <Label htmlFor={`webhook-${channel.id}`}>Webhook URL</Label>
                            <Input
                              id={`webhook-${channel.id}`}
                              placeholder="https://hooks.slack.com/services/..."
                              value={channel.webhookUrl || ''}
                              onChange={(e) => {
                                setCurrentSettings(prev => ({
                                  ...prev,
                                  channels: prev.channels.map(c =>
                                    c.id === channel.id ? { ...c, webhookUrl: e.target.value } : c
                                  )
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 pt-4">
            <div className="space-y-4">
              {/* Critical Alerts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    Critical Alerts
                  </CardTitle>
                  <CardDescription>
                    Configure notifications for critical stock levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Notification Channels</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {currentSettings.channels.map(channel => (
                          <div key={channel.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`critical-${channel.id}`}
                              checked={currentSettings.criticalAlertChannels.includes(channel.id)}
                              onCheckedChange={(checked) =>
                                handleAlertChannelToggle('critical', channel.id, !!checked)
                              }
                              disabled={!channel.enabled}
                            />
                            <Label
                              htmlFor={`critical-${channel.id}`}
                              className={!channel.enabled ? 'text-muted-foreground' : ''}
                            >
                              {channel.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Notification Template</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Select
                          value={currentSettings.templates.critical}
                          onValueChange={(value) => handleTemplateChange('critical', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTemplate(currentSettings.templates.critical)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Alerts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    Warning Alerts
                  </CardTitle>
                  <CardDescription>
                    Configure notifications for warning stock levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Notification Channels</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {currentSettings.channels.map(channel => (
                          <div key={channel.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`warning-${channel.id}`}
                              checked={currentSettings.warningAlertChannels.includes(channel.id)}
                              onCheckedChange={(checked) =>
                                handleAlertChannelToggle('warning', channel.id, !!checked)
                              }
                              disabled={!channel.enabled}
                            />
                            <Label
                              htmlFor={`warning-${channel.id}`}
                              className={!channel.enabled ? 'text-muted-foreground' : ''}
                            >
                              {channel.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Notification Template</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Select
                          value={currentSettings.templates.warning}
                          onValueChange={(value) => handleTemplateChange('warning', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTemplate(currentSettings.templates.warning)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="digest" className="space-y-6 pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-digest"
                checked={currentSettings.digestEnabled}
                onCheckedChange={handleDigestToggle}
              />
              <Label htmlFor="enable-digest">Enable scheduled alert digests</Label>
            </div>

            {currentSettings.digestEnabled && (
              <div className="space-y-4">
                <div>
                  <Label>Digest Frequency</Label>
                  <Select
                    value={currentSettings.digestFrequency}
                    onValueChange={(value) => handleDigestFrequencyChange(value as 'daily' | 'weekly' | 'monthly')}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentSettings.digestFrequency === 'weekly' && (
                  <div>
                    <Label>Day of Week</Label>
                    <Select
                      value={currentSettings.digestDay?.toString() || '1'}
                      onValueChange={handleDigestDayChange}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentSettings.digestFrequency === 'monthly' && (
                  <div>
                    <Label>Day of Month</Label>
                    <Select
                      value={currentSettings.digestDay?.toString() || '1'}
                      onValueChange={handleDigestDayChange}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Time of Day</Label>
                  <Input
                    type="time"
                    value={currentSettings.digestTime}
                    onChange={(e) => handleDigestTimeChange(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Digest Template</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Select
                      value={currentSettings.templates.digest}
                      onValueChange={(value) => handleTemplateChange('digest', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTemplate(currentSettings.templates.digest)}
                    >
                      View
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Notification Channels</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {currentSettings.channels.map(channel => (
                      <div key={channel.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`digest-${channel.id}`}
                          checked={
                            currentSettings.criticalAlertChannels.includes(channel.id) ||
                            currentSettings.warningAlertChannels.includes(channel.id)
                          }
                          disabled={true}
                        />
                        <Label
                          htmlFor={`digest-${channel.id}`}
                          className={!channel.enabled ? 'text-muted-foreground' : ''}
                        >
                          {channel.name}
                          {!channel.enabled && ' (disabled)'}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Digest will be sent to all channels configured for critical or warning alerts.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedTemplate && (
          <div className="mt-6 p-4 border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Template Preview</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <Label>Subject</Label>
                <div className="p-2 border rounded-md mt-1 bg-muted/30">
                  {templateContent.subject}
                </div>
              </div>
              <div>
                <Label>Body</Label>
                <div className="p-2 border rounded-md mt-1 bg-muted/30 whitespace-pre-wrap">
                  {templateContent.body}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Available variables:</p>
                <ul className="list-disc list-inside">
                  <li>{'{{productName}}'} - Product name</li>
                  <li>{'{{productSku}}'} - Product SKU</li>
                  <li>{'{{currentStock}}'} - Current stock level</li>
                  <li>{'{{threshold}}'} - Alert threshold</li>
                  <li>{'{{location}}'} - Store location</li>
                  <li>{'{{date}}'} - Current date</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlertNotificationManager;
