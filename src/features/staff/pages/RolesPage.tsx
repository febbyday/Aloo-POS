import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  Shield,
  Users,
  Package,
  Receipt,
  Settings,
  FileText,
  DollarSign,
  BarChart,
  Loader2,
  RefreshCw,
  Store,
  ShoppingCart,
  CreditCard,
  Wrench,
  Truck,
} from "lucide-react"
import { useRoles } from "../hooks/useRoles.tsx"
import type { IRole } from "../types/role"
import { roleService } from "../services/roleService"
import { toast } from "@/components/ui/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { roleTemplateService } from "../services/roleTemplateService"
import { getDefaultPermissions } from "../types/permissions"
import type { Permissions } from "../types/permissions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Match role service's permission structure
type Permissions = string[] | { modules: string[] };

const permissionsList = [
  { id: "sales", label: "Sales Management", icon: Receipt },
  { id: "shops", label: "Shops Management", icon: Store },
  { id: "markets", label: "Markets Management", icon: ShoppingCart },
  { id: "expenses", label: "Expenses Management", icon: CreditCard },
  { id: "repairs", label: "Repairs Management", icon: Wrench },
  { id: "suppliers", label: "Suppliers Management", icon: Truck },
  { id: "inventory", label: "Inventory Control", icon: Package },
  { id: "staff", label: "Staff Management", icon: Users },
  { id: "customers", label: "Customer Management", icon: Users },
  { id: "reports", label: "Reports Access", icon: BarChart },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "financial", label: "Financial Operations", icon: DollarSign },
]

