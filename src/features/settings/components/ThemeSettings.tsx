/**
 * Theme Settings Component
 *
 * This component provides a user interface for changing theme settings
 * in the application settings page.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Laptop, Clock, Save, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast';
import { SettingsService } from '../services/theme.service';
import { ThemeSettings as ThemeSettingsType } from '../schemas/theme-settings.schema';

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);

        // Sync with theme provider
        setTheme(data.theme);
      } catch (error) {
        console.error("Error loading theme settings:", error);
        toast({
          title: "Error",
          description: "Failed to load theme settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast, setTheme]);

  const saveSettings = async (updatedSettings: ThemeSettingsType) => {
    setSaving(true);
    try {
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast({
        title: "Settings saved",
        description: "Theme settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast({
        title: "Error",
        description: "Failed to save theme settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSetting = <K extends keyof ThemeSettingsType>(
    key: K,
    value: ThemeSettingsType[K]
  ) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      [key]: value
    };

    setSettings(updatedSettings);

    // For theme, we want to update the theme provider immediately
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
  };

  const handleResetSettings = async () => {
    try {
      const defaultSettings = await SettingsService.resetSettings();
      setSettings(defaultSettings);
      setTheme(defaultSettings.theme);
      toast({
        title: "Settings reset",
        description: "Theme settings have been reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting theme settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset theme settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Failed to load settings. Please try again.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Mode Selection */}
        <div className="space-y-3">
          <Label>Theme Mode</Label>
          <RadioGroup
            value={settings.theme}
            onValueChange={(value) => handleUpdateSetting('theme', value as 'light' | 'dark' | 'system')}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="theme-light"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="dark"
                id="theme-dark"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="system"
                id="theme-system"
                className="peer sr-only"
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </div>
          </RadioGroup>

          <p className="text-sm text-muted-foreground">
            {settings.theme === 'system' ? (
              <>Your system is currently using <strong>{resolvedTheme}</strong> mode.</>
            ) : (
              <>You are currently using <strong>{settings.theme}</strong> mode.</>
            )}
          </p>
        </div>

        {/* Theme Animation Settings */}
        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-0.5">
            <Label>Reduce animations</Label>
            <p className="text-sm text-muted-foreground">
              Disable animations for a simpler experience
            </p>
          </div>
          <Switch
            id="reduce-animations"
            checked={!settings.animation.enabled || settings.animation.reducedMotion}
            onCheckedChange={(checked) => {
              document.documentElement.classList.toggle('reduce-animations', checked);
              handleUpdateSetting('animation', {
                ...settings.animation,
                reducedMotion: checked,
              });
            }}
          />
        </div>

        {/* Theme Transition Settings */}
        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-0.5">
            <Label>Smooth theme transitions</Label>
            <p className="text-sm text-muted-foreground">
              Enable smooth transitions when changing themes
            </p>
          </div>
          <Switch
            id="theme-transitions"
            checked={settings.animation.enabled}
            onCheckedChange={(checked) => {
              document.documentElement.classList.toggle('no-theme-transition', !checked);
              handleUpdateSetting('animation', {
                ...settings.animation,
                enabled: checked,
              });
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleResetSettings}
          disabled={loading || saving}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={() => saveSettings(settings)}
          disabled={loading || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
