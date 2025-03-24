import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppearanceSettings } from '../types/settings.types';

interface AppearanceSettingsProps {
    settings: AppearanceSettings;
    onUpdate: (settings: AppearanceSettings) => void;
}

export function AppearanceSettingsPanel({ settings, onUpdate }: AppearanceSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your POS system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Theme Mode</Label>
                            <Select
                                value={settings.theme}
                                onValueChange={(value: any) =>
                                    onUpdate({ ...settings, theme: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Layout Density</Label>
                            <Select
                                value={settings.density}
                                onValueChange={(value: any) =>
                                    onUpdate({ ...settings, density: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select density" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                    <SelectItem value="compact">Compact</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Select
                            value={settings.fontSize}
                            onValueChange={(value: any) =>
                                onUpdate({ ...settings, fontSize: value })
                            }
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

                    <Separator />

                    <div className="space-y-4">
                        <Label>Quick Actions Visibility</Label>
                        <div className="space-y-2">
                            {Object.entries(settings.quickActions).map(([action, enabled]) => (
                                <div key={action} className="flex items-center justify-between">
                                    <Label className="capitalize">{action.replace(/_/g, ' ')}</Label>
                                    <Switch
                                        checked={enabled}
                                        onCheckedChange={(checked) =>
                                            onUpdate({
                                                ...settings,
                                                quickActions: {
                                                    ...settings.quickActions,
                                                    [action]: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
