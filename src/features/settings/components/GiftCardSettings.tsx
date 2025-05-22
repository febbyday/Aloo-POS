import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  CreditCard, 
  RotateCcw,
  Mail,
  Printer,
  Smartphone,
  Clock,
  Hash,
  Edit
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { SettingsService } from "@/features/gift-cards/services/settingsService";
import type { GiftCardSettings } from "@/features/gift-cards/schemas/gift-card-settings.schema";

/**
 * Gift Card Settings Panel
 * Provides UI for managing gift card settings
 */
export function GiftCardSettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GiftCardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount
  useState(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading gift card settings:", error);
        toast({
          title: "Error",
          description: "Failed to load gift card settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  });

  // Save settings
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await SettingsService.saveSettings(settings);
      toast({
        title: "Success",
        description: "Gift card settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving gift card settings:", error);
      toast({
        title: "Error",
        description: "Failed to save gift card settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to defaults
  const handleReset = async () => {
    setSaving(true);
    try {
      const defaults = await SettingsService.resetSettings();
      setSettings(defaults);
      toast({
        title: "Success",
        description: "Gift card settings reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting gift card settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset gift card settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update a specific setting
  const updateSetting = <K extends keyof GiftCardSettings>(
    key: K,
    value: GiftCardSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading || !settings) {
    return (
      <div className="p-8 text-center">
        <p>Loading gift card settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gift Card Settings</h2>
          <p className="text-muted-foreground">
            Configure how gift cards work in your store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="codes">Code Format</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
              <CardDescription>
                Configure how gift cards can be delivered to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enableEmailDelivery">Email Delivery</Label>
                </div>
                <Switch 
                  id="enableEmailDelivery"
                  checked={settings.enableEmailDelivery}
                  onCheckedChange={(checked) => updateSetting('enableEmailDelivery', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Printer className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enablePrintFormat">Print Format</Label>
                </div>
                <Switch 
                  id="enablePrintFormat"
                  checked={settings.enablePrintFormat}
                  onCheckedChange={(checked) => updateSetting('enablePrintFormat', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enableDigitalWallet">Digital Wallet</Label>
                </div>
                <Switch 
                  id="enableDigitalWallet"
                  checked={settings.enableDigitalWallet}
                  onCheckedChange={(checked) => updateSetting('enableDigitalWallet', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expiration Settings</CardTitle>
              <CardDescription>
                Configure default expiration behavior for gift cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="defaultExpirationPeriod">Default Expiration Period (Days)</Label>
              </div>
              <Input 
                id="defaultExpirationPeriod"
                type="number" 
                min={0}
                value={settings.defaultExpirationPeriod}
                onChange={(e) => updateSetting('defaultExpirationPeriod', parseInt(e.target.value) || 0)}
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Number of days after issue that gift cards expire by default (0 = never expires)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Template</CardTitle>
              <CardDescription>
                Set the default template for new gift cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                id="defaultTemplate"
                value={settings.defaultTemplate}
                onChange={(e) => updateSetting('defaultTemplate', e.target.value)}
                className="max-w-xs"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                ID of the default template to use for new gift cards
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Format</CardTitle>
              <CardDescription>
                Configure how gift card codes are generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="codePrefix">Code Prefix</Label>
                  </div>
                  <Input 
                    id="codePrefix"
                    value={settings.codePrefix}
                    onChange={(e) => updateSetting('codePrefix', e.target.value)}
                    maxLength={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    Prefix added to all gift card codes (max 10 characters)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="codeLength">Code Length</Label>
                  </div>
                  <Input 
                    id="codeLength"
                    type="number" 
                    min={8}
                    max={24}
                    value={settings.codeLength}
                    onChange={(e) => updateSetting('codeLength', parseInt(e.target.value) || 16)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Length of generated gift card codes (8-24 characters)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="allowManualCodes">Allow Manual Codes</Label>
                </div>
                <Switch 
                  id="allowManualCodes"
                  checked={settings.allowManualCodes}
                  onCheckedChange={(checked) => updateSetting('allowManualCodes', checked)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Allow staff to manually enter gift card codes instead of auto-generating them
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
