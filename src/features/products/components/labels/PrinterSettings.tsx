import { useState } from 'react'
import { Printer, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface PrinterSettingsProps {
  onSave: (settings: PrinterSettings) => void
  onTest: () => void
}

interface PrinterSettings {
  name: string
  type: string
  dpi: number
  width: number
  height: number
  margin: number
  copies: number
  autoCut: boolean
  autoFeed: boolean
  darkMode: boolean
}

const defaultSettings: PrinterSettings = {
  name: '',
  type: 'thermal',
  dpi: 203,
  width: 100,
  height: 50,
  margin: 0,
  copies: 1,
  autoCut: true,
  autoFeed: true,
  darkMode: false,
}

export function PrinterSettings({ onSave, onTest }: PrinterSettingsProps) {
  const [settings, setSettings] = useState<PrinterSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(settings)
      toast({
        title: 'Settings saved',
        description: 'Printer settings have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save printer settings.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    setIsLoading(true)
    try {
      await onTest()
      toast({
        title: 'Test successful',
        description: 'Printer test completed successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test printer.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Printer Settings</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isLoading}
          >
            <Printer className="h-4 w-4 mr-2" />
            Test Printer
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Printer Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
              placeholder="Enter printer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Printer Type</Label>
            <Select
              value={settings.type}
              onValueChange={(value) =>
                setSettings({ ...settings, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select printer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thermal">Thermal Printer</SelectItem>
                <SelectItem value="laser">Laser Printer</SelectItem>
                <SelectItem value="inkjet">Inkjet Printer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dpi">DPI</Label>
            <Input
              id="dpi"
              type="number"
              value={settings.dpi}
              onChange={(e) =>
                setSettings({ ...settings, dpi: parseInt(e.target.value) })
              }
              min="72"
              max="1200"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width">Label Width (mm)</Label>
            <Input
              id="width"
              type="number"
              value={settings.width}
              onChange={(e) =>
                setSettings({ ...settings, width: parseInt(e.target.value) })
              }
              min="10"
              max="1000"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Label Height (mm)</Label>
            <Input
              id="height"
              type="number"
              value={settings.height}
              onChange={(e) =>
                setSettings({ ...settings, height: parseInt(e.target.value) })
              }
              min="10"
              max="1000"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin">Margin (mm)</Label>
            <Input
              id="margin"
              type="number"
              value={settings.margin}
              onChange={(e) =>
                setSettings({ ...settings, margin: parseInt(e.target.value) })
              }
              min="0"
              max="50"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copies">Copies</Label>
            <Input
              id="copies"
              type="number"
              value={settings.copies}
              onChange={(e) =>
                setSettings({ ...settings, copies: parseInt(e.target.value) })
              }
              min="1"
              max="100"
              step="1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoCut">Auto Cut</Label>
            <Switch
              id="autoCut"
              checked={settings.autoCut}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoCut: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoFeed">Auto Feed</Label>
            <Switch
              id="autoFeed"
              checked={settings.autoFeed}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoFeed: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, darkMode: checked })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
} 