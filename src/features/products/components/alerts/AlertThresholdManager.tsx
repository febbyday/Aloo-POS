import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ThresholdSettings {
  warningThreshold: number;
  criticalThreshold: number;
  reorderPoint: number;
  maxStock: number;
  enableAutomaticReorder: boolean;
  reorderQuantity: number;
}

interface AlertThresholdManagerProps {
  productId: string;
  currentStock: number;
  initialSettings?: Partial<ThresholdSettings>;
  onSave: (settings: ThresholdSettings) => Promise<void>;
}

export const AlertThresholdManager: React.FC<AlertThresholdManagerProps> = ({
  productId,
  currentStock,
  initialSettings = {},
  onSave,
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ThresholdSettings>({
    warningThreshold: initialSettings.warningThreshold || 10,
    criticalThreshold: initialSettings.criticalThreshold || 5,
    reorderPoint: initialSettings.reorderPoint || 8,
    maxStock: initialSettings.maxStock || 100,
    enableAutomaticReorder: initialSettings.enableAutomaticReorder || false,
    reorderQuantity: initialSettings.reorderQuantity || 20,
  });

  // Validate thresholds to ensure they make sense
  useEffect(() => {
    if (settings.criticalThreshold > settings.warningThreshold) {
      setSettings(prev => ({
        ...prev,
        criticalThreshold: prev.warningThreshold
      }));
    }

    if (settings.reorderPoint > settings.warningThreshold) {
      setSettings(prev => ({
        ...prev,
        reorderPoint: prev.warningThreshold
      }));
    }
  }, [settings.warningThreshold, settings.criticalThreshold, settings.reorderPoint]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(settings);
      toast({
        title: "Thresholds Updated",
        description: "Stock alert thresholds have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update thresholds:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update stock alert thresholds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStockStatus = () => {
    if (currentStock <= settings.criticalThreshold) {
      return { status: 'critical', icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: 'text-red-500' };
    } else if (currentStock <= settings.warningThreshold) {
      return { status: 'warning', icon: <AlertCircle className="h-5 w-5 text-amber-500" />, color: 'text-amber-500' };
    } else {
      return { status: 'normal', icon: <Info className="h-5 w-5 text-green-500" />, color: 'text-green-500' };
    }
  };

  const { status, icon, color } = getStockStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Alert Thresholds</CardTitle>
          <div className={`flex items-center ${color}`}>
            {icon}
            <span className="ml-2 capitalize">{status}</span>
          </div>
        </div>
        <CardDescription>
          Configure when to receive alerts for low stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="thresholds">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="thresholds" className="space-y-6 pt-4">
            <div className="space-y-4">
              {/* Current Stock Indicator */}
              <div className="flex items-center justify-between mb-6">
                <Label>Current Stock</Label>
                <div className="bg-muted px-3 py-1 rounded-md font-medium">
                  {currentStock} units
                </div>
              </div>

              {/* Warning Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="warning-threshold">Warning Threshold</Label>
                  <Input
                    id="warning-threshold"
                    type="number"
                    className="w-20 text-right"
                    value={settings.warningThreshold}
                    onChange={(e) => setSettings({ ...settings, warningThreshold: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <Slider
                  value={[settings.warningThreshold]}
                  max={settings.maxStock}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, warningThreshold: value[0] })}
                  className="py-2"
                />
                <p className="text-sm text-muted-foreground">
                  Receive a warning when stock falls below this level
                </p>
              </div>

              {/* Critical Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-threshold">Critical Threshold</Label>
                  <Input
                    id="critical-threshold"
                    type="number"
                    className="w-20 text-right"
                    value={settings.criticalThreshold}
                    onChange={(e) => setSettings({ ...settings, criticalThreshold: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={settings.warningThreshold}
                  />
                </div>
                <Slider
                  value={[settings.criticalThreshold]}
                  max={settings.warningThreshold}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, criticalThreshold: value[0] })}
                  className="py-2"
                />
                <p className="text-sm text-muted-foreground">
                  Receive a critical alert when stock falls below this level
                </p>
              </div>

              {/* Max Stock */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-stock">Maximum Stock</Label>
                  <Input
                    id="max-stock"
                    type="number"
                    className="w-20 text-right"
                    value={settings.maxStock}
                    onChange={(e) => setSettings({ ...settings, maxStock: parseInt(e.target.value) || 0 })}
                    min={settings.warningThreshold}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The maximum stock level for this product
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reorder" className="space-y-6 pt-4">
            <div className="space-y-4">
              {/* Reorder Point */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reorder-point">Reorder Point</Label>
                  <Input
                    id="reorder-point"
                    type="number"
                    className="w-20 text-right"
                    value={settings.reorderPoint}
                    onChange={(e) => setSettings({ ...settings, reorderPoint: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={settings.warningThreshold}
                  />
                </div>
                <Slider
                  value={[settings.reorderPoint]}
                  max={settings.warningThreshold}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, reorderPoint: value[0] })}
                  className="py-2"
                />
                <p className="text-sm text-muted-foreground">
                  The stock level at which to reorder this product
                </p>
              </div>

              {/* Reorder Quantity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reorder-quantity">Reorder Quantity</Label>
                  <Input
                    id="reorder-quantity"
                    type="number"
                    className="w-20 text-right"
                    value={settings.reorderQuantity}
                    onChange={(e) => setSettings({ ...settings, reorderQuantity: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The quantity to order when stock reaches the reorder point
                </p>
              </div>

              {/* Automatic Reorder */}
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="auto-reorder"
                  checked={settings.enableAutomaticReorder}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableAutomaticReorder: checked })}
                />
                <Label htmlFor="auto-reorder">Enable automatic reorder</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically create purchase orders when stock reaches the reorder point
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Thresholds'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertThresholdManager;
