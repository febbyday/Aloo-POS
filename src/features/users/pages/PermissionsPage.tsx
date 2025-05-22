import { useState, useEffect, Fragment } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import {
  ArrowLeft,
  Shield,
  Save,
  Users,
  Package,
  Receipt,
  Settings,
  FileText,
  DollarSign,
  BarChart,
  UserCircle,
  Loader2,
  AlertTriangle,
  Store,
  ShoppingCart,
  CreditCard,
  Wrench,
  Truck,
  ChevronLeft,
  RefreshCw
} from "lucide-react"
import { useRoles } from "../hooks/useRoles"
import { Role } from "@/features/users/types/role"
import {
  AccessLevel,
  Permissions,
  getDefaultPermissions
} from "../types/permissions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { roleTemplateService } from "../services/roleTemplateService"

// Module definitions for UI
const modules = [
  { id: "sales", label: "Sales", icon: Receipt, color: "text-green-500" },
  { id: "shops", label: "Shops", icon: Store, color: "text-indigo-500" },
  { id: "markets", label: "Markets", icon: ShoppingCart, color: "text-purple-500" },
  { id: "expenses", label: "Expenses", icon: CreditCard, color: "text-pink-500" },
  { id: "repairs", label: "Repairs", icon: Wrench, color: "text-amber-500" },
  { id: "suppliers", label: "Suppliers", icon: Truck, color: "text-teal-500" },
  { id: "inventory", label: "Inventory", icon: Package, color: "text-blue-500" },
  { id: "staff", label: "Staff", icon: Users, color: "text-violet-500" },
  { id: "reports", label: "Reports", icon: BarChart, color: "text-yellow-500" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  { id: "financial", label: "Financial", icon: DollarSign, color: "text-emerald-500" },
  { id: "customers", label: "Customers", icon: UserCircle, color: "text-orange-500" },
]

// Helper function to format text
const formatTitle = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, ' $1')
}

