import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { SettingsService, notificationService } from '../services/notification.service';
import { NotificationSettings } from '../schemas/notification-settings.schema';

export function NotificationSettingsPanel() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error loading notification settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load notification settings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast]);

    const saveSettings = async (updatedSettings: NotificationSettings) => {
        setSaving(true);
        try {
            await SettingsService.saveSettings(updatedSettings);
            setSettings(updatedSettings);
            toast({
                title: "Settings saved",
                description: "Notification settings have been updated successfully",
            });
        } catch (error) {
            console.error("Error saving notification settings:", error);
            toast({
                title: "Error",
                description: "Failed to save notification settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSetting = <K extends keyof NotificationSettings>(
        section: K,
        value: NotificationSettings[K]
    ) => {
        if (!settings) return;

        const updatedSettings = {
            ...settings,
            [section]: value
        };

        setSettings(updatedSettings);
    };

    const handleResetSettings = async () => {
        try {
            const defaultSettings = await SettingsService.resetSettings();
            setSettings(defaultSettings);
            toast({
                title: "Settings reset",
                description: "Notification settings have been reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting notification settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset notification settings",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how and when you receive notifications</CardDescription>
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
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how and when you receive notifications</CardDescription>
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
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <Label>Email Notifications</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable Email Notifications</Label>
                                <Switch
                                    checked={settings.email.enabled}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('email', {
                                            ...settings.email,
                                            enabled: checked
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Sales Reports</Label>
                                <Switch
                                    checked={settings.email.salesReports}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('email', {
                                            ...settings.email,
                                            salesReports: checked
                                        })
                                    }
                                    disabled={!settings.email.enabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Inventory Alerts</Label>
                                <Switch
                                    checked={settings.email.inventoryAlerts}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('email', {
                                            ...settings.email,
                                            inventoryAlerts: checked
                                        })
                                    }
                                    disabled={!settings.email.enabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>System Alerts</Label>
                                <Switch
                                    checked={settings.email.systemAlerts}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('email', {
                                            ...settings.email,
                                            systemAlerts: checked
                                        })
                                    }
                                    disabled={!settings.email.enabled}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Internal Notifications</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable Internal Notifications</Label>
                                <Switch
                                    checked={settings.internal.enabled}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            enabled: checked
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Show Badge Count</Label>
                                <Switch
                                    checked={settings.internal.showBadge}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            showBadge: checked
                                        })
                                    }
                                    disabled={!settings.internal.enabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Play Sound</Label>
                                <Switch
                                    checked={settings.internal.sound}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            sound: checked
                                        })
                                    }
                                    disabled={!settings.internal.enabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Desktop Notifications</Label>
                                <Switch
                                    checked={settings.internal.desktop}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            desktop: checked
                                        })
                                    }
                                    disabled={!settings.internal.enabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Auto-mark as Read</Label>
                                <Switch
                                    checked={settings.internal.autoRead}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            autoRead: checked
                                        })
                                    }
                                    disabled={!settings.internal.enabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keep Notifications for (days)</Label>
                                <Input
                                    type="number"
                                    value={settings.internal.keepDays}
                                    onChange={(e) =>
                                        handleUpdateSetting('internal', {
                                            ...settings.internal,
                                            keepDays: parseInt(e.target.value),
                                        })
                                    }
                                    disabled={!settings.internal.enabled}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Inventory Alerts</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable Low Stock Alerts</Label>
                                <Switch
                                    checked={settings.inventoryAlerts.enabled}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('inventoryAlerts', {
                                            ...settings.inventoryAlerts,
                                            enabled: checked
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Low Stock Threshold</Label>
                                <Input
                                    type="number"
                                    value={settings.inventoryAlerts.threshold}
                                    onChange={(e) =>
                                        handleUpdateSetting('inventoryAlerts', {
                                            ...settings.inventoryAlerts,
                                            threshold: parseInt(e.target.value),
                                        })
                                    }
                                    disabled={!settings.inventoryAlerts.enabled}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Sales Milestones</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable Milestone Alerts</Label>
                                <Switch
                                    checked={settings.salesMilestones.enabled}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('salesMilestones', {
                                            ...settings.salesMilestones,
                                            enabled: checked
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Daily Goal</Label>
                                    <Input
                                        type="number"
                                        value={settings.salesMilestones.dailyGoal}
                                        onChange={(e) =>
                                            handleUpdateSetting('salesMilestones', {
                                                ...settings.salesMilestones,
                                                dailyGoal: parseInt(e.target.value),
                                            })
                                        }
                                        disabled={!settings.salesMilestones.enabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weekly Goal</Label>
                                    <Input
                                        type="number"
                                        value={settings.salesMilestones.weeklyGoal}
                                        onChange={(e) =>
                                            handleUpdateSetting('salesMilestones', {
                                                ...settings.salesMilestones,
                                                weeklyGoal: parseInt(e.target.value),
                                            })
                                        }
                                        disabled={!settings.salesMilestones.enabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Goal</Label>
                                    <Input
                                        type="number"
                                        value={settings.salesMilestones.monthlyGoal}
                                        onChange={(e) =>
                                            handleUpdateSetting('salesMilestones', {
                                                ...settings.salesMilestones,
                                                monthlyGoal: parseInt(e.target.value),
                                            })
                                        }
                                        disabled={!settings.salesMilestones.enabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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