export function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false)
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const [newRole, setNewRole] = useState<Omit<Role, "id" | "staffCount" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    permissions: getDefaultPermissions(),
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)

  // Use the role hook to fetch and manage roles
  const {
    roles,
    isLoading: roleLoading,
    error,
    refreshRoles,
    createRole,
    updateRole,
    deleteRole
  } = useRoles()

  const navigate = useNavigate()

  // Get available role templates from service
  const availableTemplates = roleTemplateService.getAvailableTemplates()

  // Add cleanupInProgress ref
  const cleanupInProgress = useRef(false);

  // Add this to log mock data status
  useEffect(() => {
    console.log("Using mock data:", roleService.isUsingMockData());
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!showAddRoleDialog) {
      // Reset form state when dialog closes
      setNewRole({
        name: "",
        description: "",
        permissions: getDefaultPermissions(),
        isActive: true
      })
      setSelectedTemplate("none")
    }
  }, [showAddRoleDialog])

  // Apply selected template when it changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "none") {
      // Get the permissions from the selected template
      const templatePermissions = roleTemplateService.getTemplateById(selectedTemplate)

      if (templatePermissions) {
        // Apply the template permissions to the new role
        setNewRole(prev => ({
          ...prev,
          permissions: JSON.parse(JSON.stringify(templatePermissions))
        }))
      }
    }
  }, [selectedTemplate])

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the selected role for editing
  const selectedRole = selectedRoleId
    ? roles.find(role => role.id === selectedRoleId)
    : null

  // Set up edit role form with current role data
  const handleEditClick = (roleId: string) => {
    setSelectedRoleId(roleId)
    const roleToEdit = roles.find(role => role.id === roleId)

    if (roleToEdit) {
      let rolePermissions = getDefaultPermissions();

      // Handle both simple array and complex permissions object
      if (Array.isArray(roleToEdit.permissions)) {
        // Convert string array to permissions object for the UI
        roleToEdit.permissions.forEach(permString => {
          const permModule = permString.split('.')[0];
          if (permModule && rolePermissions[permModule as keyof typeof rolePermissions]) {
            const permAction = permString.split('.')[1];
            if (permAction) {
              const modulePerms = rolePermissions[permModule as keyof typeof rolePermissions];
              if (typeof modulePerms === 'object' && permAction in modulePerms) {
                (modulePerms as any)[permAction] = 'all';
              }
            }
          }
        });
      } else if (typeof roleToEdit.permissions === 'object') {
        // Complex permissions object
        rolePermissions = roleToEdit.permissions as any;
      }

      setNewRole({
        name: roleToEdit.name,
        description: roleToEdit.description,
        permissions: rolePermissions,
        isActive: roleToEdit.isActive
      });
      setShowEditRoleDialog(true);
    }
  };

  // Check if a module has permissions enabled
  const hasModulePermissions = (moduleId: string) => {
    const module = newRole.permissions[moduleId as keyof typeof newRole.permissions] as Record<string, unknown>;
    if (typeof module === 'object' && module !== null) {
      // Check basic CRUD permissions
      if ((module.view as string) !== 'none' || (module.create as string) !== 'none' ||
          (module.edit as string) !== 'none' || (module.delete as string) !== 'none') {
        return true;
      }

      // Check other boolean permissions
      for (const [key, value] of Object.entries(module)) {
        if (typeof value === 'boolean' && value === true) {
          return true;
        }
      }
    }
    return false;
  };

  // Toggle basic module permissions
  const toggleModulePermissions = (moduleId: string, enabled: boolean) => {
    setNewRole(prev => {
      const permissions: Permissions = { ...prev.permissions };
      const module = permissions[moduleId];

      if (module) {
        // Create an updated module with all permissions either enabled or disabled
        const updatedModule: PermissionModule = {
          view: enabled ? 'all' : 'none',
          create: enabled ? 'all' : 'none',
          edit: enabled ? 'all' : 'none',
          delete: enabled ? 'all' : 'none',
          ...module
        };

        // Set CRUD permissions
        updatedModule.view = enabled ? 'all' : 'none';
        updatedModule.create = enabled ? 'all' : 'none';
        updatedModule.edit = enabled ? 'all' : 'none';
        updatedModule.delete = enabled ? 'all' : 'none';

        // Set boolean permissions
        for (const key in updatedModule) {
          if (typeof updatedModule[key as keyof PermissionModule] === 'boolean') {
            (updatedModule as Record<keyof PermissionModule, unknown>)[key] = enabled;
          }
        }

        permissions[moduleId as keyof typeof permissions] = updatedModule;
      }

      return {
        ...prev,
        permissions
      };
    });
  };

  // Handle saving edited role
  const handleEditRole = async () => {
    if (!selectedRoleId) return;

    // Validate role data
    if (!newRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert permissions to array format for API
      const permissionsArray = [];

      // Convert complex permissions object to string array for API
      for (const [moduleName, modulePerms] of Object.entries(newRole.permissions)) {
        if (hasModulePermissions(moduleName)) {
          // Add basic module permission
          permissionsArray.push(moduleName);

          // Add specific permissions
          if (typeof modulePerms === 'object') {
            for (const [action, value] of Object.entries(modulePerms)) {
              if (value === 'all' || value === true) {
                permissionsArray.push(`${moduleName}.${action}`);
              }
            }
          }
        }
      }

      // Create update data
      const updateData = {
        name: newRole.name,
        description: newRole.description,
        permissions: permissionsArray,
        isActive: newRole.isActive
      };

      // Update role
      await updateRole(selectedRoleId, updateData);

      // Close dialog and reset form
      setShowEditRoleDialog(false);
      setSelectedRoleId(null);
      setNewRole({
        name: "",
        description: "",
        permissions: getDefaultPermissions(),
        isActive: true
      });
    } catch (err) {
      // Don't throw the error, just log it
      console.error("Error updating role:", err);

      toast({
        title: "Error updating role",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up delete confirmation
  const handleDeleteClick = (roleId: string) => {
    setSelectedRoleId(roleId)
    setShowDeleteConfirmation(true)
  }

  // Handle confirming role deletion
  const handleDeleteConfirm = async () => {
    if (!selectedRoleId) return

    try {
      // Delete role
      const success = await deleteRole(selectedRoleId)

      if (success) {
        // Close dialog and reset state
        setShowDeleteConfirmation(false)
        setSelectedRoleId(null)
      }
    } catch (err) {
      // Don't throw the error, just log it
      console.error("Error deleting role:", err)
    }
  }

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupInProgress.current = true;
      // Ensure dialogs are closed when component unmounts
      setShowAddRoleDialog(false);
      setShowEditRoleDialog(false);
      setShowDeleteConfirmation(false);
    };
  }, []);

  // Handle dialog close with cleanup
  const handleDialogClose = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
  };

  // Handle adding role with safer state updates
  const handleAddRole = async () => {
    console.log("handleAddRole function called");
    // Validate role data
    if (!newRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Extract active modules into a simple string array of permissions
      const permissionsArray = [];

      // Convert complex permissions object to string array for API
      for (const [moduleName, modulePerms] of Object.entries(newRole.permissions)) {
        if (hasModulePermissions(moduleName)) {
          // Add basic module permission
          permissionsArray.push(moduleName);

          // Add specific permissions
          if (typeof modulePerms === 'object') {
            for (const [action, value] of Object.entries(modulePerms)) {
              if (value === 'all' || value === true) {
                permissionsArray.push(`${moduleName}.${action}`);
              }
            }
          }
        }
      }

      // Create a simplified role object that matches the API expectations
      const roleData = {
        name: newRole.name,
        description: newRole.description || '',
        permissions: permissionsArray,
        isActive: true
      };

      console.log("Creating role with data:", roleData);

      // Call the createRole function from useRoles
      await createRole(roleData);

      // Show success message
      toast({
        title: "Success",
        description: `Role "${newRole.name}" was created successfully.`,
      });

      // Always close the dialog immediately when successful
      handleDialogClose(setShowAddRoleDialog);

      // Only reset form state if component is still mounted
      if (!cleanupInProgress.current) {
        setNewRole({
          name: "",
          description: "",
          permissions: getDefaultPermissions(),
          isActive: true
        });
        setSelectedTemplate("none");
      }
    } catch (err) {
      // Only log the error, don't throw it further
      console.error("Error creating role:", err);

      // Only show toast if not cleaning up
      if (!cleanupInProgress.current) {
        toast({
          title: "Error creating role",
          description: err instanceof Error ? err.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  // Wrap navigation in safe function
  const handleEditPermissions = (roleId: string) => {
    // Set cleanup flag before navigation
    cleanupInProgress.current = true;
    // Close any open dialogs
    setShowEditRoleDialog(false);
    // Then navigate
    navigate(`/staff/roles/${roleId}/permissions`);
  };

  return (
    <div className="w-full py-6 space-y-6">
      {roleService.isUsingMockData() && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertTitle className="text-amber-700">
            Using Mock Data
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            The system is currently using mock data. Changes will persist in memory during this session.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Roles</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for staff members
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/staff/roles/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Keep the dialog for backward compatibility */}
        <Dialog
          open={showAddRoleDialog}
          onOpenChange={(open) => {
            if (!open) handleDialogClose(setShowAddRoleDialog);
            else setShowAddRoleDialog(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="hidden">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and set its permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Enter role description"
                />
              </div>
              <div className="space-y-2">
                <Label>Template (Optional)</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Template</SelectItem>
                    {availableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground pt-1">
                  Selecting a template will apply predefined permissions
                </p>
              </div>
              <div className="space-y-2">
                <Label>Basic Permissions</Label>
                <div className="grid grid-cols-2 gap-4">
                  {permissionsList.map((permission) => {
                    const Icon = permission.icon
                    return (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={hasModulePermissions(permission.id)}
                          onCheckedChange={(checked) =>
                            toggleModulePermissions(permission.id, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-normal flex items-center"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {permission.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For detailed permissions, create the role first then use the Permissions Editor
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogClose(setShowAddRoleDialog)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRole}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Roles</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refreshRoles()}
                disabled={roleLoading}
              >
                {roleLoading ? (
                  <span className="text-xs whitespace-nowrap px-2">Loading...</span>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roleLoading ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-4">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Loading Roles</h3>
                <p className="text-muted-foreground">
                  Please wait while we retrieve the staff roles...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium text-destructive">Failed to load roles</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the roles data
              </p>
              <Button
                variant="outline"
                onClick={() => refreshRoles()}
                className="mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground">
                    No roles match your search query
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">No roles available</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first role to get started
                  </p>
                  <Button
                    onClick={() => setShowAddRoleDialog(true)}
                    className="mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-6 border rounded-lg space-y-4"
                  onClick={() => navigate(`/staff/roles/${role.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {role.staffCount} {role.staffCount === 1 ? "member" : "members"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {permissionsList.map((permission) => {
                      const Icon = permission.icon
                      const hasPermission = Object.values(role.permissions[permission.id as keyof typeof role.permissions] || {}).some(
                        value => value === true || (typeof value === 'string' && value !== 'none')
                      )
                      return (
                        <div
                          key={permission.id}
                          className={cn(
                            "flex items-center space-x-2 p-2 rounded",
                            hasPermission ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{permission.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/staff/roles/${role.id}/edit`);
                      }}
                    >
                      Edit Role
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPermissions(role.id);
                      }}
                    >
                      Edit Permissions
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(role.id);
                      }}
                    >
                      Delete Role
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={showEditRoleDialog}
        onOpenChange={(open) => {
          if (!open) handleDialogClose(setShowEditRoleDialog);
          else setShowEditRoleDialog(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify this role and its permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Enter role description"
              />
            </div>
            <div className="space-y-2">
              <Label>Apply Template</Label>
              <Select
                onValueChange={(value) => {
                  if (value && value !== "none") {
                    // Apply the selected template to the role being edited
                    const templatePermissions = roleTemplateService.getTemplateById(value)
                    if (templatePermissions) {
                      setNewRole(prev => ({
                        ...prev,
                        permissions: JSON.parse(JSON.stringify(templatePermissions))
                      }))
                    }
                  }
                }}
                defaultValue="none"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template to apply" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {availableTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground pt-1">
                This will replace all current permissions with the template values
              </p>
            </div>
            <div className="space-y-2">
              <Label>Basic Permissions</Label>
              <div className="grid grid-cols-2 gap-4">
                {permissionsList.map((permission) => {
                  const Icon = permission.icon
                  return (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-permission-${permission.id}`}
                        checked={hasModulePermissions(permission.id)}
                        onCheckedChange={(checked) =>
                          toggleModulePermissions(permission.id, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`edit-permission-${permission.id}`}
                        className="text-sm font-normal flex items-center"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {permission.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (selectedRoleId) {
                    handleEditPermissions(selectedRoleId)
                  }
                }}
              >
                Open Detailed Permissions Editor
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onOpenChange={(open) => {
          if (!open) handleDialogClose(setShowDeleteConfirmation);
          else setShowDeleteConfirmation(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role?
              {selectedRole && selectedRole.staffCount > 0 && (
                <p className="text-destructive font-medium mt-2">
                  This role is currently assigned to {selectedRole.staffCount} staff member(s).
                  Deleting it will remove the role from these staff members.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
