import { useState, useEffect } from "react"
import { useEmploymentTypes } from "../hooks/useEmploymentTypes"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/lib/toast"
import { EmploymentType } from "../types/employmentType"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { employmentTypeService } from "../services/employmentTypeService"
import { EmploymentTypesToolbar } from "../components/toolbars/EmploymentTypesToolbar"
import { EmploymentTypeCard } from "../components/EmploymentTypeCard"

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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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
  useEffect(() => {
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
        toast.success("Employment type updated", `${values.name} has been updated successfully.`)
      } else {
        // Create new type
        await createEmploymentType(values)
        toast.success("Employment type created", `${values.name} has been added successfully.`)
      }

      form.reset()
      setOpen(false)
      setEditingType(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", `Failed to ${editingType ? 'update' : 'create'} employment type: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
      setUsingMockData(employmentTypeService.isUsingMockData())
    }
  }

  // Handle delete confirmation
  const handleDelete = async (type: EmploymentType) => {
    try {
      await deleteEmploymentType(type.id!)
      toast.success("Employment type deleted", `${type.name} has been removed successfully.`)
      setDeleteDialogOpen(false)
      setTypeToDelete(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", `Failed to delete employment type: ${errorMessage}`)
    } finally {
      setUsingMockData(employmentTypeService.isUsingMockData())
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTypes.map(id => deleteEmploymentType(id)))
      toast.success("Employment types deleted", `${selectedTypes.length} employment type(s) have been removed successfully.`)
      setSelectedTypes([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", `Failed to delete employment types: ${errorMessage}`)
    } finally {
      setUsingMockData(employmentTypeService.isUsingMockData())
    }
  }

  // Handle view details
  const handleViewDetails = () => {
    if (selectedTypes.length === 1) {
      const type = employmentTypes?.find(t => t.id === selectedTypes[0])
      if (type) {
        setEditingType(type)
        setOpen(true)
      }
    }
  }

  // Filter employment types based on search query
  const filteredTypes = employmentTypes?.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <EmploymentTypesToolbar
        onRefresh={refetch}
        onFilter={() => {/* TODO: Implement filtering */}}
        onExport={() => {/* TODO: Implement export */}}
        onAddEmploymentType={() => setOpen(true)}
        onSearch={setSearchQuery}
        onViewDetails={handleViewDetails}
        onDelete={handleBulkDelete}
        selectedCount={selectedTypes.length}
      />

      {/* Mock Data Alert */}
      {usingMockData && (
        <Alert className="bg-amber-50 border-amber-200">
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

      {/* Add/Edit Employment Type Dialog */}
              <Dialog open={open} onOpenChange={(open) => {
                setOpen(open)
        if (!open) {
          setEditingType(null)
          form.reset({
            name: "",
            description: "",
            color: "#4CAF50",
            benefits: []
          })
        }
      }}>
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
                        name="benefits"
                        render={({ field }) => (
                          <FormItem>
                    <FormLabel>Benefits (comma-separated)</FormLabel>
                            <FormControl>
                      <Input
                                placeholder="Health Insurance, Paid Time Off, 401(k)"
                                {...field}
                              />
                            </FormControl>
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

      {/* Employment Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes?.map((type) => (
          <EmploymentTypeCard
            key={type.id}
            type={type}
            employeeCount={type.staffCount || 0}
            onEdit={(type) => {
              setEditingType(type)
              setOpen(true)
            }}
            onDelete={(type) => {
              setTypeToDelete(type)
              setDeleteDialogOpen(true)
            }}
          />
        ))}
      </div>
    </div>
  )
}