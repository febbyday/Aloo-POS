import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReceiptSettings } from '../types/settings.types';
import { Upload } from 'lucide-react';

interface ReceiptSettingsProps {
    settings: ReceiptSettings;
    onUpdate: (settings: ReceiptSettings) => void;
}

export function ReceiptSettingsPanel({ settings, onUpdate }: ReceiptSettingsProps) {
    const handleChange = (field: string, value: string) => {
        onUpdate({
            ...settings,
            [field]: value,
        });
    };

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
                                onUpdate({
                                    ...settings,
                                    logo: {
                                        ...settings.logo,
                                        enabled: checked,
                                    },
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
                                            onUpdate({
                                                ...settings,
                                                logo: {
                                                    ...settings.logo,
                                                    url: e.target.value,
                                                },
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
                                        onUpdate({
                                            ...settings,
                                            logo: {
                                                ...settings.logo,
                                                maxHeight: parseInt(e.target.value),
                                            },
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
                                onChange={(e) => handleChange('customText.header', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="footer">Footer Message</Label>
                            <Input
                                id="footer"
                                value={settings.customText.footer}
                                onChange={(e) => handleChange('customText.footer', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="disclaimer">Disclaimer</Label>
                            <Textarea
                                id="disclaimer"
                                value={settings.customText.disclaimer}
                                onChange={(e) => handleChange('customText.disclaimer', e.target.value)}
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
                                    onUpdate({
                                        ...settings,
                                        format: {
                                            ...settings.format,
                                            paperSize: value,
                                        },
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
                                    onUpdate({
                                        ...settings,
                                        format: {
                                            ...settings.format,
                                            fontSize: parseInt(e.target.value),
                                        },
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
                                onUpdate({
                                    ...settings,
                                    format: {
                                        ...settings.format,
                                        showBarcode: checked,
                                    },
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
                                onUpdate({
                                    ...settings,
                                    digital: {
                                        ...settings.digital,
                                        enabled: checked,
                                    },
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
                                        onUpdate({
                                            ...settings,
                                            digital: {
                                                ...settings.digital,
                                                emailCopy: checked,
                                            },
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
                                        onUpdate({
                                            ...settings,
                                            digital: {
                                                ...settings.digital,
                                                smsNotification: checked,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
