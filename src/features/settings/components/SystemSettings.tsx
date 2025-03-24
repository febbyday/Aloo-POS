import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SystemSettings } from '../types/settings.types';
import { Progress } from "@/components/ui/progress";
import { Database, Archive, Gauge, Cpu } from 'lucide-react';

interface SystemSettingsProps {
    settings: SystemSettings;
    onUpdate: (settings: SystemSettings) => void;
}

export function SystemSettingsPanel({ settings, onUpdate }: SystemSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Configure system performance and resource usage settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Data Archiving */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Data Archiving</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <Label htmlFor="archive-enabled">Enable automatic archiving</Label>
                        <Switch
                            id="archive-enabled"
                            checked={settings.archiving.enabled}
                            onCheckedChange={(checked) =>
                                onUpdate({
                                    ...settings,
                                    archiving: {
                                        ...settings.archiving,
                                        enabled: checked,
                                    },
                                })
                            }
                        />
                    </div>
                    
                    {settings.archiving.enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <Label htmlFor="archive-older-than">Archive data older than (days)</Label>
                                <Input
                                    id="archive-older-than"
                                    type="number"
                                    value={settings.archiving.olderThan}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...settings,
                                            archiving: {
                                                ...settings.archiving,
                                                olderThan: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="archive-format">Archive Format</Label>
                                <Select
                                    value={settings.archiving.archiveFormat}
                                    onValueChange={(value: any) =>
                                        onUpdate({
                                            ...settings,
                                            archiving: {
                                                ...settings.archiving,
                                                archiveFormat: value,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger id="archive-format">
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zip">ZIP</SelectItem>
                                        <SelectItem value="tar">TAR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
                
                <Separator />
                
                {/* Cache Management */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Cache Management</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <Label htmlFor="cache-enabled">Enable system cache</Label>
                        <Switch
                            id="cache-enabled"
                            checked={settings.cache.enabled}
                            onCheckedChange={(checked) =>
                                onUpdate({
                                    ...settings,
                                    cache: {
                                        ...settings.cache,
                                        enabled: checked,
                                    },
                                })
                            }
                        />
                    </div>
                    
                    {settings.cache.enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="cache-size">Maximum cache size (MB)</Label>
                                    <span className="text-sm text-muted-foreground">{settings.cache.maxSize} MB</span>
                                </div>
                                <Slider
                                    id="cache-size"
                                    min={64}
                                    max={4096}
                                    step={64}
                                    value={[settings.cache.maxSize]}
                                    onValueChange={(value) =>
                                        onUpdate({
                                            ...settings,
                                            cache: {
                                                ...settings.cache,
                                                maxSize: value[0],
                                            },
                                        })
                                    }
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="cache-clear-interval">Clear cache interval (hours)</Label>
                                <Select
                                    value={settings.cache.clearInterval.toString()}
                                    onValueChange={(value: any) =>
                                        onUpdate({
                                            ...settings,
                                            cache: {
                                                ...settings.cache,
                                                clearInterval: parseInt(value),
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger id="cache-clear-interval">
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">Every 6 hours</SelectItem>
                                        <SelectItem value="12">Every 12 hours</SelectItem>
                                        <SelectItem value="24">Every 24 hours</SelectItem>
                                        <SelectItem value="48">Every 48 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Button variant="outline" size="sm">Clear Cache Now</Button>
                            </div>
                        </div>
                    )}
                </div>
                
                <Separator />
                
                {/* System Monitoring */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Gauge className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">System Monitoring</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <Label htmlFor="monitoring-enabled">Enable system monitoring</Label>
                        <Switch
                            id="monitoring-enabled"
                            checked={settings.monitoring.enabled}
                            onCheckedChange={(checked) =>
                                onUpdate({
                                    ...settings,
                                    monitoring: {
                                        ...settings.monitoring,
                                        enabled: checked,
                                    },
                                })
                            }
                        />
                    </div>
                    
                    {settings.monitoring.enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="alert-threshold">Resource alert threshold (%)</Label>
                                    <span className="text-sm text-muted-foreground">{settings.monitoring.alertThreshold}%</span>
                                </div>
                                <Slider
                                    id="alert-threshold"
                                    min={50}
                                    max={95}
                                    step={5}
                                    value={[settings.monitoring.alertThreshold]}
                                    onValueChange={(value) =>
                                        onUpdate({
                                            ...settings,
                                            monitoring: {
                                                ...settings.monitoring,
                                                alertThreshold: value[0],
                                            },
                                        })
                                    }
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Label htmlFor="collect-metrics">Collect performance metrics</Label>
                                <Switch
                                    id="collect-metrics"
                                    checked={settings.monitoring.collectMetrics}
                                    onCheckedChange={(checked) =>
                                        onUpdate({
                                            ...settings,
                                            monitoring: {
                                                ...settings.monitoring,
                                                collectMetrics: checked,
                                            },
                                        })
                                    }
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Current System Usage</h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>CPU</span>
                                            <span>45%</span>
                                        </div>
                                        <Progress value={45} className="h-2" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Memory</span>
                                            <span>62%</span>
                                        </div>
                                        <Progress value={62} className="h-2" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Disk</span>
                                            <span>28%</span>
                                        </div>
                                        <Progress value={28} className="h-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <Separator />
                
                {/* Background Processing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Background Processing</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="max-jobs">Maximum concurrent jobs</Label>
                        <Select
                            value={settings.background.maxJobs.toString()}
                            onValueChange={(value: any) =>
                                onUpdate({
                                    ...settings,
                                    background: {
                                        ...settings.background,
                                        maxJobs: parseInt(value),
                                    },
                                })
                            }
                        >
                            <SelectTrigger id="max-jobs">
                                <SelectValue placeholder="Select max jobs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 job</SelectItem>
                                <SelectItem value="2">2 jobs</SelectItem>
                                <SelectItem value="3">3 jobs</SelectItem>
                                <SelectItem value="5">5 jobs</SelectItem>
                                <SelectItem value="10">10 jobs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="job-priority">Job priority</Label>
                        <Select
                            value={settings.background.priority}
                            onValueChange={(value: any) =>
                                onUpdate({
                                    ...settings,
                                    background: {
                                        ...settings.background,
                                        priority: value,
                                    },
                                })
                            }
                        >
                            <SelectTrigger id="job-priority">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low (saves resources)</SelectItem>
                                <SelectItem value="medium">Medium (balanced)</SelectItem>
                                <SelectItem value="high">High (faster processing)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
