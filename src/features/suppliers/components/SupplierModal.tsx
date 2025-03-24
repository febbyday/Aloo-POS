import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { supplierSchema, SupplierFormValues, SupplierType, CommissionType } from '../types'
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToastManager } from "@/components/ui/toast-manager"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  Mail, 
  Phone, 
  User2,
  MapPin,
  Globe,
  Receipt,
  FileStack,
  Building,
  Star,
  AlertCircle,
  Save,
  Trash
} from 'lucide-react'
import { useSupplierHistory } from '../context/SupplierHistoryContext'
import { FieldHelpTooltip, InfoBox } from '@/components/ui/help-tooltip'
import { OperationButton, ActionStatus, ActionFeedback } from '@/components/ui/action-feedback'

interface SupplierModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<SupplierFormValues>
  onSubmit: (data: SupplierFormValues) => void
}

export function SupplierModal({ 
  open, 
  onOpenChange,
  initialData,
  onSubmit: onSubmitProp
}: SupplierModalProps) {
  const showToast = useToastManager()
  const { trackAction } = useSupplierHistory()
  const [operationStatus, setOperationStatus] = useState<ActionStatus>("idle")
  const [showBankingDetails, setShowBankingDetails] = useState(!!initialData?.bankingDetails)
  const [showCommission, setShowCommission] = useState(!!initialData?.commission)
  
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      type: initialData?.type || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      website: initialData?.website || "",
      taxId: initialData?.taxId || "",
      notes: initialData?.notes || "",
      status: initialData?.status || "Active",
      bankingDetails: undefined,
      commission: undefined,
      ...initialData,
    }
  })

  const commissionType = form.watch("commission.type")

  const handleAddBankingDetails = () => {
    form.setValue("bankingDetails", {
      accountName: "",
      accountNumber: "",
      bankName: "",
      branchCode: "",
      swiftCode: "",
      iban: "",
      bankAddress: "",
    })
    setShowBankingDetails(true)
  }

  const handleRemoveBankingDetails = () => {
    form.setValue("bankingDetails", undefined)
    setShowBankingDetails(false)
  }

  const handleAddCommission = () => {
    form.setValue("commission", {
      type: CommissionType.PERCENTAGE,
      rate: 0,
      notes: ""
    })
    setShowCommission(true)
  }

  const handleRemoveCommission = () => {
    form.setValue("commission", undefined)
    setShowCommission(false)
  }

  async function onSubmit(data: SupplierFormValues) {
    try {
      setOperationStatus("loading")
      
      // Track this action for undo/redo
      if (initialData?.id) {
        trackAction(
          {
            type: 'update_supplier',
            id: initialData.id,
            before: initialData,
            after: data
          },
          `Updated supplier ${data.name}`
        )
      } else {
        trackAction(
          {
            type: 'create_supplier',
            supplier: { 
              id: crypto.randomUUID(), 
              createdAt: new Date(),
              updatedAt: new Date(),
              ...data 
            }
          },
          `Added new supplier ${data.name}`
        )
      }
      
      await onSubmitProp(data)
      
      setOperationStatus("success")
      showToast.success(
        initialData ? "Supplier updated" : "Supplier added",
        initialData ? "The supplier has been updated successfully." : "The supplier has been added successfully."
      )
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving supplier:', error)
      setOperationStatus("error")
      showToast.error("Error", "Failed to save supplier")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark-mode-scrollbar">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the supplier information below." 
              : "Fill in the supplier information below to add them to your system."}
          </DialogDescription>
        </DialogHeader>
        
        <InfoBox variant="info" className="mb-4">
          All fields marked with * are required. Make sure to provide accurate information to maintain good supplier relationships.
        </InfoBox>
        
        <ActionFeedback
          status={operationStatus}
          message={operationStatus === "success" ? "Supplier saved successfully" : "Saving supplier..."}
          duration={3000}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Company Name"
                        content="Enter the official registered business name of the supplier."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter company name" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Supplier Code"
                        content="A unique identifier for this supplier. Use uppercase letters and numbers (e.g., SUP001)."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <FileStack className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="SUP-001" className="pl-8 font-mono" {...field} />
                        </div>
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
                      <FieldHelpTooltip
                        label="Type"
                        content="Select the type of supplier based on their primary business function."
                        required
                      />
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <Building className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select supplier type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(SupplierType).map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Status"
                        content="Set the current status of your relationship with this supplier."
                        required
                      />
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Contact Person"
                        content="The primary person to contact at this supplier."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <User2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter contact name" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Email"
                        content="The primary email address for business communications."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter email address" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Phone"
                        content="The primary phone number for this supplier."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter phone number" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Address"
                        content="The physical or mailing address for this supplier."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter address" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Website"
                        content="The supplier's website URL (optional)."
                      />
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter website URL" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FieldHelpTooltip
                        label="Tax ID"
                        content="The supplier's tax identification number."
                        required
                      />
                      <FormControl>
                        <div className="relative">
                          <Receipt className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter tax ID" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FieldHelpTooltip
                      label="Notes"
                      content="Any additional information about this supplier (optional)."
                    />
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Banking Details</h3>
                  {!showBankingDetails ? (
                    <Button type="button" variant="outline" onClick={handleAddBankingDetails}>
                      Add Banking Details
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleRemoveBankingDetails}>
                      Remove Banking Details
                    </Button>
                  )}
                </div>

                {showBankingDetails && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankingDetails.accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="Account Name"
                            content="The name on the bank account."
                            required
                          />
                          <FormControl>
                            <Input placeholder="Enter account name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="Account Number"
                            content="The bank account number."
                            required
                          />
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="Bank Name"
                            content="The name of the bank."
                            required
                          />
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.branchCode"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="Branch Code"
                            content="The bank's branch or routing code."
                            required
                          />
                          <FormControl>
                            <Input placeholder="Enter branch code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.swiftCode"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="SWIFT Code"
                            content="The bank's SWIFT/BIC code for international transfers (optional)."
                          />
                          <FormControl>
                            <Input placeholder="Enter SWIFT code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.iban"
                      render={({ field }) => (
                        <FormItem>
                          <FieldHelpTooltip
                            label="IBAN"
                            content="International Bank Account Number (optional)."
                          />
                          <FormControl>
                            <Input placeholder="Enter IBAN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankingDetails.bankAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FieldHelpTooltip
                            label="Bank Address"
                            content="The bank's physical address (optional)."
                          />
                          <FormControl>
                            <Input placeholder="Enter bank address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Commission Settings</h3>
                  {!showCommission ? (
                    <Button type="button" variant="outline" onClick={handleAddCommission}>
                      Add Commission
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleRemoveCommission}>
                      Remove Commission
                    </Button>
                  )}
                </div>

                {showCommission && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="commission.type"
                        render={({ field }) => (
                          <FormItem>
                            <FieldHelpTooltip
                              label="Commission Type"
                              content="Select how the commission will be calculated."
                              required
                            />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <Star className="h-4 w-4 mr-2" />
                                  <SelectValue placeholder="Select commission type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(CommissionType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commission.rate"
                        render={({ field }) => (
                          <FormItem>
                            <FieldHelpTooltip
                              label="Base Rate"
                              content={commissionType === CommissionType.FIXED ? 
                                "Fixed amount per transaction" : 
                                "Base percentage rate"
                              }
                              required
                            />
                            <FormControl>
                              <div className="relative">
                                <Star className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number"
                                  placeholder={commissionType === CommissionType.FIXED ? "Enter amount" : "Enter percentage"}
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {commissionType === CommissionType.TIERED && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Commission Tiers</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentTiers = form.getValues("commission.tiers") || []
                              form.setValue("commission.tiers", [
                                ...currentTiers,
                                { minAmount: 0, maxAmount: 0, rate: 0 }
                              ])
                            }}
                          >
                            Add Tier
                          </Button>
                        </div>
                        {form.watch("commission.tiers")?.map((_, index) => (
                          <div key={index} className="grid grid-cols-3 gap-4 items-end">
                            <FormField
                              control={form.control}
                              name={`commission.tiers.${index}.minAmount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Min Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`commission.tiers.${index}.maxAmount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`commission.tiers.${index}.rate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rate (%)</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                          const currentTiers = form.getValues("commission.tiers") || []
                                          form.setValue(
                                            "commission.tiers",
                                            currentTiers.filter((_, i) => i !== index)
                                          )
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {commissionType === CommissionType.PERFORMANCE_BASED && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="commission.performanceMetrics.qualityThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quality Threshold (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="commission.performanceMetrics.deliveryTimeThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Time Threshold (days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="commission.performanceMetrics.baseRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Rate (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="commission.performanceMetrics.bonusRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bonus Rate (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="commission.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any notes about the commission structure..."
                              className="min-h-[60px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <OperationButton 
                  type="submit"
                  successMessage="Supplier saved successfully"
                  errorMessage="Failed to save supplier"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? "Update Supplier" : "Add Supplier"}
                </OperationButton>
              </DialogFooter>
            </form>
          </Form>
        </ActionFeedback>
      </DialogContent>
    </Dialog>
  )
}
