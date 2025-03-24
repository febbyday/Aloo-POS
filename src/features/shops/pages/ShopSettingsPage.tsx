import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FieldHelpTooltip } from '@/components/ui/help-tooltip'
import { OperationButton } from '@/components/ui/action-feedback'
import { Save } from 'lucide-react'

interface ShopSettings {
  autoSync: boolean;
  syncInterval: number;
  allowOfflineMode: boolean;
  requireLocationServices: boolean;
  enableInventoryAlerts: boolean;
  lowStockThreshold: number;
  enableStaffTracking: boolean;
  requireClockIn: boolean;
  allowRemoteAccess: boolean;
  securityLevel: 'basic' | 'advanced' | 'enterprise';
}

const defaultSettings: ShopSettings = {
  autoSync: true,
  syncInterval: 15,
  allowOfflineMode: true,
  requireLocationServices: true,
  enableInventoryAlerts: true,
  lowStockThreshold: 10,
  enableStaffTracking: false,
  requireClockIn: true,
  allowRemoteAccess: false,
  securityLevel: 'advanced'
};

export function ShopSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your shop settings have been updated successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Shop Settings</h2>
        <p className="text-muted-foreground">
          Configure how your shops operate and manage their settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Synchronization</CardTitle>
            <CardDescription>
              Configure how your shops sync data with the central system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync data between shops and central system
                </p>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoSync: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Input
                type="number"
                value={settings.syncInterval}
                onChange={(e) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    syncInterval: parseInt(e.target.value) || 0 
                  }))
                }
                min={5}
                max={60}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offline Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Allow shops to operate without internet connection
                </p>
              </div>
              <Switch
                checked={settings.allowOfflineMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowOfflineMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Security</CardTitle>
            <CardDescription>
              Manage location services and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Services</Label>
                <p className="text-sm text-muted-foreground">
                  Require location services for shop operations
                </p>
              </div>
              <Switch
                checked={settings.requireLocationServices}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, requireLocationServices: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Remote Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow remote access to shop systems
                </p>
              </div>
              <Switch
                checked={settings.allowRemoteAccess}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowRemoteAccess: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Configure inventory alerts and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inventory Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Enable low stock alerts for inventory items
                </p>
              </div>
              <Switch
                checked={settings.enableInventoryAlerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableInventoryAlerts: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    lowStockThreshold: parseInt(e.target.value) || 0 
                  }))
                }
                min={1}
                max={100}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>
              Configure staff tracking and attendance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Staff Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Enable staff location tracking within shops
                </p>
              </div>
              <Switch
                checked={settings.enableStaffTracking}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableStaffTracking: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Clock In/Out</Label>
                <p className="text-sm text-muted-foreground">
                  Require staff to clock in and out of shifts
                </p>
              </div>
              <Switch
                checked={settings.requireClockIn}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, requireClockIn: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <OperationButton
            onClick={handleSave}
            successMessage="Settings saved successfully"
            errorMessage="Failed to save settings"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </OperationButton>
        </div>
      </div>
    </div>
  );
}
