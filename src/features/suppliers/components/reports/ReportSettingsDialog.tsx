import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ReportSettings {
  baseCommissionRate: number
  performanceBonus: number
  qualityThreshold: number
  deliveryTimeThreshold: number
}

interface ReportSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ReportSettings
  onSettingsChange: (settings: ReportSettings) => void
}

export function ReportSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: ReportSettingsDialogProps) {
  const handleChange = (key: keyof ReportSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      [key]: parseFloat(e.target.value)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Settings</DialogTitle>
          <DialogDescription>
            Configure commission rates and performance thresholds for supplier reports.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="baseCommissionRate">Base Commission Rate (%)</Label>
            <Input
              id="baseCommissionRate"
              type="number"
              step="0.1"
              value={settings.baseCommissionRate}
              onChange={handleChange("baseCommissionRate")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="performanceBonus">Performance Bonus (%)</Label>
            <Input
              id="performanceBonus"
              type="number"
              step="0.1"
              value={settings.performanceBonus}
              onChange={handleChange("performanceBonus")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="qualityThreshold">Quality Threshold (out of 5)</Label>
            <Input
              id="qualityThreshold"
              type="number"
              step="0.1"
              value={settings.qualityThreshold}
              onChange={handleChange("qualityThreshold")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deliveryTimeThreshold">Delivery Time Threshold (days)</Label>
            <Input
              id="deliveryTimeThreshold"
              type="number"
              step="0.5"
              value={settings.deliveryTimeThreshold}
              onChange={handleChange("deliveryTimeThreshold")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
