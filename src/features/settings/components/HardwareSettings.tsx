import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Printer, RotateCw, Scan, Monitor, Save, Loader2, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { SettingsService } from '../services/hardware.service';
import { HardwareSettings } from '../schemas/hardware-settings.schema';

const printerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Printer name is required"),
    type: z.enum(["receipt", "label", "document"]),
    connection: z.enum(["usb", "network", "bluetooth"]),
    isDefault: z.boolean().default(false)
});

type PrinterFormValues = z.infer<typeof printerSchema>;

export function HardwareSettingsPanel() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<HardwareSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddingPrinter, setIsAddingPrinter] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState<string | null>(null);

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error loading hardware settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load hardware settings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [toast]);

    const form = useForm<PrinterFormValues>({
        resolver: zodResolver(printerSchema),
        defaultValues: {
            name: "",
            type: "receipt",
            connection: "usb",
            isDefault: false
        }
    });

    const handleAddPrinter = (values: PrinterFormValues) => {
        if (!settings) return;

        const newPrinter = {
            ...values,
            id: editingPrinter || `printer-${Date.now()}`
        };

        let updatedPrinters;
        if (editingPrinter) {
            updatedPrinters = settings.printers.map(printer =>
                printer.id === editingPrinter ? newPrinter : printer
            );
        } else {
            updatedPrinters = [...settings.printers, newPrinter];
        }

        if (newPrinter.isDefault) {
            updatedPrinters = updatedPrinters.map(printer => ({
                ...printer,
                isDefault: printer.id === newPrinter.id
            }));
        }

        const updatedSettings = {
            ...settings,
            printers: updatedPrinters
        };

        saveSettings(updatedSettings);
        setIsAddingPrinter(false);
        setEditingPrinter(null);
        form.reset();
    };

    const handleDeletePrinter = (id: string) => {
        if (!settings) return;

        const updatedPrinters = settings.printers.filter(printer => printer.id !== id);
        const updatedSettings = {
            ...settings,
            printers: updatedPrinters
        };

        saveSettings(updatedSettings);
    };

    const handleEditPrinter = (id: string) => {
        if (!settings) return;

        const printer = settings.printers.find(printer => printer.id === id);
        if (printer) {
            form.reset(printer);
            setEditingPrinter(id);
            setIsAddingPrinter(true);
        }
    };

    const saveSettings = async (updatedSettings: HardwareSettings) => {
        setSaving(true);
        try {
            await SettingsService.saveSettings(updatedSettings);
            setSettings(updatedSettings);
            toast({
                title: "Settings saved",
                description: "Hardware settings have been updated successfully",
            });
        } catch (error) {
            console.error("Error saving hardware settings:", error);
            toast({
                title: "Error",
                description: "Failed to save hardware settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSetting = <K extends keyof HardwareSettings>(
        section: K,
        value: HardwareSettings[K]
    ) => {
        if (!settings) return;

        const updatedSettings = {
            ...settings,
            [section]: value
        };

        saveSettings(updatedSettings);
    };

    const handleResetSettings = async () => {
        try {
            const defaultSettings = await SettingsService.resetSettings();
            setSettings(defaultSettings);
            toast({
                title: "Settings reset",
                description: "Hardware settings have been reset to defaults",
            });
        } catch (error) {
            console.error("Error resetting hardware settings:", error);
            toast({
                title: "Error",
                description: "Failed to reset hardware settings",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Printer & Hardware Settings</CardTitle>
                    <CardDescription>Configure your POS hardware devices and peripherals</CardDescription>
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
                    <CardTitle>Printer & Hardware Settings</CardTitle>
                    <CardDescription>Configure your POS hardware devices and peripherals</CardDescription>
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
                <CardTitle>Printer & Hardware Settings</CardTitle>
                <CardDescription>Configure your POS hardware devices and peripherals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Printer Management */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Printer Management</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <Dialog open={isAddingPrinter} onOpenChange={setIsAddingPrinter}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingPrinter(null);
                                        form.reset({
                                            name: "",
                                            type: "receipt",
                                            connection: "usb",
                                            isDefault: false
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Printer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingPrinter ? "Edit" : "Add"} Printer</DialogTitle>
                                    <DialogDescription>
                                        Configure a printer for your POS system
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAddPrinter)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Printer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Main Receipt Printer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Printer Type</FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select printer type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="receipt">Receipt Printer</SelectItem>
                                                            <SelectItem value="label">Label Printer</SelectItem>
                                                            <SelectItem value="document">Document Printer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="connection"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Connection Type</FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select connection type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="usb">USB</SelectItem>
                                                            <SelectItem value="network">Network</SelectItem>
                                                            <SelectItem value="bluetooth">Bluetooth</SelectItem>
                                                        </SelectContent>
                                                    </Select>
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
                                                        <FormLabel>Default Printer</FormLabel>
                                                        <FormDescription>
                                                            Set as the default printer for this type
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
                                            <Button type="button" variant="outline" onClick={() => setIsAddingPrinter(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                {editingPrinter ? "Update" : "Add"} Printer
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {settings.printers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Connection</TableHead>
                                    <TableHead>Default</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {settings.printers.map((printer) => (
                                    <TableRow key={printer.id}>
                                        <TableCell>{printer.name}</TableCell>
                                        <TableCell className="capitalize">{printer.type}</TableCell>
                                        <TableCell className="capitalize">{printer.connection}</TableCell>
                                        <TableCell>{printer.isDefault ? "Yes" : "No"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditPrinter(printer.id)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeletePrinter(printer.id)}
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
                            <p className="text-muted-foreground">No printers configured</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Cash Drawer Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <RotateCw className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Cash Drawer</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="cash-drawer-enabled">Enable cash drawer</Label>
                        <Switch
                            id="cash-drawer-enabled"
                            checked={settings.cashDrawer.enabled}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('cashDrawer', {
                                    ...settings.cashDrawer,
                                    enabled: checked,
                                })
                            }
                        />
                    </div>

                    {settings.cashDrawer.enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <Label htmlFor="drawer-trigger">Open Trigger</Label>
                                <Select
                                    value={settings.cashDrawer.openTrigger}
                                    onValueChange={(value: any) =>
                                        handleUpdateSetting('cashDrawer', {
                                            ...settings.cashDrawer,
                                            openTrigger: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="drawer-trigger">
                                        <SelectValue placeholder="Select trigger" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="after_sale">After Sale</SelectItem>
                                        <SelectItem value="manual">Manual Only</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="drawer-printer">Connected Printer</Label>
                                <Select
                                    value={settings.cashDrawer.printer}
                                    onValueChange={(value: any) =>
                                        handleUpdateSetting('cashDrawer', {
                                            ...settings.cashDrawer,
                                            printer: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="drawer-printer">
                                        <SelectValue placeholder="Select printer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {settings.printers
                                            .filter(p => p.type === "receipt")
                                            .map(printer => (
                                                <SelectItem key={printer.id} value={printer.id}>
                                                    {printer.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Barcode Scanner Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Scan className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Barcode Scanner</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="scanner-enabled">Enable barcode scanner</Label>
                        <Switch
                            id="scanner-enabled"
                            checked={settings.scanner.enabled}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('scanner', {
                                    ...settings.scanner,
                                    enabled: checked,
                                })
                            }
                        />
                    </div>

                    {settings.scanner.enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <Label htmlFor="scanner-type">Scanner Type</Label>
                                <Select
                                    value={settings.scanner.type}
                                    onValueChange={(value: any) =>
                                        handleUpdateSetting('scanner', {
                                            ...settings.scanner,
                                            type: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="scanner-type">
                                        <SelectValue placeholder="Select scanner type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usb">USB Scanner</SelectItem>
                                        <SelectItem value="bluetooth">Bluetooth Scanner</SelectItem>
                                        <SelectItem value="camera">Camera Scanner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scanner-prefix">Barcode Prefix</Label>
                                <Input
                                    id="scanner-prefix"
                                    value={settings.scanner.prefix}
                                    onChange={(e) =>
                                        handleUpdateSetting('scanner', {
                                            ...settings.scanner,
                                            prefix: e.target.value,
                                        })
                                    }
                                    placeholder="Optional prefix"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scanner-suffix">Barcode Suffix</Label>
                                <Input
                                    id="scanner-suffix"
                                    value={settings.scanner.suffix}
                                    onChange={(e) =>
                                        handleUpdateSetting('scanner', {
                                            ...settings.scanner,
                                            suffix: e.target.value,
                                        })
                                    }
                                    placeholder="Optional suffix"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Display Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Display Screen</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="customer-display">Enable customer display</Label>
                        <Switch
                            id="customer-display"
                            checked={settings.display.customerDisplay}
                            onCheckedChange={(checked) =>
                                handleUpdateSetting('display', {
                                    ...settings.display,
                                    customerDisplay: checked,
                                })
                            }
                        />
                    </div>

                    {settings.display.customerDisplay && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="brightness">Screen Brightness</Label>
                                    <span className="text-sm text-muted-foreground">{settings.display.brightness}%</span>
                                </div>
                                <Slider
                                    id="brightness"
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={[settings.display.brightness]}
                                    onValueChange={(value) =>
                                        handleUpdateSetting('display', {
                                            ...settings.display,
                                            brightness: value[0],
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orientation">Screen Orientation</Label>
                                <Select
                                    value={settings.display.orientation}
                                    onValueChange={(value: any) =>
                                        handleUpdateSetting('display', {
                                            ...settings.display,
                                            orientation: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="orientation">
                                        <SelectValue placeholder="Select orientation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="landscape">Landscape</SelectItem>
                                        <SelectItem value="portrait">Portrait</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeout">Screen Timeout (seconds)</Label>
                                <Input
                                    id="timeout"
                                    type="number"
                                    value={settings.display.timeout}
                                    onChange={(e) =>
                                        handleUpdateSetting('display', {
                                            ...settings.display,
                                            timeout: parseInt(e.target.value),
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
