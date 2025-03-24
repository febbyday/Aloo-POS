import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
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
  Search,
  Shield,
  Edit,
  Loader2,
  RefreshCw,
  Users,
  Package,
  Receipt,
  Settings,
  DollarSign,
  BarChart,
  UserCircle,
} from "lucide-react"
import { useRoles } from "../hooks/useRoles"
import { Role } from "../types/role"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Define permission modules for easier handling
const permissionModules = [
  { id: "sales", label: "Sales", icon: Receipt },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "staff", label: "Staff", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "customers", label: "Customers", icon: UserCircle },
]

/**
 * A standalone page that lists all roles with their permissions
 * Accessible from the staff submenu
 */
export function PermissionsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { roles, isLoading, error, refreshRoles } = useRoles()
  const navigate = useNavigate()

  // Filter roles based on search query
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if a role has a specific permission module
  const hasPermissionModule = (role: Role, moduleId: string) => {
    if (!role.permissions) return false
    
    const modulePermissions = role.permissions[moduleId as keyof typeof role.permissions]
    if (!modulePermissions) return false
    
    // Check if any permissions within this module are enabled
    const hasEnabledPermissions = Object.values(modulePermissions).some(
      value => value === true || (typeof value === 'string' && value !== 'none')
    )
    
    return hasEnabledPermissions
  }

  // Function to navigate to the role permissions page
  const handleEditPermissions = (roleId: string) => {
    navigate(`/staff/roles/${roleId}/permissions`)
  }

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-muted-foreground">
            View and manage permissions for all roles in the system
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/staff/roles")}>
          <Shield className="h-4 w-4 mr-2" />
          Manage Roles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Role Permissions</CardTitle>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    onClick={() => navigate("/staff/roles")}
                    className="mx-auto"
                  >
                    Manage Roles
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Role</TableHead>
                    <TableHead className="text-center">Sales</TableHead>
                    <TableHead className="text-center">Inventory</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead className="text-center">Financial</TableHead>
                    <TableHead className="text-center">Reports</TableHead>
                    <TableHead className="text-center">Settings</TableHead>
                    <TableHead className="text-center">Customers</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{role.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[230px]">
                            {role.description}
                          </span>
                          <Badge variant="outline" className="mt-1 w-fit">
                            {role.staffCount} {role.staffCount === 1 ? "member" : "members"}
                          </Badge>
                        </div>
                      </TableCell>
                      {permissionModules.map((module) => (
                        <TableCell key={module.id} className="text-center">
                          <div className="flex justify-center">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center",
                              hasPermissionModule(role, module.id) 
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {hasPermissionModule(role, module.id) ? (
                                <module.icon className="h-3.5 w-3.5" />
                              ) : (
                                <span className="text-xs">-</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPermissions(role.id)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">About Permissions</h3>
        <p>
          Permissions are assigned to roles, which can then be assigned to staff members.
          Each staff member inherits the permissions of their assigned role.
        </p>
        <p className="mt-2">
          To edit permissions for a specific role, click the &quot;Edit&quot; button next to the role.
          To manage roles, click the &quot;Manage Roles&quot; button above.
        </p>
      </div>
    </div>
  )
} 