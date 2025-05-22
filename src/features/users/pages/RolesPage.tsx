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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils/cn';
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
  Database,
} from "lucide-react"
import { useRoles } from "@/features/users/hooks/useRoles"
import type { IRole } from "@/features/users/types/role"
import { roleService } from "@/features/users/services"
import { toast } from "@/lib/toast"
import { Link, useNavigate } from "react-router-dom"
import { permissionsToStringArray } from "@/shared/utils/permissionUtils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Using standardized Permissions type from shared/schemas/permissions

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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Use the role hook to fetch and manage roles
  const {
    roles,
    isLoading: roleLoading,
    error,
    refreshRoles,
    updateRole,
    deleteRole
  } = useRoles()

  // Log roles for debugging
  useEffect(() => {
    if (roles.length > 0) {
      console.log('Roles loaded from API:', roles);
    }
  }, [roles])

  const navigate = useNavigate()

  // Add cleanupInProgress ref
  const cleanupInProgress = useRef(false);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the selected role for editing
  const selectedRole = selectedRoleId
    ? roles.find(role => role.id === selectedRoleId)
    : null

  // Navigate to edit page for a role
  const handleEditClick = (roleId: string) => {
    navigate(`/users/roles/${roleId}/edit`);
  };



  // This function is no longer needed as we navigate to the edit page

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
      setShowDeleteConfirmation(false);
    };
  }, []);

  // Handle dialog close with cleanup
  const handleDialogClose = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
  };

  // Wrap navigation in safe function
  const handleEditPermissions = (roleId: string) => {
    // Set cleanup flag before navigation
    cleanupInProgress.current = true;
    // Then navigate
    navigate(`/users/roles/${roleId}/permissions`);
  };

  return (
    <div className="w-full py-6 space-y-6">


      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Roles</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for staff members
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/users/roles/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
          <Button
            variant="outline"
            onClick={() => refreshRoles()}
            disabled={roleLoading}
          >
            {roleLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Roles
          </Button>
        </div>
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
                    onClick={() => navigate('/users/roles/new')}
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
                  onClick={() => navigate(`/users/roles/${role.id}`)}
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
                      // Check if the module exists in permissions
                      const modulePermissions = role.permissions[permission.id as keyof typeof role.permissions];

                      // Determine if the module has any permissions
                      const hasPermission = modulePermissions ? Object.entries(modulePermissions).some(
                        ([key, value]) => {
                          // Check for boolean true values
                          if (typeof value === 'boolean') return value === true;

                          // Check for string values that aren't 'none' or 'NONE'
                          if (typeof value === 'string') {
                            return value.toLowerCase() !== 'none';
                          }

                          // Check for numeric values that aren't 0 (NONE)
                          if (typeof value === 'number') {
                            return value !== 0;
                          }

                          return false;
                        }
                      ) : false;

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
                        navigate(`/users/roles/${role.id}/edit`);
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
