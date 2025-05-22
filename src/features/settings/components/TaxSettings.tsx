import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Percent, CheckCircle2, Tag, BadgePercent, DollarSign, Star, CheckSquare, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { SettingsService } from '../services/tax.service';
import { TaxSettings } from '../schemas/tax-settings.schema';

const taxRateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tax name is required"),
    rate: z.number().min(0, "Rate must be a positive number"),
    isDefault: z.boolean().default(false)
});

type TaxRateFormValues = z.infer<typeof taxRateSchema>;

export function TaxSettingsPanel() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<TaxSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddingTaxRate, setIsAddingTaxRate] = useState(false);
    const [editingTaxRate, setEditingTaxRate] = useState<string | null>(null);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error loading tax settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load tax settings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast]);

    const form = useForm<TaxRateFormValues>({
        resolver: zodResolver(taxRateSchema),
        defaultValues: {
            name: "",
            rate: 0,
            isDefault: false
        }
    });

    const saveSettings = async (updatedSettings: TaxSettings) => {
        setSaving(true);
        try {
            await SettingsService.saveSettings(updatedSettings);
            setSettings(updatedSettings);
            toast({
                title: "Settings saved",
                description: "Tax settings have been updated successfully",
            });
        } catch (error) {
            console.error("Error saving tax settings:", error);
            toast({
                title: "Error",
                description: "Failed to save tax settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddTaxRate = (values: TaxRateFormValues) => {
        if (!settings) return;

        const newTaxRate = {
            ...values,
            id: editingTaxRate || `tax-${Date.now()}`
        };

        let updatedRates;
        if (editingTaxRate) {
            updatedRates = settings.rates.map(rate =>
                rate.id === editingTaxRate ? newTaxRate : rate
            );
        } else {
            updatedRates = [...settings.rates, newTaxRate];
        }

        // If this is set as default, update other rates
        if (newTaxRate.isDefault) {
            updatedRates = updatedRates.map(rate => ({
                ...rate,
                isDefault: rate.id === newTaxRate.id
            }));
        }

        const updatedSettings = {
            ...settings,
            rates: updatedRates
        };

        saveSettings(updatedSettings);
        setIsAddingTaxRate(false);
        setEditingTaxRate(null);
        form.reset();
    };

    const handleDeleteTaxRate = (id: string) => {
        if (!settings) return;

        const updatedRates = settings.rates.filter(rate => rate.id !== id);
        const updatedSettings = {
            ...settings,
            rates: updatedRates
        };

        saveSettings(updatedSettings);
    };

    const handleEditTaxRate = (id: string) => {
        if (!settings) return;

        const taxRate = settings.rates.find(rate => rate.id === id);
        if (taxRate) {
            form.reset(taxRate);
            setEditingTaxRate(id);
            setIsAddingTaxRate(true);
        }
    };

    const handleUpdateSetting = <K extends keyof TaxSettings>(
        section: K,
        value: TaxSettings[K]
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
                description: "Tax settings have been reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting tax settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset tax settings",
                variant: "destructive",
            });
        }
    };

    const handleDialogClose = () => {
        setIsAddingTaxRate(false);
        setEditingTaxRate(null);
        form.reset();
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tax & Currency Settings</CardTitle>
                    <CardDescription>Configure tax rates and currency options for your business</CardDescription>
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
                    <CardTitle>Tax & Currency Settings</CardTitle>
                    <CardDescription>Configure tax rates and currency options for your business</CardDescription>
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
                <CardTitle>Tax & Currency Settings</CardTitle>
                <CardDescription>Configure tax rates and currency options for your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Tax Rates */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Tax Rates</h3>
                        <Dialog open={isAddingTaxRate} onOpenChange={setIsAddingTaxRate}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingTaxRate(null);
                                        form.reset({
                                            name: "",
                                            rate: 0,
                                            isDefault: false
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Tax Rate
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingTaxRate ? "Edit" : "Add"} Tax Rate</DialogTitle>
                                    <DialogDescription>
                                        Configure a tax rate for your business
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAddTaxRate)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. VAT, Sales Tax" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="isDefault"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Default Tax Rate</FormLabel>
                                                        <FormDescription>
                                                            Set as the default tax rate for new products
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={handleDialogClose}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                {editingTaxRate ? "Update" : "Add"} Tax Rate
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {settings.rates.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            <span>Name</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <Percent className="h-4 w-4" />
                                            <span>Rate (%)</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            <span>Default</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Edit className="h-4 w-4" />
                                            <span>Actions</span>
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {settings.rates.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <span>{rate.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4 text-muted-foreground" />
                                                <span>{rate.rate}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {rate.isDefault ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span>{rate.isDefault ? "Yes" : "No"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditTaxRate(rate.id)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTaxRate(rate.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center p-4 border rounded-md">
                            <p className="text-muted-foreground">No tax rates configured</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Currency Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Currency Settings</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency-code">Currency Code</Label>
                            <Input
                                id="currency-code"
                                value={settings.currency.code}
                                onChange={(e) =>
                                    onUpdate({
                                        ...settings,
                                        currency: {
                                            ...settings.currency,
                                            code: e.target.value,
                                        },
                                    })
                                }
                                placeholder="USD"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency-symbol">Currency Symbol</Label>
                            <Input
                                id="currency-symbol"
                                value={settings.currency.symbol}
                                onChange={(e) =>
                                    onUpdate({
                                        ...settings,
                                        currency: {
                                            ...settings.currency,
                                            symbol: e.target.value,
                                        },
                                    })
                                }
                                placeholder="$"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="symbol-position">Symbol Position</Label>
                            <Select
                                value={settings.currency.position}
                                onValueChange={(value: any) =>
                                    onUpdate({
                                        ...settings,
                                        currency: {
                                            ...settings.currency,
                                            position: value,
                                        },
                                    })
                                }
                            >
                                <SelectTrigger id="symbol-position">
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="before">Before amount ($100)</SelectItem>
                                    <SelectItem value="after">After amount (100$)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="decimal-places">Decimal Places</Label>
                            <Select
                                value={settings.currency.decimalPlaces.toString()}
                                onValueChange={(value: any) =>
                                    onUpdate({
                                        ...settings,
                                        currency: {
                                            ...settings.currency,
                                            decimalPlaces: parseInt(value),
                                        },
                                    })
                                }
                            >
                                <SelectTrigger id="decimal-places">
                                    <SelectValue placeholder="Select decimal places" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0 (100)</SelectItem>
                                    <SelectItem value="1">1 (100.0)</SelectItem>
                                    <SelectItem value="2">2 (100.00)</SelectItem>
                                    <SelectItem value="3">3 (100.000)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Multiple Currencies */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="multi-currency">Enable Multiple Currencies</Label>
                        <Switch
                            id="multi-currency"
                            checked={settings.multipleCurrencies.enabled}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('multipleCurrencies', {
                                    ...settings.multipleCurrencies,
                                    enabled: checked,
                                })
                            }
                        />
                    </div>

                    {settings.multipleCurrencies.enabled && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <p className="text-sm text-muted-foreground mb-2">
                                Additional currency configuration is available in the advanced settings
                            </p>
                            <Button variant="outline" size="sm">
                                Configure Additional Currencies
                            </Button>
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
