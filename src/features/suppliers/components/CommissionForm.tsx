import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CommissionType } from "../types"
import { Card } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

// Define the form schema with Zod
const commissionFormSchema = z.object({
  type: z.enum([
    CommissionType.FIXED,
    CommissionType.PERCENTAGE,
    CommissionType.TIERED,
    CommissionType.PERFORMANCE_BASED
  ]),
  rate: z.coerce.number().min(0, "Rate must be a positive number"),
  notes: z.string().optional(),
  // Performance-based metrics
  performanceMetrics: z.object({
    qualityThreshold: z.coerce.number().min(0).max(100).optional(),
    deliveryTimeThreshold: z.coerce.number().min(0).optional(),
    baseRate: z.coerce.number().min(0).optional(),
    bonusRate: z.coerce.number().min(0).optional(),
  }).optional(),
  // Tiered commission structure
  tiers: z.array(z.object({
    minAmount: z.coerce.number().min(0),
    maxAmount: z.coerce.number().min(0),
    rate: z.coerce.number().min(0),
  })).optional(),
})

type CommissionFormValues = z.infer<typeof commissionFormSchema>

interface CommissionFormProps {
  initialData?: CommissionFormValues
  onSubmit: (data: CommissionFormValues) => void
  onCancel: () => void
}

export function CommissionForm({ initialData, onSubmit, onCancel }: CommissionFormProps) {
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(
    initialData?.type === CommissionType.PERFORMANCE_BASED
  )
  const [showTiers, setShowTiers] = useState(
    initialData?.type === CommissionType.TIERED
  )

  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionFormSchema),
    defaultValues: initialData || {
      type: CommissionType.PERCENTAGE,
      rate: 0,
      notes: "",
      performanceMetrics: {
        qualityThreshold: 95,
        deliveryTimeThreshold: 14,
        baseRate: 3,
        bonusRate: 2,
      },
      tiers: [
        { minAmount: 0, maxAmount: 50000, rate: 3 },
        { minAmount: 50001, maxAmount: 100000, rate: 4 },
      ],
    },
  })

  const commissionType = form.watch("type")

  useEffect(() => {
    setShowPerformanceMetrics(commissionType === CommissionType.PERFORMANCE_BASED)
    setShowTiers(commissionType === CommissionType.TIERED)
  }, [commissionType])

  const handleAddTier = () => {
    const currentTiers = form.getValues("tiers") || []
    const lastTier = currentTiers[currentTiers.length - 1]
    const newTier = {
      minAmount: lastTier ? lastTier.maxAmount + 1 : 0,
      maxAmount: lastTier ? lastTier.maxAmount + 50000 : 50000,
      rate: lastTier ? lastTier.rate + 1 : 3,
    }
    form.setValue("tiers", [...currentTiers, newTier])
  }

  const handleRemoveTier = (index: number) => {
    const currentTiers = form.getValues("tiers") || []
    form.setValue("tiers", currentTiers.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Commission Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select commission type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={CommissionType.FIXED}>Fixed Amount</SelectItem>
                    <SelectItem value={CommissionType.PERCENTAGE}>Percentage</SelectItem>
                    <SelectItem value={CommissionType.TIERED}>Tiered</SelectItem>
                    <SelectItem value={CommissionType.PERFORMANCE_BASED}>Performance Based</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Base Rate */}
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={commissionType === CommissionType.FIXED ? "Enter fixed amount" : "Enter percentage"}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {commissionType === CommissionType.FIXED ? "Fixed amount in currency" : "Percentage rate"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Performance Metrics */}
        {showPerformanceMetrics && (
          <Card className="p-4">
            <h3 className="font-medium mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="performanceMetrics.qualityThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Threshold (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performanceMetrics.deliveryTimeThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time Threshold (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performanceMetrics.baseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performanceMetrics.bonusRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {/* Tiered Commission Structure */}
        {showTiers && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Commission Tiers</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>
            {form.watch("tiers")?.map((tier, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 mb-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`tiers.${index}.minAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Amount</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`tiers.${index}.maxAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Amount</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`tiers.${index}.rate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-end justify-center col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTier(index)}
                    className="text-destructive"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about the commission structure..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Commission
          </Button>
        </div>
      </form>
    </Form>
  )
} 