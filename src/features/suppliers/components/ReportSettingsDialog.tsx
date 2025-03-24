import * as React from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl?: string
}

interface ReportSettings {
  baseCommissionRate: number
  performanceBonus: number
  qualityThreshold: number
  deliveryTimeThreshold: number
  companyInfo: CompanyInfo
  showLogo: boolean
  accentColor: string
}

interface ReportSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ReportSettings
  onSave: (settings: ReportSettings) => void
}

export function ReportSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: ReportSettingsDialogProps) {
  const [localSettings, setLocalSettings] = React.useState<ReportSettings>(settings)
  const [logoPreview, setLogoPreview] = React.useState<string | undefined>(settings.companyInfo.logoUrl)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        setLocalSettings(prev => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo,
            logoUrl: base64
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-700 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Report Settings</DialogTitle>
          <DialogDescription>
            Configure your supplier report settings and company information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium mb-1.5">Company Logo</Label>
                <p className="text-sm text-zinc-400">Upload your company logo for the report header.</p>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={localSettings.showLogo}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, showLogo: checked }))
                  }
                />
                <div className="relative h-16 w-16 rounded-lg border border-zinc-700 overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-xs text-zinc-500">No logo</span>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={localSettings.accentColor}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="h-8 w-16 p-1 bg-zinc-800 border-zinc-700"
                />
                <span className="text-sm text-zinc-400">Select a color for report accents</span>
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          <div className="grid gap-4">
            <Label className="text-sm font-medium">Company Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={localSettings.companyInfo.name}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  value={localSettings.companyInfo.email}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, email: e.target.value }
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  value={localSettings.companyInfo.phone}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, phone: e.target.value }
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  value={localSettings.companyInfo.website}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, website: e.target.value }
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  value={localSettings.companyInfo.address}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, address: e.target.value }
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          <div className="grid gap-4">
            <Label className="text-sm font-medium">Commission Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-rate">Base Commission Rate (%)</Label>
                <Input
                  id="base-rate"
                  type="number"
                  value={localSettings.baseCommissionRate}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      baseCommissionRate: parseFloat(e.target.value)
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance-bonus">Performance Bonus (%)</Label>
                <Input
                  id="performance-bonus"
                  type="number"
                  value={localSettings.performanceBonus}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      performanceBonus: parseFloat(e.target.value)
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality-threshold">Quality Threshold</Label>
                <Input
                  id="quality-threshold"
                  type="number"
                  value={localSettings.qualityThreshold}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      qualityThreshold: parseFloat(e.target.value)
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-threshold">Delivery Time Threshold (days)</Label>
                <Input
                  id="delivery-threshold"
                  type="number"
                  value={localSettings.deliveryTimeThreshold}
                  onChange={(e) => 
                    setLocalSettings(prev => ({
                      ...prev,
                      deliveryTimeThreshold: parseFloat(e.target.value)
                    }))
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-100 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(localSettings)
              onOpenChange(false)
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
