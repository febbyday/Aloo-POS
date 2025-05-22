import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Save, RotateCcw, Sun, Moon, Laptop } from "lucide-react";
import { SettingsService } from '../services/appearance.service';
import { AppearanceSettings } from '../schemas/appearance-settings.schema';
import ThemeSettingsService from '../services/theme.service';
import { ThemeSettings as ThemeSettingsType } from '../schemas/theme-settings.schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SettingsLoadingIndicator, SettingsFullPageLoading } from './SettingsLoadingIndicator';

export function AppearanceSettingsPanel() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { toast } = useToast();
    const [settings, setSettings] = useState<AppearanceSettings | null>(null);
    const [themeSettings, setThemeSettings] = useState<ThemeSettingsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load settings on component mount with optimized loading
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Start loading both settings in parallel
                const appearancePromise = SettingsService.getSettings();
                const themePromise = ThemeSettingsService.getSettings();

                // Try to load appearance settings first
                const appearanceData = await appearancePromise;
                setSettings(appearanceData);

                // Then try to load theme settings
                const themeData = await themePromise;
                setThemeSettings(themeData);

                // Sync with theme provider
                setTheme(themeData.theme);

                // Mark loading as complete
                setLoading(false);
            } catch (error) {
                console.error("Error loading settings:", error);

                // Fallback to hardcoded defaults if loading fails
                const hardcodedAppearanceDefaults: AppearanceSettings = {
                    theme: 'system',
                    accentColor: '#0284c7',
                    fontSize: 'medium',
                    borderRadius: 'medium',
                    animation: {
                        enabled: true,
                        reducedMotion: false,
                    },
                    layout: {
                        sidebarCollapsed: false,
                        contentWidth: 'contained',
                        menuPosition: 'side',
                        compactMode: false,
                    },
                    cards: {
                        shadow: 'medium',
                        hover: true,
                    },
                    tables: {
                        striped: true,
                        compact: false,
                        bordered: false,
                    },
                };

                const hardcodedThemeDefaults: ThemeSettingsType = {
                    theme: 'system',
                    accentColor: '#0284c7',
                    fontSize: 'medium',
                    borderRadius: 'medium',
                    animation: {
                        enabled: true,
                        reducedMotion: false,
                    },
                    layout: {
                        sidebarCollapsed: false,
                        contentWidth: 'contained',
                        menuPosition: 'side',
                        compactMode: false,
                    },
                    cards: {
                        shadow: 'medium',
                        hover: true,
                    },
                    tables: {
                        striped: true,
                        compact: false,
                        bordered: false,
                    },
                };

                setSettings(hardcodedAppearanceDefaults);
                setThemeSettings(hardcodedThemeDefaults);

                toast({
                    title: "Warning",
                    description: "Using default settings due to loading error",
                    variant: "warning",
                });

                // Mark loading as complete even if there was an error
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast, setTheme]);

    // Save settings
    const handleSave = async () => {
        if (!settings || !themeSettings) return;

        setSaving(true);
        try {
            await Promise.all([
                SettingsService.saveSettings(settings),
                ThemeSettingsService.saveSettings(themeSettings)
            ]);

            toast({
                title: "Success",
                description: "Appearance and theme settings saved successfully",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: "Failed to save settings",
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
            const [appearanceDefaults, themeDefaults] = await Promise.all([
                SettingsService.resetSettings(),
                ThemeSettingsService.resetSettings()
            ]);

            setSettings(appearanceDefaults);
            setThemeSettings(themeDefaults);
            setTheme(themeDefaults.theme);

            toast({
                title: "Success",
                description: "Settings reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Update a specific appearance setting
    const updateSetting = <K extends keyof AppearanceSettings>(
        key: K,
        value: AppearanceSettings[K]
    ) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    };

    // Update a nested appearance setting
    const updateNestedSetting = <K extends keyof AppearanceSettings, N extends keyof AppearanceSettings[K]>(
        key: K,
        nestedKey: N,
        value: AppearanceSettings[K][N]
    ) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [key]: {
                ...settings[key],
                [nestedKey]: value
            }
        });
    };

    // Update a theme setting
    const updateThemeSetting = <K extends keyof ThemeSettingsType>(
        key: K,
        value: ThemeSettingsType[K]
    ) => {
        if (!themeSettings) return;

        const updatedSettings = {
            ...themeSettings,
            [key]: value
        };

        setThemeSettings(updatedSettings);

        // For theme, we want to update the theme provider immediately
        if (key === 'theme') {
            setTheme(value as 'light' | 'dark' | 'system');
        }
    };

    // Update theme animation settings
    const updateThemeAnimation = (key: keyof ThemeSettingsType['animation'], value: boolean) => {
        if (!themeSettings) return;

        // Apply DOM changes safely
        try {
            if (key === 'reducedMotion') {
                document.documentElement.classList.toggle('reduce-animations', value);
            } else if (key === 'enabled') {
                document.documentElement.classList.toggle('no-theme-transition', !value);
            }
        } catch (error) {
            console.error(`Error updating DOM for animation setting ${key}:`, error);
        }

        setThemeSettings({
            ...themeSettings,
            animation: {
                ...themeSettings.animation,
                [key]: value
            }
        });
    };

    // Show loading indicator if we're still loading
    if (loading || !settings || !themeSettings) {
        return <SettingsFullPageLoading />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appearance & Theme Settings</h2>
                    <p className="text-muted-foreground">
                        Customize the look and feel of your POS system
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
                        {saving ? (
                            <SettingsLoadingIndicator
                                loading={true}
                                text="Saving..."
                                size="sm"
                            />
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Theme Mode</CardTitle>
                    <CardDescription>Choose your preferred color theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <RadioGroup
                            value={themeSettings.theme}
                            onValueChange={(value) => updateThemeSetting('theme', value as 'light' | 'dark' | 'system')}
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
                            {themeSettings.theme === 'system' ? (
                                <>Your system is currently using <strong>{resolvedTheme}</strong> mode.</>
                            ) : (
                                <>You are currently using <strong>{themeSettings.theme}</strong> mode.</>
                            )}
                        </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                            <Label>Reduce animations</Label>
                            <p className="text-sm text-muted-foreground">
                                Disable animations for a simpler experience
                            </p>
                        </div>
                        <Switch
                            id="reduce-animations"
                            checked={!themeSettings.animation.enabled || themeSettings.animation.reducedMotion}
                            onCheckedChange={(checked) => {
                                updateThemeAnimation('reducedMotion', checked);
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                            <Label>Smooth theme transitions</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable smooth transitions when changing themes
                            </p>
                        </div>
                        <Switch
                            id="theme-transitions"
                            checked={themeSettings.animation.enabled}
                            onCheckedChange={(checked) => {
                                updateThemeAnimation('enabled', checked);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visual Customization</CardTitle>
                    <CardDescription>Adjust the visual appearance of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Select
                                value={settings.fontSize}
                                onValueChange={(value) => updateSetting('fontSize', value as 'small' | 'medium' | 'large')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select font size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Border Radius</Label>
                            <Select
                                value={settings.borderRadius}
                                onValueChange={(value) => updateSetting('borderRadius', value as 'none' | 'small' | 'medium' | 'large')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select border radius" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-6 w-6 rounded-full border"
                                style={{ backgroundColor: settings.accentColor }}
                            />
                            <input
                                type="color"
                                value={settings.accentColor}
                                onChange={(e) => updateSetting('accentColor', e.target.value)}
                                className="h-10 w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                    <CardDescription>Configure the layout of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Sidebar Collapsed by Default</Label>
                        <Switch
                            checked={settings.layout.sidebarCollapsed}
                            onCheckedChange={(checked) => updateNestedSetting('layout', 'sidebarCollapsed', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Compact Mode</Label>
                        <Switch
                            checked={settings.layout.compactMode}
                            onCheckedChange={(checked) => updateNestedSetting('layout', 'compactMode', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content Width</Label>
                        <Select
                            value={settings.layout.contentWidth}
                            onValueChange={(value) => updateNestedSetting('layout', 'contentWidth', value as 'full' | 'contained')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select content width" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">Full Width</SelectItem>
                                <SelectItem value="contained">Contained</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Menu Position</Label>
                        <Select
                            value={settings.layout.menuPosition}
                            onValueChange={(value) => updateNestedSetting('layout', 'menuPosition', value as 'top' | 'side')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select menu position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="side">Side</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Animation Settings</CardTitle>
                    <CardDescription>Configure animation behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Enable Animations</Label>
                        <Switch
                            checked={settings.animation.enabled}
                            onCheckedChange={(checked) => updateNestedSetting('animation', 'enabled', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Reduced Motion</Label>
                        <Switch
                            checked={settings.animation.reducedMotion}
                            onCheckedChange={(checked) => updateNestedSetting('animation', 'reducedMotion', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Component Styles</CardTitle>
                    <CardDescription>Configure the appearance of UI components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Cards</h3>
                        <div className="space-y-2">
                            <Label>Card Shadow</Label>
                            <Select
                                value={settings.cards.shadow}
                                onValueChange={(value) => updateNestedSetting('cards', 'shadow', value as 'none' | 'small' | 'medium' | 'large')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shadow size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Card Hover Effect</Label>
                            <Switch
                                checked={settings.cards.hover}
                                onCheckedChange={(checked) => updateNestedSetting('cards', 'hover', checked)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Tables</h3>
                        <div className="flex items-center justify-between">
                            <Label>Striped Tables</Label>
                            <Switch
                                checked={settings.tables.striped}
                                onCheckedChange={(checked) => updateNestedSetting('tables', 'striped', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Compact Tables</Label>
                            <Switch
                                checked={settings.tables.compact}
                                onCheckedChange={(checked) => updateNestedSetting('tables', 'compact', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Bordered Tables</Label>
                            <Switch
                                checked={settings.tables.bordered}
                                onCheckedChange={(checked) => updateNestedSetting('tables', 'bordered', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
