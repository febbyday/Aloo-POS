import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, RotateCcw, Shield } from "lucide-react";
import { SettingsService } from '../services/security.service';
import { SecuritySettings } from '../schemas/security-settings.schema';

export function SecuritySettingsPanel() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error loading security settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load security settings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast]);

    // Save settings
    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            await SettingsService.saveSettings(settings);
            toast({
                title: "Success",
                description: "Security settings saved successfully",
            });
        } catch (error) {
            console.error("Error saving security settings:", error);
            toast({
                title: "Error",
                description: "Failed to save security settings",
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
                description: "Security settings reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting security settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset security settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Update a nested setting
    const updateNestedSetting = <K extends keyof SecuritySettings, N extends keyof SecuritySettings[K]>(
        key: K,
        nestedKey: N,
        value: SecuritySettings[K][N]
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

    if (loading || !settings) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading security settings...</span>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
                    <p className="text-muted-foreground">
                        Configure security policies and authentication settings
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
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Password Policy</CardTitle>
                    <CardDescription>Configure password requirements and expiration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Minimum Length</Label>
                            <Input
                                type="number"
                                min={6}
                                max={100}
                                value={settings.password.minLength}
                                onChange={(e) =>
                                    updateNestedSetting(
                                        'password',
                                        'minLength',
                                        parseInt(e.target.value) || 8
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password Expiry (days)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={settings.password.expiryDays}
                                onChange={(e) =>
                                    updateNestedSetting(
                                        'password',
                                        'expiryDays',
                                        parseInt(e.target.value) || 90
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Set to 0 for no expiration
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Require Special Character</Label>
                            <Switch
                                checked={settings.password.requireSpecialChar}
                                onCheckedChange={(checked) =>
                                    updateNestedSetting('password', 'requireSpecialChar', checked)
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Require Number</Label>
                            <Switch
                                checked={settings.password.requireNumber}
                                onCheckedChange={(checked) =>
                                    updateNestedSetting('password', 'requireNumber', checked)
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Require Uppercase</Label>
                            <Switch
                                checked={settings.password.requireUppercase}
                                onCheckedChange={(checked) =>
                                    updateNestedSetting('password', 'requireUppercase', checked)
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Configure additional authentication security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Enable 2FA</Label>
                        <Switch
                            checked={settings.twoFactor.enabled}
                            onCheckedChange={(checked) =>
                                updateNestedSetting('twoFactor', 'enabled', checked)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>2FA Method</Label>
                        <Select
                            value={settings.twoFactor.method}
                            onValueChange={(value) =>
                                updateNestedSetting('twoFactor', 'method', value as 'email' | 'authenticator' | 'sms')
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                    <CardDescription>Configure user session behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Session Timeout (minutes)</Label>
                            <Input
                                type="number"
                                min={1}
                                value={settings.session.timeout}
                                onChange={(e) =>
                                    updateNestedSetting(
                                        'session',
                                        'timeout',
                                        parseInt(e.target.value) || 30
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Login Attempts</Label>
                            <Input
                                type="number"
                                min={1}
                                value={settings.session.maxAttempts}
                                onChange={(e) =>
                                    updateNestedSetting(
                                        'session',
                                        'maxAttempts',
                                        parseInt(e.target.value) || 5
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Lockout Duration (minutes)</Label>
                        <Input
                            type="number"
                            min={1}
                            value={settings.session.lockoutDuration}
                            onChange={(e) =>
                                updateNestedSetting(
                                    'session',
                                    'lockoutDuration',
                                    parseInt(e.target.value) || 15
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>IP Restrictions</CardTitle>
                    <CardDescription>Restrict access to specific IP addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Enable IP Restrictions</Label>
                        <Switch
                            checked={settings.ipRestriction.enabled}
                            onCheckedChange={(checked) =>
                                updateNestedSetting('ipRestriction', 'enabled', checked)
                            }
                        />
                    </div>
                    {settings.ipRestriction.enabled && (
                        <div className="space-y-2">
                            <Label>Allowed IP Addresses</Label>
                            <div className="space-y-2">
                                {settings.ipRestriction.allowedIps.map((ip, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={ip}
                                            onChange={(e) => {
                                                const newIps = [...settings.ipRestriction.allowedIps];
                                                newIps[index] = e.target.value;
                                                updateNestedSetting('ipRestriction', 'allowedIps', newIps);
                                            }}
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const newIps = [...settings.ipRestriction.allowedIps];
                                                newIps.splice(index, 1);
                                                updateNestedSetting('ipRestriction', 'allowedIps', newIps);
                                            }}
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        updateNestedSetting(
                                            'ipRestriction',
                                            'allowedIps',
                                            [...settings.ipRestriction.allowedIps, '']
                                        );
                                    }}
                                >
                                    Add IP Address
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
