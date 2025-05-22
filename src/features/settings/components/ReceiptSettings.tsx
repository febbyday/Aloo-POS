import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { SettingsService } from '../services/receipt.service';
import { ReceiptSettings } from '../schemas/receipt-settings.schema';

export function ReceiptSettingsPanel() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<ReceiptSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error loading receipt settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load receipt settings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast]);

    const saveSettings = async (updatedSettings: ReceiptSettings) => {
        setSaving(true);
        try {
            await SettingsService.saveSettings(updatedSettings);
            setSettings(updatedSettings);
            toast({
                title: "Settings saved",
                description: "Receipt settings have been updated successfully",
            });
        } catch (error) {
            console.error("Error saving receipt settings:", error);
            toast({
                title: "Error",
                description: "Failed to save receipt settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSetting = <K extends keyof ReceiptSettings>(
        section: K,
        value: ReceiptSettings[K]
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
                description: "Receipt settings have been reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting receipt settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset receipt settings",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Receipt Customization</CardTitle>
                    <CardDescription>Customize how your receipts look and are delivered to customers</CardDescription>
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
                    <CardTitle>Receipt Customization</CardTitle>
                    <CardDescription>Customize how your receipts look and are delivered to customers</CardDescription>
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
                <CardTitle>Receipt Customization</CardTitle>
                <CardDescription>Customize how your receipts look and are delivered to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Logo Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Store Logo</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="logo-enabled">Show logo on receipts</Label>
                        <Switch
                            id="logo-enabled"
                            checked={settings.logo.enabled}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('logo', {
                                    ...settings.logo,
                                    enabled: checked,
                                })
                            }
                        />
                    </div>

                    {settings.logo.enabled && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="logo-url">Logo URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="logo-url"
                                        value={settings.logo.url}
                                        onChange={(e) =>
                                            handleUpdateSetting('logo', {
                                                ...settings.logo,
                                                url: e.target.value,
                                            })
                                        }
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <Button variant="outline" size="icon">
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo-height">Maximum height (px)</Label>
                                <Input
                                    id="logo-height"
                                    type="number"
                                    value={settings.logo.maxHeight}
                                    onChange={(e) =>
                                        handleUpdateSetting('logo', {
                                            ...settings.logo,
                                            maxHeight: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Custom Text */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Custom Text</h3>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="header">Header Message</Label>
                            <Input
                                id="header"
                                value={settings.customText.header}
                                onChange={(e) => handleUpdateSetting('customText', {
                                ...settings.customText,
                                header: e.target.value
                            })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="footer">Footer Message</Label>
                            <Input
                                id="footer"
                                value={settings.customText.footer}
                                onChange={(e) => handleUpdateSetting('customText', {
                                ...settings.customText,
                                footer: e.target.value
                            })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="disclaimer">Disclaimer</Label>
                            <Textarea
                                id="disclaimer"
                                value={settings.customText.disclaimer}
                                onChange={(e) => handleUpdateSetting('customText', {
                                ...settings.customText,
                                disclaimer: e.target.value
                            })}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Format Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Receipt Format</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paper-size">Paper Size</Label>
                            <Select
                                value={settings.format.paperSize}
                                onValueChange={(value: any) =>
                                    handleUpdateSetting('format', {
                                        ...settings.format,
                                        paperSize: value,
                                    })
                                }
                            >
                                <SelectTrigger id="paper-size">
                                    <SelectValue placeholder="Select paper size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A4">A4</SelectItem>
                                    <SelectItem value="80mm">80mm Thermal</SelectItem>
                                    <SelectItem value="58mm">58mm Thermal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="font-size">Font Size</Label>
                            <Input
                                id="font-size"
                                type="number"
                                value={settings.format.fontSize}
                                onChange={(e) =>
                                    handleUpdateSetting('format', {
                                        ...settings.format,
                                        fontSize: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="show-barcode">Show barcode on receipt</Label>
                        <Switch
                            id="show-barcode"
                            checked={settings.format.showBarcode}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('format', {
                                    ...settings.format,
                                    showBarcode: checked,
                                })
                            }
                        />
                    </div>
                </div>

                <Separator />

                {/* Digital Receipt Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Digital Receipts</h3>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="digital-enabled">Enable digital receipts</Label>
                        <Switch
                            id="digital-enabled"
                            checked={settings.digital.enabled}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('digital', {
                                    ...settings.digital,
                                    enabled: checked,
                                })
                            }
                        />
                    </div>

                    {settings.digital.enabled && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-copy">Send email copy</Label>
                                <Switch
                                    id="email-copy"
                                    checked={settings.digital.emailCopy}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('digital', {
                                            ...settings.digital,
                                            emailCopy: checked,
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="sms-notification">Send SMS notification</Label>
                                <Switch
                                    id="sms-notification"
                                    checked={settings.digital.smsNotification}
                                    onCheckedChange={(checked) =>
                                        handleUpdateSetting('digital', {
                                            ...settings.digital,
                                            smsNotification: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
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
