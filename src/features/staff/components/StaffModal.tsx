import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { staffSchema } from "../types/staff"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield } from "lucide-react"
import { useRoles } from "../hooks/useRoles"
import type { Role } from "../types/role"

type StaffFormData = z.infer<typeof staffSchema>

const TabValue = {
  GENERAL: "general",
  EMPLOYMENT: "employment",
  BANKING: "banking",
} as const

type TabValue = (typeof TabValue)[keyof typeof TabValue]

interface FormFieldWrapperProps {
  children: React.ReactNode
  label: string
  required?: boolean
}

const FormFieldWrapper = ({ children, label, required = true }: FormFieldWrapperProps) => (
  <FormItem>
    <FormLabel>{label}{required && " *"}</FormLabel>
    <FormControl>{children}</FormControl>
    <FormMessage />
  </FormItem>
)

export function StaffModal({
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isReadOnly = false
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StaffFormData) => void
  initialData?: Partial<StaffFormData>
  isReadOnly?: boolean
}) {
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.GENERAL)
  const [showBankingDetails, setShowBankingDetails] = useState(!!initialData?.bankingDetails)
  const { roles, isLoading: isLoadingRoles, error: rolesError, refreshRoles } = useRoles()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      status: "active",
      hireDate: new Date().toISOString().split("T")[0],
      department: "",
      position: "",
      employmentType: "full-time",
      bankingDetails: undefined,
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      ...initialData,
    },
  })

  const handleAddBankingDetails = () => {
    form.setValue("bankingDetails", {
      accountName: "",
      accountNumber: "",
      bankName: "",
      accountType: "",
      branchLocation: "",
    })
    setShowBankingDetails(true)
  }

  const handleRemoveBankingDetails = () => {
    form.setValue("bankingDetails", undefined)
    setShowBankingDetails(false)
  }

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        ...data,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      
      // Reset form if it's an add operation (no initialData)
      if (!initialData) {
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
          status: "active",
          hireDate: new Date().toISOString().split("T")[0],
          department: "",
          position: "",
          employmentType: "full-time",
          bankingDetails: undefined,
          emergencyContact: {
            name: "",
            relationship: "",
            phone: "",
          }
        })
      }
    } catch (error) {
      console.error("Error submitting staff form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save staff member",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl mx-auto">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "Staff Details" : initialData ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          <DialogDescription>
            {isReadOnly ? "View staff details below." : "Enter the staff details below. All fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs 
              defaultValue={TabValue.GENERAL} 
              value={activeTab} 
              onValueChange={(value: string) => setActiveTab(value as TabValue)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value={TabValue.GENERAL}>General</TabsTrigger>
                <TabsTrigger value={TabValue.EMPLOYMENT}>Employment</TabsTrigger>
                <TabsTrigger value={TabValue.BANKING}>Banking</TabsTrigger>
              </TabsList>

              <TabsContent value={TabValue.GENERAL} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormFieldWrapper label="First Name">
                        <Input {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormFieldWrapper label="Last Name">
                        <Input {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormFieldWrapper label="Email">
                        <Input type="email" {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormFieldWrapper label="Phone">
                        <Input {...field} readOnly={isReadOnly} type="tel" />
                      </FormFieldWrapper>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormFieldWrapper label="Role">
                        <Select
                          disabled={isReadOnly || isLoadingRoles}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <div className="flex items-center space-x-2">
                                {isLoadingRoles ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading roles...</span>
                                  </>
                                ) : rolesError ? (
                                  <>
                                    <Shield className="h-4 w-4 text-destructive" />
                                    <span className="text-destructive">Error loading roles</span>
                                  </>
                                ) : field.value ? (
                                  <>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span>{roles.find(r => r.name === field.value)?.name || field.value}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">Select role</span>
                                )}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingRoles ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : rolesError ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Shield className="h-8 w-8 text-destructive mb-2" />
                                <p className="text-sm text-destructive">Failed to load roles</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => refreshRoles()}
                                >
                                  <Loader2 className="h-4 w-4 mr-2" />
                                  Retry
                                </Button>
                              </div>
                            ) : roles.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Shield className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No roles available</p>
                                <p className="text-xs text-muted-foreground">Please create roles first</p>
                              </div>
                            ) : (
                              roles.map((role) => (
                                <SelectItem 
                                  key={role.id} 
                                  value={role.name}
                                  className="py-2"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{role.name}</span>
                                      <span className="text-xs text-muted-foreground">{role.description}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormFieldWrapper>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormFieldWrapper label="Status">
                        <Select
                          disabled={isReadOnly}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormFieldWrapper>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value={TabValue.EMPLOYMENT} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormFieldWrapper label="Department">
                        <Input {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormFieldWrapper label="Position">
                        <Input {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormFieldWrapper label="Employment Type">
                        <Select
                          disabled={isReadOnly}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormFieldWrapper>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormFieldWrapper label="Hire Date">
                        <Input type="date" {...field} readOnly={isReadOnly} />
                      </FormFieldWrapper>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value={TabValue.BANKING} className="space-y-4">
                {!showBankingDetails ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <p className="text-muted-foreground">No banking details added</p>
                    {!isReadOnly && (
                      <Button type="button" onClick={handleAddBankingDetails}>
                        Add Banking Details
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveBankingDetails}
                        >
                          Remove Banking Details
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankingDetails.accountName"
                        render={({ field }) => (
                          <FormFieldWrapper label="Account Name">
                            <Input {...field} readOnly={isReadOnly} />
                          </FormFieldWrapper>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankingDetails.accountNumber"
                        render={({ field }) => (
                          <FormFieldWrapper label="Account Number">
                            <Input {...field} readOnly={isReadOnly} />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankingDetails.bankName"
                        render={({ field }) => (
                          <FormFieldWrapper label="Bank Name">
                            <Input {...field} readOnly={isReadOnly} />
                          </FormFieldWrapper>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankingDetails.accountType"
                        render={({ field }) => (
                          <FormFieldWrapper label="Account Type">
                            <Input {...field} readOnly={isReadOnly} />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankingDetails.branchLocation"
                        render={({ field }) => (
                          <FormFieldWrapper label="Branch Location">
                            <Input 
                              placeholder="Enter bank branch location" 
                              {...field} 
                              readOnly={isReadOnly} 
                            />
                          </FormFieldWrapper>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bankingDetails.branchCode"
                        render={({ field }) => (
                          <FormFieldWrapper label="Branch Code (Optional)">
                            <Input 
                              placeholder="Enter branch code if applicable" 
                              {...field} 
                              readOnly={isReadOnly} 
                            />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {!isReadOnly && (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData ? "Update Staff" : "Add Staff"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
