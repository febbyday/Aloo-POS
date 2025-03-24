/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

import { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEmploymentTypes } from "../hooks/useEmploymentTypes"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { AlertCircle, PlusCircle, RefreshCw } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { EmploymentType } from "../types/employmentType"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { employmentTypeService } from "../services/employmentTypeService"

// Form schema for employment type
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  benefits: z.string().transform(value => 
    value.split(',').map(benefit => benefit.trim()).filter(benefit => benefit.length > 0)
  )
})

type FormValues = z.infer<typeof formSchema>

export const EmploymentTypePage = () => {
  const { 
    data: employmentTypes, 
    isLoading,
    isRefetching,
    error,
    refetch,
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType
  } = useEmploymentTypes()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingType, setEditingType] = useState<EmploymentType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<EmploymentType | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // Check if we're using mock data
  useEffect(() => {
    setUsingMockData(employmentTypeService.isUsingMockData())
  }, [employmentTypes])

  // Initialize form with default values or editing values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingType?.name || "",
      description: editingType?.description || "",
      color: editingType?.color || "#4CAF50",
      benefits: editingType ? editingType.benefits.join(", ") : ""
    }
  })

  // Reset form when editingType changes
  useState(() => {
    if (editingType) {
      form.reset({
        name: editingType.name,
        description: editingType.description,
        color: editingType.color,
        benefits: editingType.benefits.join(", ")
      })
    } else {
      form.reset({
        name: "",
        description: "",
        color: "#4CAF50",
        benefits: ""
      })
    }
  }, [editingType, form])

  // Handle form submission for create or update
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      if (editingType) {
        // Update existing type
        await updateEmploymentType(editingType.id!, values)
        toast({
          title: "Employment type updated",
          description: `${values.name} has been updated successfully.`,
        })
      } else {
        // Create new type
        await createEmploymentType(values)
        toast({
          title: "Employment type created",
          description: `${values.name} has been added successfully.`,
        })
      }
      
      form.reset()
      setOpen(false)
      setEditingType(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: `Failed to ${editingType ? 'update' : 'create'} employment type: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      // Update mock data status after operation
      setUsingMockData(employmentTypeService.isUsingMockData())
    }
  }

  // Handle edit button click
  const handleEdit = (type: EmploymentType) => {
    setEditingType(type)
    form.reset({
      name: type.name,
      description: type.description,
      color: type.color,
      benefits: type.benefits.join(", ")
    })
    setOpen(true)
  }

  // Handle delete confirmation
  const handleDelete = async (type: EmploymentType) => {
    try {
      await deleteEmploymentType(type.id!)
      toast({
        title: "Employment type deleted",
        description: `${type.name} has been removed successfully.`,
      })
      setDeleteDialogOpen(false)
      setTypeToDelete(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: `Failed to delete employment type: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      // Update mock data status after operation
      setUsingMockData(employmentTypeService.isUsingMockData())
    }
  }

  // Close dialogs and reset state
  const handleDialogClose = () => {
    setEditingType(null)
    form.reset({
      name: "",
      description: "",
      color: "#4CAF50",
      benefits: ""
    })
  }

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Employment types data has been refreshed.",
    });
    // Update mock data status after refresh
    setUsingMockData(employmentTypeService.isUsingMockData())
  };

  // Generate custom columns with edit/delete handlers
  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: (type) => {
      setTypeToDelete(type)
      setDeleteDialogOpen(true)
    }
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employment Types"
        description="Manage staff employment classifications"
        children={
          <>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Dialog open={open} onOpenChange={(open) => {
                setOpen(open)
                if (!open) handleDialogClose()
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Employment Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? "Edit Employment Type" : "Add Employment Type"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingType
                        ? "Update employment type details."
                        : "Create a new employment type for staff classification."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full-time" {...field} />
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
                              <Textarea 
                                placeholder="Standard 40-hour work week with full benefits package" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-6 rounded-full border" 
                                style={{ backgroundColor: field.value }}
                              />
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="benefits"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Benefits</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Health Insurance, Paid Time Off, 401(k)" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Enter benefits separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting 
                            ? (editingType ? "Updating..." : "Creating...") 
                            : (editingType ? "Update" : "Create")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </>
        }
      />

      {/* Mock Data Alert */}
      {usingMockData && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Using Mock Data</AlertTitle>
          <AlertDescription className="text-amber-700">
            The backend API for employment types is currently unavailable. 
            Using mock data instead. Changes will persist in memory during this session but 
            will not be saved to the database.
          </AlertDescription>
        </Alert>
      )}

      {/* Show error alert if API call failed */}
      {error && !usingMockData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading employment types</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to fetch data from the API. Please refresh and try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employment Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employment type?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will delete the{' '}
                {typeToDelete?.name} employment type
                {usingMockData ? ' from memory.' : ' from the database.'} 
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => typeToDelete && handleDelete(typeToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Types Data Table */}
      <DataTable
        columns={tableColumns}
        data={employmentTypes || []}
        isLoading={isLoading}
        searchKey="name"
      />

      {/* Status Information Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {usingMockData ? "Using Mock Data" : "Connected to API"}
        </AlertTitle>
        <AlertDescription>
          {usingMockData 
            ? "This module is currently using mock data due to API connection failure. Changes are stored in memory for this session only."
            : "This module is connected to the backend API at /api/employment-types. All changes are persisted to the database."}
        </AlertDescription>
      </Alert>
    </div>
  )
}
