import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Users,
  Lock,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useToast } from "@/lib/toast"

import { useRoleHistory } from '../context/RoleHistoryContext'
import { LoadingState } from '@/components/ui/loading-state'
// Import from the main users module instead of the staff module
import { roleService } from "@/features/users/services/roleService"
import { Role } from "@/features/users/types/role"
import { useRoles } from "@/features/users/hooks/useRoles"
import { RoleModal } from "../components/roles/RoleModal"

export function RoleDetailsPage() {
  const { roleId } = useParams()
  const navigate = useNavigate()
  const { getRoleById, deleteRole } = useRoles()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const showToast = useToastManager()
  const { trackAction } = useRoleHistory()

  // Fetch role details from API
  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        setError("Role ID is missing")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const roleData = await getRoleById(roleId)

        if (!roleData) {
          setError("Role not found")
          toast({
            title: "Error",
            description: "Role not found.",
            variant: "destructive"
          })
        } else {
          setRole(roleData)
        }
      } catch (error) {
        console.error("Error fetching role details:", error)
        setError("Failed to load role details")
        toast({
          title: "Error",
          description: "Failed to load role details. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [roleId, getRoleById, toast])

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!roleId || !role) return

    try {
      await deleteRole(roleId)

      // Track this action for history
      trackAction(
        {
          type: 'delete_role',
          role: role
        },
        `Deleted role "${role.name}"`
      )

      showToast.success('Success', 'Role deleted successfully')
      navigate('/users/roles')
    } catch (error) {
      console.error('Error deleting role:', error)
      showToast.error('Error', 'Failed to delete role')
    }
  }

  const handleEditSubmit = async (data: any) => {
    if (!roleId || !role) return

    try {
      // In a real implementation, this would call the API to update the role
      // For now, we'll just update the local state
      const updatedRole = {
        ...role,
        ...data,
        updatedAt: new Date().toISOString()
      }

      setRole(updatedRole)

      // Track this action for history
      trackAction(
        {
          type: 'update_role',
          id: roleId,
          before: role,
          after: updatedRole
        },
        `Updated role "${data.name}"`
      )

      setIsEditModalOpen(false)
      showToast.success('Success', 'Role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      showToast.error('Error', 'Failed to update role')
    }
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold">Role not found</h2>
        <Button
          variant="link"
          onClick={(e) => {
            e.preventDefault();
            navigate("/staff/roles", { replace: true });
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Roles List
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LoadingState
        isLoading={isLoading}
        loadingText="Loading role details..."
        center
      >
        {role && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/users/roles", { replace: true });
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{role.name}</h1>
                <Badge variant={role.isActive ? "default" : "secondary"}>
                  {role.isActive ? "Active" : "Inactive"}
                </Badge>
                {role.isSystemRole && (
                  <Badge variant="outline" className="ml-2">
                    System Role
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  disabled={role.isSystemRole}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Role
                </Button>

                {!role.isSystemRole && (
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    Role Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{role.description || "No description provided"}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Staff Count</h3>
                      <p className="mt-1">{role.staffCount} {role.staffCount === 1 ? "member" : "members"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <div className="flex items-center mt-1">
                        {role.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span>Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-primary" />
                    Permissions Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This role has permissions configured for the following areas:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {Object.keys(role.permissions).map((module) => (
                        <Badge key={module} variant="outline" className="capitalize">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/users/roles/${role.id}/permissions`)}
                  >
                    View Detailed Permissions
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Assigned Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This role is currently assigned to {role.staffCount} staff {role.staffCount === 1 ? "member" : "members"}.
                    </p>

                    {role.staffCount > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm">View the list of staff members with this role.</p>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No staff members are currently assigned to this role.
                      </div>
                    )}
                  </div>
                </CardContent>
                {role.staffCount > 0 && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/users?role=${role.id}`)}
                    >
                      View Assigned Staff
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            <Tabs defaultValue="permissions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="permissions" className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Detailed Permissions
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Role History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Permission Details</CardTitle>
                    <CardDescription>
                      Detailed view of all permissions assigned to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      For a more detailed view and management of permissions, please use the Permissions Management page.
                    </div>

                    <Button
                      onClick={() => navigate(`/users/roles/${role.id}/permissions`)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role History</CardTitle>
                    <CardDescription>
                      History of changes made to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground italic">
                      Role history tracking is not available in this version.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </LoadingState>

      <RoleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={role}
        onSubmit={handleEditSubmit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove it from any staff members it's assigned to.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
