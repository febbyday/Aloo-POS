import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SecuritySettings } from '../types/settings.types';

interface SecuritySettingsProps {
    settings: SecuritySettings;
    onUpdate: (settings: SecuritySettings) => void;
}

export function SecuritySettingsPanel({ settings, onUpdate }: SecuritySettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security policies and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <Label>Password Policy</Label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Minimum Length</Label>
                                    <Input
                                        type="number"
                                        value={settings.password.minLength}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...settings,
                                                password: {
                                                    ...settings.password,
                                                    minLength: parseInt(e.target.value),
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password Expiry (days)</Label>
                                    <Input
                                        type="number"
                                        value={settings.password.expiryDays}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...settings,
                                                password: {
                                                    ...settings.password,
                                                    expiryDays: parseInt(e.target.value),
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Require Special Character</Label>
                                    <Switch
                                        checked={settings.password.requireSpecialChar}
                                        onCheckedChange={(checked) =>
                                            onUpdate({
                                                ...settings,
                                                password: {
                                                    ...settings.password,
                                                    requireSpecialChar: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Require Number</Label>
                                    <Switch
                                        checked={settings.password.requireNumber}
                                        onCheckedChange={(checked) =>
                                            onUpdate({
                                                ...settings,
                                                password: {
                                                    ...settings.password,
                                                    requireNumber: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Require Uppercase</Label>
                                    <Switch
                                        checked={settings.password.requireUppercase}
                                        onCheckedChange={(checked) =>
                                            onUpdate({
                                                ...settings,
                                                password: {
                                                    ...settings.password,
                                                    requireUppercase: checked,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Two-Factor Authentication</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Enable 2FA</Label>
                                <Switch
                                    checked={settings.twoFactor.enabled}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            twoFactor: { ...settings.twoFactor, enabled: checked },
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>2FA Method</Label>
                                <Select
                                    value={settings.twoFactor.method}
                                    onValueChange={(value: any) =>
                                        onUpdate({
                                            ...settings,
                                            twoFactor: { ...settings.twoFactor, method: value },
                                        })
                                    }
                                    disabled={!settings.twoFactor.enabled}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select 2FA method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="authenticator">Authenticator App</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label>Session Settings</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Session Timeout (minutes)</Label>
                                <Input
                                    type="number"
                                    value={settings.session.timeout}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...settings,
                                            session: {
                                                ...settings.session,
                                                timeout: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Login Attempts</Label>
                                <Input
                                    type="number"
                                    value={settings.session.maxAttempts}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...settings,
                                            session: {
                                                ...settings.session,
                                                maxAttempts: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lockout Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={settings.session.lockoutDuration}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...settings,
                                            session: {
                                                ...settings.session,
                                                lockoutDuration: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
