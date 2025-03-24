import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BackupSettings } from '../types/settings.types';

interface BackupSettingsProps {
    settings: BackupSettings;
    onUpdate: (settings: BackupSettings) => void;
}

export function BackupSettingsPanel({ settings, onUpdate }: BackupSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Backup & Data Export</CardTitle>
                <CardDescription>Configure automated backups and data export options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <Label>Automated Backup</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable Automated Backup</Label>
                                <Switch
                                    checked={settings.automated.enabled}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            automated: { ...settings.automated, enabled: checked },
                                        })
                                    }
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Backup Frequency</Label>
                                    <Select
                                        value={settings.automated.frequency}
                                        onValueChange={(value: any) =>
                                            onUpdate({
                                                ...settings,
                                                automated: { ...settings.automated, frequency: value },
                                            })
                                        }
                                        disabled={!settings.automated.enabled}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Backup Time</Label>
                                    <Input
                                        type="time"
                                        value={settings.automated.time}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...settings,
                                                automated: { ...settings.automated, time: e.target.value },
                                            })
                                        }
                                        disabled={!settings.automated.enabled}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Retention Period (days)</Label>
                                <Input
                                    type="number"
                                    value={settings.automated.retentionDays}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...settings,
                                            automated: {
                                                ...settings.automated,
                                                retentionDays: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                    disabled={!settings.automated.enabled}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Data Export Options</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Export Format</Label>
                                <div className="space-x-2">
                                    <Button
                                        variant={settings.export.format.includes('csv') ? "default" : "outline"}
                                        onClick={() => {
                                            const newFormat = settings.export.format.includes('csv')
                                                ? settings.export.format.filter(f => f !== 'csv')
                                                : [...settings.export.format, 'csv'];
                                            onUpdate({
                                                ...settings,
                                                export: { ...settings.export, format: newFormat },
                                            });
                                        }}
                                    >
                                        CSV
                                    </Button>
                                    <Button
                                        variant={settings.export.format.includes('pdf') ? "default" : "outline"}
                                        onClick={() => {
                                            const newFormat = settings.export.format.includes('pdf')
                                                ? settings.export.format.filter(f => f !== 'pdf')
                                                : [...settings.export.format, 'pdf'];
                                            onUpdate({
                                                ...settings,
                                                export: { ...settings.export, format: newFormat },
                                            });
                                        }}
                                    >
                                        PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Include Images</Label>
                                <Switch
                                    checked={settings.export.includeImages}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            export: { ...settings.export, includeImages: checked },
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Enable Compression</Label>
                                <Switch
                                    checked={settings.export.compression}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            export: { ...settings.export, compression: checked },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Export Data Now</Button>
                </div>
            </CardContent>
        </Card>
    );
}
