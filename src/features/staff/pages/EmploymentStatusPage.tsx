import { useState, useEffect } from "react"
import { useEmploymentStatuses } from "../hooks/useEmploymentStatuses"
import { AlertCircle } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EmploymentStatusToolbar } from "../components/toolbars/EmploymentStatusToolbar"
import { EmploymentStatusCard } from "../components/EmploymentStatusCard"
import type { EmploymentStatus } from "../types/employmentStatus"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { XCircle } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").nullable().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  isActive: z.boolean().default(true),
  benefits: z.array(z.string()).default([]) // Only used for display purposes, not sent to backend
})

type FormValues = z.infer<typeof formSchema>

export function EmploymentStatusPage() {
  const { 
    statuses, 
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    isUsingMockData,
    loadStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
    backendStatus
  } = useEmploymentStatuses()
  
  const [open, setOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<EmploymentStatus | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusToDelete, setStatusToDelete] = useState<EmploymentStatus | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#4CAF50",
      isActive: true,
      benefits: []
    }
  })

  // Reset form when editingStatus changes
  useEffect(() => {
    if (editingStatus) {
      form.reset({
        name: editingStatus.name,
        description: editingStatus.description || "",
        color: editingStatus.color,
        isActive: editingStatus.isActive,
        benefits: (editingStatus as any).benefits || []
      })
    } else {
      form.reset({
        name: "",
        description: "",
        color: "#4CAF50",
        isActive: true,
        benefits: []
      })
    }
  }, [editingStatus, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingStatus) {
        await updateStatus(editingStatus.id!, values)
        toast({
          title: "Success",
          description: "Employment status updated successfully"
        })
      } else {
        await addStatus(values)
        toast({
          title: "Success",
          description: "Employment status created successfully"
        })
      }
      setOpen(false)
      setEditingStatus(null)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (status: EmploymentStatus) => {
    try {
      await deleteStatus(status.id!)
      toast({
        title: "Success",
        description: "Employment status deleted successfully"
      })
      setDeleteDialogOpen(false)
      setStatusToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const filteredStatuses = statuses?.filter(status => 
    status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <EmploymentStatusToolbar
        onRefresh={loadStatuses}
        onAddEmploymentStatus={() => setOpen(true)}
        onSearch={setSearchQuery}
        selectedCount={selectedStatuses.length}
        isRefreshing={isRefetching}
      />

      {/* Show mock data alert only when actually using mock data */}
      {isUsingMockData && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Using Mock Data</AlertTitle>
          <AlertDescription className="text-amber-700">
            The system is currently using mock data for employment statuses. 
            Changes will persist in memory during this session but 
            will not be saved to a database.
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
              onClick={() => loadStatuses()}
            >
              Retry API Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {backendStatus === 'offline' && !isUsingMockData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Server Offline</AlertTitle>
          <AlertDescription>
            Cannot connect to the API server. Please ensure the backend is running at the configured URL.
            <div className="mt-2 text-sm">
              <code className="bg-red-950 p-1 rounded text-white">http://localhost:5000</code> - Make sure your backend is running on this port.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {errorMessage || "Failed to load employment statuses. Please check the backend connection."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatuses?.map((status) => (
            <EmploymentStatusCard
              key={status.id}
              status={status}
              employeeCount={status.staffCount || 0}
              onEdit={(status) => {
                setEditingStatus(status)
                setOpen(true)
              }}
              onDelete={(status) => {
                setStatusToDelete(status)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
          {filteredStatuses?.length === 0 && !isLoading && !isError && (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              No employment statuses found. {searchQuery ? "Try a different search term." : "Create one to get started."}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStatus ? "Edit" : "Add"} Employment Status</DialogTitle>
            <DialogDescription>
              {editingStatus ? "Update the" : "Create a new"} employment status details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        Show this employment status as active in the system
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => {
                  const [inputValue, setInputValue] = useState("");
                  
                  const addBenefit = () => {
                    const value = inputValue.trim();
                    if (value && !field.value.includes(value)) {
                      field.onChange([...field.value, value]);
                      setInputValue("");
                    }
                  };
                  
                  const removeBenefit = (index: number) => {
                    const newBenefits = [...field.value];
                    newBenefits.splice(index, 1);
                    field.onChange(newBenefits);
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>Benefits</FormLabel>
                      <FormDescription>
                        Add benefits associated with this employment status
                      </FormDescription>
                      
                      <div className="space-y-4">
                        {/* Display existing benefits as tags */}
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((benefit, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="px-2 py-1 flex items-center gap-1"
                            >
                              {benefit}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive rounded-full"
                                onClick={() => removeBenefit(index)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                          {field.value.length === 0 && (
                            <span className="text-sm text-muted-foreground">No benefits added yet</span>
                          )}
                        </div>
                        
                        {/* Input to add new benefits */}
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter a benefit..."
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addBenefit();
                                }
                              }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            size="sm"
                            onClick={addBenefit}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <DialogFooter>
                <Button type="submit">
                  {editingStatus ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employment Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employment status? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => statusToDelete && handleDelete(statusToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 