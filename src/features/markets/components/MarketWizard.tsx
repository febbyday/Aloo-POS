import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Market } from '../pages/MarketsPage'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from '@/lib/utils';

interface MarketWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: Partial<Market>) => void
  onStockTransferInit?: () => void
}

type WizardStep = 'basics' | 'review'

export function MarketWizard({
  open,
  onOpenChange,
  onComplete,
  onStockTransferInit
}: MarketWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics')
  const [formData, setFormData] = useState<Partial<Market>>({
    name: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'planning',
    progress: 0,
    stockAllocation: {
      allocated: 0,
      total: 0
    }
  })

  const steps: { id: WizardStep; title: string }[] = [
    { id: 'basics', title: 'Basic Info' },
    { id: 'review', title: 'Review' }
  ]

  const handleNext = () => {
    if (currentStep === 'basics') {
      setCurrentStep('review')
    } else if (currentStep === 'review') {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('basics')
    }
  }

  const handleComplete = () => {
    onComplete(formData)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'planning',
      progress: 0,
      stockAllocation: {
        allocated: 0,
        total: 0
      }
    })
    setCurrentStep('basics')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Market</DialogTitle>
          <DialogDescription>
            Set up a new market location in just a few steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <Progress value={(steps.findIndex(s => s.id === currentStep) + 1) / steps.length * 100} />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, i) => (
                <span key={step.id} className={cn(
                  currentStep === step.id && "text-primary font-medium"
                )}>
                  {i + 1}. {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Basic Info Step */}
          {currentStep === 'basics' && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Market Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter market name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter market location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">Start Date</Label>
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">End Date</Label>
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Review Market Details</AlertTitle>
                <AlertDescription>
                  Please review the market details before creating
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Market Name</Label>
                    <div className="font-medium">{formData.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Location</Label>
                    <div className="font-medium">{formData.location}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Duration</Label>
                  <div className="font-medium">
                    {formData.startDate?.toLocaleDateString()} - {formData.endDate?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'basics'}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === 'review' ? 'Create Market' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
