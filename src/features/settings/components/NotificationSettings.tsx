import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationSettings } from '../types/settings.types';

interface NotificationSettingsProps {
    settings: NotificationSettings;
    onUpdate: (settings: NotificationSettings) => void;
}

export function NotificationSettingsPanel({ settings, onUpdate }: NotificationSettingsProps) {
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
                                        onUpdate({
                                            ...settings,
                                            email: { ...settings.email, enabled: checked },
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Sales Reports</Label>
                                <Switch
                                    checked={settings.email.salesReports}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            email: { ...settings.email, salesReports: checked },
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
                                        onUpdate({
                                            ...settings,
                                            email: { ...settings.email, inventoryAlerts: checked },
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
                                        onUpdate({
                                            ...settings,
                                            email: { ...settings.email, systemAlerts: checked },
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
                                        onUpdate({
                                            ...settings,
                                            internal: { ...settings.internal, enabled: checked },
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Show Badge Count</Label>
                                <Switch
                                    checked={settings.internal.showBadge}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            internal: { ...settings.internal, showBadge: checked },
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
                                        onUpdate({
                                            ...settings,
                                            internal: { ...settings.internal, sound: checked },
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
                                        onUpdate({
                                            ...settings,
                                            internal: { ...settings.internal, desktop: checked },
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
                                        onUpdate({
                                            ...settings,
                                            internal: { ...settings.internal, autoRead: checked },
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
                                        onUpdate({
                                            ...settings,
                                            internal: {
                                                ...settings.internal,
                                                keepDays: parseInt(e.target.value),
                                            },
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
                                        onUpdate({
                                            ...settings,
                                            inventoryAlerts: { ...settings.inventoryAlerts, enabled: checked },
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
                                        onUpdate({
                                            ...settings,
                                            inventoryAlerts: {
                                                ...settings.inventoryAlerts,
                                                threshold: parseInt(e.target.value),
                                            },
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
                                        onUpdate({
                                            ...settings,
                                            salesMilestones: { ...settings.salesMilestones, enabled: checked },
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
                                            onUpdate({
                                                ...settings,
                                                salesMilestones: {
                                                    ...settings.salesMilestones,
                                                    dailyGoal: parseInt(e.target.value),
                                                },
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
                                            onUpdate({
                                                ...settings,
                                                salesMilestones: {
                                                    ...settings.salesMilestones,
                                                    weeklyGoal: parseInt(e.target.value),
                                                },
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
                                            onUpdate({
                                                ...settings,
                                                salesMilestones: {
                                                    ...settings.salesMilestones,
                                                    monthlyGoal: parseInt(e.target.value),
                                                },
                                            })
                                        }
                                        disabled={!settings.salesMilestones.enabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
