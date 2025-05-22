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
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { useToast } from "@/lib/toast"
import { Loader2, Shield } from "lucide-react"
import { roleFormSchema, RoleFormData } from "../../types/RoleFormData"
import { getDefaultPermissions, Permissions } from "../../types/permissions"
import { roleTemplateService } from "../../services/roleTemplateService"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isReadOnly = false
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoleFormData) => void
  initialData?: Partial<RoleFormData>
  isReadOnly?: boolean
}) {
  const [activeTab, setActiveTab] = useState("general")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const availableTemplates = roleTemplateService.getAvailableTemplates()

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: getDefaultPermissions(),
      isActive: true,
      staffCount: 0,
      ...initialData,
    },
  })

  // Apply template when selected
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)

    if (templateId === "none") {
      // Reset to default permissions
      form.setValue("permissions", getDefaultPermissions())
    } else {
      // Apply template permissions
      const templatePermissions = roleTemplateService.getTemplateById(templateId)
      if (templatePermissions) {
        form.setValue("permissions", templatePermissions)
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (data: RoleFormData) => {
    if (isReadOnly) return

    setIsSubmitting(true)

    // Set a timeout to prevent the UI from being stuck if the API call hangs
    const submissionTimeout = setTimeout(() => {
      if (isSubmitting) {
        console.warn("Role submission is taking longer than expected");
        toast({
          title: "Submission Taking Longer Than Expected",
          description: "The server is taking longer than expected to respond. Please wait...",
          variant: "default"
        });
      }
    }, 10000); // Show a message after 10 seconds

    try {
      console.log("Form data before submission:", data);

      // Call the parent component's onSubmit function with a timeout
      const submitPromise = onSubmit({
        ...data,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error("Submission timeout - UI safeguard"));
        }, 60000); // 60 second UI-level timeout as a safeguard
      });

      // Race the submission against the timeout
      await Promise.race([submitPromise, timeoutPromise]);

      // Reset form if it's an add operation (no initialData)
      if (!initialData) {
        form.reset({
          name: "",
          description: "",
          permissions: getDefaultPermissions(),
          isActive: true,
          staffCount: 0,
        })
        setSelectedTemplate("none")
      }
    } catch (error) {
      console.error("Error submitting role form:", error);

      // Check if it's a timeout error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('timed out');

      if (isTimeoutError) {
        toast({
          title: "Submission Timeout",
          description: "The server is taking too long to respond. Your role may still be created in the background. Please check the roles list after a few moments.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to save role",
          variant: "destructive"
        });
      }
    } finally {
      clearTimeout(submissionTimeout);
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl mx-auto">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "Role Details" : initialData ? "Edit Role" : "Add New Role"}</DialogTitle>
          <DialogDescription>
            {isReadOnly ? "View role details below." : "Enter the role details below. All fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormFieldWrapper label="Role Name">
                      <Input
                        placeholder="Enter role name"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormFieldWrapper>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormFieldWrapper label="Description">
                      <Textarea
                        placeholder="Enter role description"
                        {...field}
                        disabled={isReadOnly}
                        rows={3}
                      />
                    </FormFieldWrapper>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Inactive roles cannot be assigned to staff members.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly || initialData?.isSystemRole}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isReadOnly && !initialData && (
                  <div className="space-y-2">
                    <FormLabel>Apply Template</FormLabel>
                    <Select
                      value={selectedTemplate}
                      onValueChange={handleTemplateChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Template</SelectItem>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Templates provide predefined sets of permissions for common roles
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Permission Settings</h3>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // This would typically navigate to a detailed permissions editor
                          toast({
                            title: "Info",
                            description: "For detailed permission editing, use the Permissions Management page.",
                          });
                        }}
                      >
                        Advanced Permissions Editor
                      </Button>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    For detailed permission configuration, please use the Permissions Management page after creating the role.
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {!isReadOnly && (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isReadOnly}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {initialData ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{initialData ? "Update Role" : "Create Role"}</>
                  )}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}