// Component to render access level selector
const AccessLevelSelector = ({ value, onChange, disabled = false }: {
  value: AccessLevel,
  onChange: (value: AccessLevel) => void,
  disabled?: boolean
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as AccessLevel)}
      disabled={disabled}
    >
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Access Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AccessLevel.NONE}>No Access</SelectItem>
        <SelectItem value={AccessLevel.SELF}>Self Only</SelectItem>
        <SelectItem value={AccessLevel.DEPARTMENT}>Department</SelectItem>
        <SelectItem value={AccessLevel.ALL}>Full Access</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function PermissionsPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const { roles, getRoleById, updateRole, isLoading, error } = useRoles()

  const [activeTab, setActiveTab] = useState("sales")
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permissions>(getDefaultPermissions())
  const [isSaving, setIsSaving] = useState(false)
  const [permissionsError, setPermissionsError] = useState<string | null>(null)
  // Add a loadingRole state to track the specific role loading state
  const [loadingRole, setLoadingRole] = useState<boolean>(true);

  // Load role data on mount or when roleId changes
  useEffect(() => {
    setPermissionsError(null); // Reset error state
    setLoadingRole(true); // Set loading state when roleId changes

    if (roleId) {
      // Only attempt to find the role if we're not in a loading state
      // and roles have been loaded
      if (!isLoading) {
        const foundRole = roles.find(r => r.id === roleId);
        if (foundRole) {
          setRole(foundRole);
          // Ensure all required permission categories exist by merging with default permissions
          const defaultPerms = getDefaultPermissions();
          setPermissions({
            ...defaultPerms,
            ...foundRole.permissions
          });
          setLoadingRole(false); // Done loading this role
        } else if (roles.length > 0) {
          // Only show "not found" error if roles are loaded and the list is not empty
          setPermissionsError(`Role with ID "${roleId}" not found.`);
          setLoadingRole(false); // Done attempting to load
        }
      }
    } else {
      setLoadingRole(false); // No roleId provided
    }
  }, [roleId, roles, isLoading]);

  // Handle permissions change for standard CRUD operations
  const handlePermissionChange = (
    module: keyof Permissions,
    action: string,
    value: AccessLevel | boolean
  ) => {
    setPermissions(prev => {
      // Create a deep copy of permissions to avoid mutation
      const updated = { ...prev };

      // Ensure the module exists
      if (!updated[module]) {
        // Initialize with defaults from getDefaultPermissions
        const defaults = getDefaultPermissions();
        updated[module] = defaults[module];
      }

      // Update the specific permission
      return {
        ...updated,
        [module]: {
          ...updated[module],
          [action]: value
        }
      };
    });
  }

  // Save updated permissions
  const handleSave = async () => {
    if (!role) return

    setIsSaving(true)
    try {
      await updateRole(role.id, {
        permissions
      })
      toast({
        title: "Permissions Updated",
        description: `Permissions for ${role.name} have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Modified loading display with improved loading state
  if (isLoading || loadingRole) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users/roles")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Role Permissions</h1>
            <p className="text-muted-foreground">Loading role details...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading permissions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/users/roles")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Error Loading Roles
              </h1>
              <p className="text-muted-foreground">
                There was a problem loading role data
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>{error.message || "An unexpected error occurred while loading roles."}</p>
              <div className="flex space-x-4">
                <Button onClick={() => navigate("/users/roles")}>
                  Return to Roles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/users/roles")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Role Not Found
              </h1>
              <p className="text-muted-foreground">
                The requested role could not be found
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>{permissionsError}</p>
              <div className="flex space-x-4">
                <Button onClick={() => navigate("/users/roles")}>
                  Return to Roles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // After the loading and error checks, add this check for when no role is found but loading is finished
  if (!role && !isLoading && !loadingRole && !permissionsError) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/users/roles")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-amber-600 flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Role Not Available
              </h1>
              <p className="text-muted-foreground">
                The requested role could not be loaded
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>No role information is available for the selected role. This may be because the role doesn't exist or there was an error loading it.</p>
              <div className="flex space-x-4">
                <Button onClick={() => navigate("/users/roles")}>
                  Return to Roles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users/roles")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Shield className="mr-2 h-8 w-8 text-primary" />
              {role.name} Permissions
            </h1>
            <p className="text-muted-foreground">
              Configure detailed permissions for this role
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Role Information</AlertTitle>
        <AlertDescription>
          This role is currently assigned to {role.staffCount} staff member(s).
          Changes to permissions will affect all users with this role.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-12 h-14">
          {modules.map(module => (
            <TabsTrigger
              key={module.id}
              value={module.id}
              className="flex flex-col items-center justify-center space-y-0.5 py-1 h-full"
            >
              <module.icon className={`h-5 w-5 ${module.color}`} />
              <span className="text-xs font-medium">{module.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Sales Module Permissions */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5 text-green-500" />
                Sales Permissions
              </CardTitle>
              <CardDescription>
                Control access to sales transactions, discounts, refunds, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template selector for this module */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Apply Template for Sales Permissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Quick-apply permissions from a predefined template
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          // Update only the sales permissions from the selected template
                          const updatedRole = roleTemplateService.mergeModuleFromTemplate(
                            role,
                            value,
                            'sales'
                          );
                          setPermissions(updatedRole.permissions);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleTemplateService.getAvailableTemplates().map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Standard CRUD permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Access</h3>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="font-medium">Action</div>
                  <div className="font-medium text-center">No Access</div>
                  <div className="font-medium text-center">Self Only</div>
                  <div className="font-medium text-center">Department</div>
                  <div className="font-medium text-center">Full Access</div>

                  <div>View Sales</div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.view === AccessLevel.NONE}
                      onCheckedChange={() => handlePermissionChange('sales', 'view', AccessLevel.NONE)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.view === AccessLevel.SELF}
                      onCheckedChange={() => handlePermissionChange('sales', 'view', AccessLevel.SELF)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.view === AccessLevel.DEPARTMENT}
                      onCheckedChange={() => handlePermissionChange('sales', 'view', AccessLevel.DEPARTMENT)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.view === AccessLevel.ALL}
                      onCheckedChange={() => handlePermissionChange('sales', 'view', AccessLevel.ALL)}
                    />
                  </div>

                  <div>Create Sales</div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.create === AccessLevel.NONE}
                      onCheckedChange={() => handlePermissionChange('sales', 'create', AccessLevel.NONE)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.create === AccessLevel.SELF}
                      onCheckedChange={() => handlePermissionChange('sales', 'create', AccessLevel.SELF)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.create === AccessLevel.DEPARTMENT}
                      onCheckedChange={() => handlePermissionChange('sales', 'create', AccessLevel.DEPARTMENT)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.create === AccessLevel.ALL}
                      onCheckedChange={() => handlePermissionChange('sales', 'create', AccessLevel.ALL)}
                    />
                  </div>

                  <div>Edit Sales</div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.edit === AccessLevel.NONE}
                      onCheckedChange={() => handlePermissionChange('sales', 'edit', AccessLevel.NONE)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.edit === AccessLevel.SELF}
                      onCheckedChange={() => handlePermissionChange('sales', 'edit', AccessLevel.SELF)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.edit === AccessLevel.DEPARTMENT}
                      onCheckedChange={() => handlePermissionChange('sales', 'edit', AccessLevel.DEPARTMENT)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.edit === AccessLevel.ALL}
                      onCheckedChange={() => handlePermissionChange('sales', 'edit', AccessLevel.ALL)}
                    />
                  </div>

                  <div>Delete Sales</div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.delete === AccessLevel.NONE}
                      onCheckedChange={() => handlePermissionChange('sales', 'delete', AccessLevel.NONE)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.delete === AccessLevel.SELF}
                      onCheckedChange={() => handlePermissionChange('sales', 'delete', AccessLevel.SELF)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.delete === AccessLevel.DEPARTMENT}
                      onCheckedChange={() => handlePermissionChange('sales', 'delete', AccessLevel.DEPARTMENT)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.delete === AccessLevel.ALL}
                      onCheckedChange={() => handlePermissionChange('sales', 'delete', AccessLevel.ALL)}
                    />
                  </div>

                  <div>View Sales History</div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.viewSalesHistory === AccessLevel.NONE}
                      onCheckedChange={() => handlePermissionChange('sales', 'viewSalesHistory', AccessLevel.NONE)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.viewSalesHistory === AccessLevel.SELF}
                      onCheckedChange={() => handlePermissionChange('sales', 'viewSalesHistory', AccessLevel.SELF)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.viewSalesHistory === AccessLevel.DEPARTMENT}
                      onCheckedChange={() => handlePermissionChange('sales', 'viewSalesHistory', AccessLevel.DEPARTMENT)}
                    />
                  </div>
                  <div className="text-center">
                    <Checkbox
                      checked={permissions.sales.viewSalesHistory === AccessLevel.ALL}
                      onCheckedChange={() => handlePermissionChange('sales', 'viewSalesHistory', AccessLevel.ALL)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Feature-specific permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Special Functions</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="processRefunds">Process Refunds</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow issuing refunds for transactions
                      </p>
                    </div>
                    <Switch
                      id="processRefunds"
                      checked={permissions.sales.processRefunds}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'processRefunds', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="applyDiscounts">Apply Discounts</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow applying discounts to transactions
                      </p>
                    </div>
                    <Switch
                      id="applyDiscounts"
                      checked={permissions.sales.applyDiscounts}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'applyDiscounts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageCategories">Manage Categories</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing product categories
                      </p>
                    </div>
                    <Switch
                      id="manageCategories"
                      checked={permissions.sales.manageCategories}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'manageCategories', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="scheduleReports">Schedule Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow scheduling automated reports
                      </p>
                    </div>
                    <Switch
                      id="scheduleReports"
                      checked={permissions.sales.scheduleReports}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'scheduleReports', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageUsers">Manage Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing system users
                      </p>
                    </div>
                    <Switch
                      id="manageUsers"
                      checked={permissions.sales.manageUsers}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'manageUsers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reconcileTill">Reconcile Till</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow reconciling cash registers/tills
                      </p>
                    </div>
                    <Switch
                      id="reconcileTill"
                      checked={permissions.sales.reconcileTill}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'reconcileTill', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="viewPurchaseHistory">View Purchase History</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow viewing customer purchase history
                      </p>
                    </div>
                    <Switch
                      id="viewPurchaseHistory"
                      checked={permissions.sales.viewPurchaseHistory}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'viewPurchaseHistory', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="viewPerformance">View Performance</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow viewing shop performance metrics
                      </p>
                    </div>
                    <Switch
                      id="viewPerformance"
                      checked={permissions.sales.viewPerformance}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'viewPerformance', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageCompetitors">Manage Competitors</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing competitor information
                      </p>
                    </div>
                    <Switch
                      id="manageCompetitors"
                      checked={permissions.sales.manageCompetitors}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'manageCompetitors', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="approveExpenses">Approve Expenses</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow approving expense requests
                      </p>
                    </div>
                    <Switch
                      id="approveExpenses"
                      checked={permissions.sales.approveExpenses}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'approveExpenses', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderParts">Order Parts</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow ordering parts for repairs
                      </p>
                    </div>
                    <Switch
                      id="orderParts"
                      checked={permissions.sales.orderParts}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'orderParts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageContracts">Manage Contracts</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing supplier contracts
                      </p>
                    </div>
                    <Switch
                      id="manageContracts"
                      checked={permissions.sales.manageContracts}
                      onCheckedChange={(checked) => handlePermissionChange('sales', 'manageContracts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Alert className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sales permissions should be granted carefully as they can affect
                  financial data and customer transactions.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Staff Module Permissions */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-violet-500" />
                Staff Permissions
              </CardTitle>
              <CardDescription>
                Control access to staff management, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template selector for this module */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Apply Template for Staff Permissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Quick-apply permissions from a predefined template
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          // Update only the staff permissions from the selected template
                          const updatedRole = roleTemplateService.mergeModuleFromTemplate(
                            role,
                            value,
                            'staff'
                          );
                          setPermissions(updatedRole.permissions);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleTemplateService.getAvailableTemplates().map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Standard CRUD permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Access</h3>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="font-medium">Action</div>
                  <div className="font-medium text-center">No Access</div>
                  <div className="font-medium text-center">Self Only</div>
                  <div className="font-medium text-center">Department</div>
                  <div className="font-medium text-center">Full Access</div>

                  {['view', 'create', 'edit', 'delete'].map(action => (
                    <Fragment key={action}>
                      <div>{formatTitle(action)} Staff</div>
                      {[AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL].map(level => (
                        <div key={level} className="text-center">
                          <Checkbox
                            checked={permissions.staff[action as keyof typeof permissions.staff] === level}
                            onCheckedChange={() => handlePermissionChange('staff', action, level)}
                          />
                        </div>
                      ))}
                    </Fragment>
                  ))}

                  {/* Additional access level controls */}
                  {['viewPerformance', 'manageSchedules', 'viewSalaries', 'manageAttendance'].map(action => (
                    <Fragment key={action}>
                      <div>{formatTitle(action)}</div>
                      {[AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL].map(level => (
                        <div key={level} className="text-center">
                          <Checkbox
                            checked={permissions.staff[action as keyof typeof permissions.staff] === level}
                            onCheckedChange={() => handlePermissionChange('staff', action, level)}
                          />
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Feature-specific permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Role Management</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageRoles">Manage Roles</Label>
                      <p className="text-sm text-muted-foreground">
                        Create, edit, and delete staff roles
                      </p>
                    </div>
                    <Switch
                      id="manageRoles"
                      checked={permissions.staff.manageRoles}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'manageRoles', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="assignPermissions">Assign Permissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Modify permissions for staff roles
                      </p>
                    </div>
                    <Switch
                      id="assignPermissions"
                      checked={permissions.staff.assignPermissions}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'assignPermissions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageCategories">Manage Categories</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing product categories
                      </p>
                    </div>
                    <Switch
                      id="manageCategories"
                      checked={permissions.staff.manageCategories}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'manageCategories', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="scheduleReports">Schedule Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow scheduling automated reports
                      </p>
                    </div>
                    <Switch
                      id="scheduleReports"
                      checked={permissions.staff.scheduleReports}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'scheduleReports', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageUsers">Manage Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing system users
                      </p>
                    </div>
                    <Switch
                      id="manageUsers"
                      checked={permissions.staff.manageUsers}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'manageUsers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reconcileTill">Reconcile Till</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow reconciling cash registers/tills
                      </p>
                    </div>
                    <Switch
                      id="reconcileTill"
                      checked={permissions.staff.reconcileTill}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'reconcileTill', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="viewPurchaseHistory">View Purchase History</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow viewing customer purchase history
                      </p>
                    </div>
                    <Switch
                      id="viewPurchaseHistory"
                      checked={permissions.staff.viewPurchaseHistory}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'viewPurchaseHistory', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="viewPerformance">View Performance</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow viewing shop performance metrics
                      </p>
                    </div>
                    <Switch
                      id="viewPerformance"
                      checked={permissions.staff.viewPerformance}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'viewPerformance', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageCompetitors">Manage Competitors</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing competitor information
                      </p>
                    </div>
                    <Switch
                      id="manageCompetitors"
                      checked={permissions.staff.manageCompetitors}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'manageCompetitors', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="approveExpenses">Approve Expenses</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow approving expense requests
                      </p>
                    </div>
                    <Switch
                      id="approveExpenses"
                      checked={permissions.staff.approveExpenses}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'approveExpenses', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderParts">Order Parts</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow ordering parts for repairs
                      </p>
                    </div>
                    <Switch
                      id="orderParts"
                      checked={permissions.staff.orderParts}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'orderParts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manageContracts">Manage Contracts</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow managing supplier contracts
                      </p>
                    </div>
                    <Switch
                      id="manageContracts"
                      checked={permissions.staff.manageContracts}
                      onCheckedChange={(checked) => handlePermissionChange('staff', 'manageContracts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Staff management permissions give users significant control over system access.
                  Be extremely careful when granting role and permission management access.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inventory-view">View Inventory</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view inventory information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.inventory.view}
                          onChange={(value) => handlePermissionChange('inventory', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inventory-create">Create Items</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new inventory items
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.inventory.create}
                          onChange={(value) => handlePermissionChange('inventory', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inventory-edit">Edit Items</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to edit inventory information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.inventory.edit}
                          onChange={(value) => handlePermissionChange('inventory', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inventory-delete">Delete Items</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove inventory items
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.inventory.delete}
                          onChange={(value) => handlePermissionChange('inventory', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="adjustStock">Adjust Stock</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow adjusting stock levels for products
                        </p>
                      </div>
                      <Switch
                        id="adjustStock"
                        checked={permissions.inventory.adjustStock}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'adjustStock', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="orderInventory">Order Inventory</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow ordering new inventory
                        </p>
                      </div>
                      <Switch
                        id="orderInventory"
                        checked={permissions.inventory.orderInventory}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'orderInventory', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageSuppliers">Manage Suppliers</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing inventory suppliers
                        </p>
                      </div>
                      <Switch
                        id="manageSuppliers"
                        checked={permissions.inventory.manageSuppliers}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'manageSuppliers', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewStockAlerts">View Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing low stock alerts
                        </p>
                      </div>
                      <Switch
                        id="viewStockAlerts"
                        checked={permissions.inventory.viewStockAlerts}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'viewStockAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="transferStock">Transfer Stock</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow transferring stock between locations
                        </p>
                      </div>
                      <Switch
                        id="transferStock"
                        checked={permissions.inventory.transferStock}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'transferStock', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCategories">Manage Categories</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing product categories
                        </p>
                      </div>
                      <Switch
                        id="manageCategories"
                        checked={permissions.inventory.manageCategories}
                        onCheckedChange={(checked) => handlePermissionChange('inventory', 'manageCategories', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shops-view">View Shops</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view shop information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.shops?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('shops', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shops-create">Create Shops</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new shops
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.shops?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('shops', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shops-edit">Edit Shops</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify shop information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.shops?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('shops', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shops-delete">Delete Shops</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove shops
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.shops?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('shops', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageLocations">Manage Locations</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing shop locations
                        </p>
                      </div>
                      <Switch
                        id="manageLocations"
                        checked={permissions.shops?.manageLocations || false}
                        onCheckedChange={(checked) => handlePermissionChange('shops', 'manageLocations', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="assignStaff">Assign Staff</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow assigning staff to shops
                        </p>
                      </div>
                      <Switch
                        id="assignStaff"
                        checked={permissions.shops?.assignStaff || false}
                        onCheckedChange={(checked) => handlePermissionChange('shops', 'assignStaff', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewPerformance">View Performance</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing shop performance metrics
                        </p>
                      </div>
                      <Switch
                        id="viewPerformance"
                        checked={permissions.shops?.viewPerformance || false}
                        onCheckedChange={(checked) => handlePermissionChange('shops', 'viewPerformance', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageInventory">Manage Inventory</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing shop inventory
                        </p>
                      </div>
                      <Switch
                        id="manageInventory"
                        checked={permissions.shops?.manageInventory || false}
                        onCheckedChange={(checked) => handlePermissionChange('shops', 'manageInventory', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageOperations">Manage Operations</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing shop operations
                        </p>
                      </div>
                      <Switch
                        id="manageOperations"
                        checked={permissions.shops?.manageOperations || false}
                        onCheckedChange={(checked) => handlePermissionChange('shops', 'manageOperations', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reports-view">View Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view reporting data
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.reports?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('reports', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reports-create">Create Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to create new reports
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.reports?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('reports', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reports-edit">Edit Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify existing reports
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.reports?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('reports', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reports-delete">Delete Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove reports
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.reports?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('reports', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewSalesReports">View Sales Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing sales reports
                        </p>
                      </div>
                      <Switch
                        id="viewSalesReports"
                        checked={permissions.reports?.viewSalesReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'viewSalesReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewFinancialReports">View Financial Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing financial reports
                        </p>
                      </div>
                      <Switch
                        id="viewFinancialReports"
                        checked={permissions.reports?.viewFinancialReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'viewFinancialReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewInventoryReports">View Inventory Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing inventory reports
                        </p>
                      </div>
                      <Switch
                        id="viewInventoryReports"
                        checked={permissions.reports?.viewInventoryReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'viewInventoryReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewStaffReports">View Staff Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing staff reports
                        </p>
                      </div>
                      <Switch
                        id="viewStaffReports"
                        checked={permissions.reports?.viewStaffReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'viewStaffReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewCustomReports">View Custom Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing custom reports
                        </p>
                      </div>
                      <Switch
                        id="viewCustomReports"
                        checked={permissions.reports?.viewCustomReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'viewCustomReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="scheduleReports">Schedule Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow scheduling automated reports
                        </p>
                      </div>
                      <Switch
                        id="scheduleReports"
                        checked={permissions.reports?.scheduleReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('reports', 'scheduleReports', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="financial-view">View Financial</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view financial information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.financial?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('financial', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="financial-create">Create Financial Entries</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new financial entries
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.financial?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('financial', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="financial-edit">Edit Financial Entries</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify existing financial entries
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.financial?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('financial', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="financial-delete">Delete Financial Entries</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove financial entries
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.financial?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('financial', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewFinancialSummary">View Financial Summary</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing financial summary
                        </p>
                      </div>
                      <Switch
                        id="viewFinancialSummary"
                        checked={permissions.financial?.viewFinancialSummary || false}
                        onCheckedChange={(checked) => handlePermissionChange('financial', 'viewFinancialSummary', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageExpenses">Manage Expenses</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing expenses
                        </p>
                      </div>
                      <Switch
                        id="manageExpenses"
                        checked={permissions.financial?.manageExpenses || false}
                        onCheckedChange={(checked) => handlePermissionChange('financial', 'manageExpenses', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="reconcileCash">Reconcile Cash</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow reconciling cash
                        </p>
                      </div>
                      <Switch
                        id="reconcileCash"
                        checked={permissions.financial?.reconcileCash || false}
                        onCheckedChange={(checked) => handlePermissionChange('financial', 'reconcileCash', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="approveRefunds">Approve Refunds</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow approving refunds
                        </p>
                      </div>
                      <Switch
                        id="approveRefunds"
                        checked={permissions.financial?.approveRefunds || false}
                        onCheckedChange={(checked) => handlePermissionChange('financial', 'approveRefunds', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="settings-view">View Settings</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view system settings
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.settings?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('settings', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="settings-create">Create Settings</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to create new settings
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.settings?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('settings', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="settings-edit">Edit Settings</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify existing settings
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.settings?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('settings', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="settings-delete">Delete Settings</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove settings
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.settings?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('settings', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageSystemConfig">Manage System Config</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing system configuration
                        </p>
                      </div>
                      <Switch
                        id="manageSystemConfig"
                        checked={permissions.settings?.manageSystemConfig || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'manageSystemConfig', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageStoreInfo">Manage Store Info</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing store information
                        </p>
                      </div>
                      <Switch
                        id="manageStoreInfo"
                        checked={permissions.settings?.manageStoreInfo || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'manageStoreInfo', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageTaxSettings">Manage Tax Settings</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing tax settings
                        </p>
                      </div>
                      <Switch
                        id="manageTaxSettings"
                        checked={permissions.settings?.manageTaxSettings || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'manageTaxSettings', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageIntegrations">Manage Integrations</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing integrations
                        </p>
                      </div>
                      <Switch
                        id="manageIntegrations"
                        checked={permissions.settings?.manageIntegrations || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'manageIntegrations', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageBackups">Manage Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing system backups
                        </p>
                      </div>
                      <Switch
                        id="manageBackups"
                        checked={permissions.settings?.manageBackups || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'manageBackups', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewAuditLogs">View Audit Logs</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing system audit logs
                        </p>
                      </div>
                      <Switch
                        id="viewAuditLogs"
                        checked={permissions.settings?.viewAuditLogs || false}
                        onCheckedChange={(checked) => handlePermissionChange('settings', 'viewAuditLogs', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="customers-view">View Customers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view customer information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.customers?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('customers', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="customers-create">Create Customers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new customers
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.customers?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('customers', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="customers-edit">Edit Customers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify customer information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.customers?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('customers', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="customers-delete">Delete Customers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove customers
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.customers?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('customers', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCustomerGroups">Manage Customer Groups</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing customer groups and segments
                        </p>
                      </div>
                      <Switch
                        id="manageCustomerGroups"
                        checked={permissions.customers?.manageCustomerGroups || false}
                        onCheckedChange={(checked) => handlePermissionChange('customers', 'manageCustomerGroups', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewPurchaseHistory">View Purchase History</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing customer purchase history
                        </p>
                      </div>
                      <Switch
                        id="viewPurchaseHistory"
                        checked={permissions.customers?.viewPurchaseHistory || false}
                        onCheckedChange={(checked) => handlePermissionChange('customers', 'viewPurchaseHistory', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageRewards">Manage Rewards</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing customer rewards and loyalty programs
                        </p>
                      </div>
                      <Switch
                        id="manageRewards"
                        checked={permissions.customers?.manageRewards || false}
                        onCheckedChange={(checked) => handlePermissionChange('customers', 'manageRewards', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCredits">Manage Credits</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing customer credits and store accounts
                        </p>
                      </div>
                      <Switch
                        id="manageCredits"
                        checked={permissions.customers?.manageCredits || false}
                        onCheckedChange={(checked) => handlePermissionChange('customers', 'manageCredits', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="exportCustomerData">Export Customer Data</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow exporting customer data
                        </p>
                      </div>
                      <Switch
                        id="exportCustomerData"
                        checked={permissions.customers?.exportCustomerData || false}
                        onCheckedChange={(checked) => handlePermissionChange('customers', 'exportCustomerData', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Markets Tab */}
        <TabsContent value="markets">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="markets-view">View Markets</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view market information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.markets?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('markets', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="markets-create">Create Markets</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new markets
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.markets?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('markets', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="markets-edit">Edit Markets</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify market information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.markets?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('markets', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="markets-delete">Delete Markets</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove markets
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.markets?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('markets', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="managePricing">Manage Pricing</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing market pricing strategies
                        </p>
                      </div>
                      <Switch
                        id="managePricing"
                        checked={permissions.markets?.managePricing || false}
                        onCheckedChange={(checked) => handlePermissionChange('markets', 'managePricing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="createPromotions">Create Promotions</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow creating market promotions
                        </p>
                      </div>
                      <Switch
                        id="createPromotions"
                        checked={permissions.markets?.createPromotions || false}
                        onCheckedChange={(checked) => handlePermissionChange('markets', 'createPromotions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCompetitors">Manage Competitors</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing competitor information
                        </p>
                      </div>
                      <Switch
                        id="manageCompetitors"
                        checked={permissions.markets?.manageCompetitors || false}
                        onCheckedChange={(checked) => handlePermissionChange('markets', 'manageCompetitors', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewMarketAnalytics">View Market Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing market analytics
                        </p>
                      </div>
                      <Switch
                        id="viewMarketAnalytics"
                        checked={permissions.markets?.viewMarketAnalytics || false}
                        onCheckedChange={(checked) => handlePermissionChange('markets', 'viewMarketAnalytics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCampaigns">Manage Campaigns</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing marketing campaigns
                        </p>
                      </div>
                      <Switch
                        id="manageCampaigns"
                        checked={permissions.markets?.manageCampaigns || false}
                        onCheckedChange={(checked) => handlePermissionChange('markets', 'manageCampaigns', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expenses-view">View Expenses</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view expense information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.expenses?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('expenses', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expenses-create">Create Expenses</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new expenses
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.expenses?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('expenses', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expenses-edit">Edit Expenses</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify expense information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.expenses?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('expenses', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expenses-delete">Delete Expenses</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove expenses
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.expenses?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('expenses', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="createExpenses">Create Expenses</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow creating new expenses
                        </p>
                      </div>
                      <Switch
                        id="createExpenses"
                        checked={permissions.expenses?.createExpenses || false}
                        onCheckedChange={(checked) => handlePermissionChange('expenses', 'createExpenses', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="approveExpenses">Approve Expenses</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow approving expense requests
                        </p>
                      </div>
                      <Switch
                        id="approveExpenses"
                        checked={permissions.expenses?.approveExpenses || false}
                        onCheckedChange={(checked) => handlePermissionChange('expenses', 'approveExpenses', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageCategories">Manage Categories</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing expense categories
                        </p>
                      </div>
                      <Switch
                        id="manageCategories"
                        checked={permissions.expenses?.manageCategories || false}
                        onCheckedChange={(checked) => handlePermissionChange('expenses', 'manageCategories', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewReports">View Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing expense reports
                        </p>
                      </div>
                      <Switch
                        id="viewReports"
                        checked={permissions.expenses?.viewReports || false}
                        onCheckedChange={(checked) => handlePermissionChange('expenses', 'viewReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageRecurring">Manage Recurring</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing recurring expenses
                        </p>
                      </div>
                      <Switch
                        id="manageRecurring"
                        checked={permissions.expenses?.manageRecurring || false}
                        onCheckedChange={(checked) => handlePermissionChange('expenses', 'manageRecurring', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repairs Tab */}
        <TabsContent value="repairs">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="repairs-view">View Repairs</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view repair information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.repairs?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('repairs', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="repairs-create">Create Repairs</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new repairs
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.repairs?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('repairs', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="repairs-edit">Edit Repairs</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify repair information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.repairs?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('repairs', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="repairs-delete">Delete Repairs</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove repairs
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.repairs?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('repairs', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="createServiceTickets">Create Service Tickets</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow creating service tickets
                        </p>
                      </div>
                      <Switch
                        id="createServiceTickets"
                        checked={permissions.repairs?.createServiceTickets || false}
                        onCheckedChange={(checked) => handlePermissionChange('repairs', 'createServiceTickets', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="assignTechnicians">Assign Technicians</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow assigning technicians to repairs
                        </p>
                      </div>
                      <Switch
                        id="assignTechnicians"
                        checked={permissions.repairs?.assignTechnicians || false}
                        onCheckedChange={(checked) => handlePermissionChange('repairs', 'assignTechnicians', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="orderParts">Order Parts</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow ordering parts for repairs
                        </p>
                      </div>
                      <Switch
                        id="orderParts"
                        checked={permissions.repairs?.orderParts || false}
                        onCheckedChange={(checked) => handlePermissionChange('repairs', 'orderParts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="viewHistory">View History</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow viewing repair history
                        </p>
                      </div>
                      <Switch
                        id="viewHistory"
                        checked={permissions.repairs?.viewHistory || false}
                        onCheckedChange={(checked) => handlePermissionChange('repairs', 'viewHistory', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageWorkflow">Manage Workflow</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing repair workflow
                        </p>
                      </div>
                      <Switch
                        id="manageWorkflow"
                        checked={permissions.repairs?.manageWorkflow || false}
                        onCheckedChange={(checked) => handlePermissionChange('repairs', 'manageWorkflow', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Access</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="suppliers-view">View Suppliers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to view supplier information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.suppliers?.view || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('suppliers', 'view', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="suppliers-create">Create Suppliers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to add new suppliers
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.suppliers?.create || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('suppliers', 'create', value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="suppliers-edit">Edit Suppliers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to modify supplier information
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.suppliers?.edit || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('suppliers', 'edit', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="suppliers-delete">Delete Suppliers</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to remove suppliers
                          </p>
                        </div>
                        <AccessLevelSelector
                          value={permissions.suppliers?.delete || AccessLevel.NONE}
                          onChange={(value) => handlePermissionChange('suppliers', 'delete', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Functions</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageContacts">Manage Contacts</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing supplier contacts
                        </p>
                      </div>
                      <Switch
                        id="manageContacts"
                        checked={permissions.suppliers?.manageContacts || false}
                        onCheckedChange={(checked) => handlePermissionChange('suppliers', 'manageContacts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="createOrders">Create Orders</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow creating supplier orders
                        </p>
                      </div>
                      <Switch
                        id="createOrders"
                        checked={permissions.suppliers?.createOrders || false}
                        onCheckedChange={(checked) => handlePermissionChange('suppliers', 'createOrders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manageContracts">Manage Contracts</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing supplier contracts
                        </p>
                      </div>
                      <Switch
                        id="manageContracts"
                        checked={permissions.suppliers?.manageContracts || false}
                        onCheckedChange={(checked) => handlePermissionChange('suppliers', 'manageContracts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="evaluatePerformance">Evaluate Performance</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow evaluating supplier performance
                        </p>
                      </div>
                      <Switch
                        id="evaluatePerformance"
                        checked={permissions.suppliers?.evaluatePerformance || false}
                        onCheckedChange={(checked) => handlePermissionChange('suppliers', 'evaluatePerformance', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="managePayments">Manage Payments</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow managing supplier payments
                        </p>
                      </div>
                      <Switch
                        id="managePayments"
                        checked={permissions.suppliers?.managePayments || false}
                        onCheckedChange={(checked) => handlePermissionChange('suppliers', 'managePayments', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
