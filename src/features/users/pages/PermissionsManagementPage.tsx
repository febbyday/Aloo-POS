import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Save,
  Users,
  Settings,
  DollarSign,
  ShoppingCart,
  Package,
  FileText,
  Store,
  Briefcase,
  UserCheck,
  AlertTriangle,
  Eye,
  Plus,
  Edit,
  Trash,
  Download,
  CheckCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/lib/toast';
// Import from the main users module instead of the staff module
import { useRoles } from '@/features/users/hooks/useRoles';
import { roleService } from '@/features/users/services/roleService';
import { roleTemplateService } from '@/features/users/services/roleTemplateService';
import {
  Permissions,
  PermissionItem,
  AccessLevel,
  getDefaultPermissions
} from '../types/permissions';
import { hasPermission } from '@/features/users/middleware/permissions';
import { Role } from '@/features/users/types/role';
import { PageHeader } from '@/components/page-header';

// Define permission modules with icons for visual representation
const modules = [
  { id: "sales", label: "Sales", icon: ShoppingCart, color: "text-green-500" },
  { id: "inventory", label: "Inventory", icon: Package, color: "text-blue-500" },
  { id: "staff", label: "Staff", icon: Users, color: "text-purple-500" },
  { id: "customers", label: "Customers", icon: UserCheck, color: "text-yellow-500" },
  { id: "shops", label: "Shops", icon: Store, color: "text-indigo-500" },
  { id: "reports", label: "Reports", icon: FileText, color: "text-orange-500" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-gray-500" },
  { id: "financial", label: "Financial", icon: DollarSign, color: "text-red-500" },
];

// Define permission actions with icons
const actions = [
  { id: "view", label: "View", icon: Eye, description: "Access to view information" },
  { id: "create", label: "Create", icon: Plus, description: "Ability to create new items" },
  { id: "edit", label: "Edit", icon: Edit, description: "Permission to modify existing items" },
  { id: "delete", label: "Delete", icon: Trash, description: "Authority to remove items" },
  { id: "export", label: "Export", icon: Download, description: "Export data to external formats" },
  { id: "approve", label: "Approve", icon: CheckCircle, description: "Approve actions or requests" },
];

/**
 * Permissions Management Page
 *
 * This page provides an interface for managing permissions for a specific role.
 */
export function PermissionsManagementPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { roles, getRoleById, updateRole, isLoading, error } = useRoles();

  const [activeTab, setActiveTab] = useState("sales");
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permissions>(getDefaultPermissions());
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRole, setLoadingRole] = useState<boolean>(true);

  const { toast } = useToast();

  // Add cleanupInProgress ref for handling unmounting
  const cleanupInProgress = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupInProgress.current = true;
    };
  }, []);

  // Load role data
  useEffect(() => {
    const loadRole = async () => {
      if (!roleId) return;

      setLoadingRole(true);
      try {
        const roleData = await roleService.getRoleById(roleId);
        if (!cleanupInProgress.current) {
          setRole(roleData);
          setPermissions(roleData.permissions as Permissions);
        }
      } catch (error) {
        if (!cleanupInProgress.current) {
          toast({
            title: "Error",
            description: `Failed to load role: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      } finally {
        if (!cleanupInProgress.current) {
          setLoadingRole(false);
        }
      }
    };

    loadRole();
  }, [roleId, toast]);

  // Handle permission change
  const handlePermissionChange = (
    module: keyof Permissions,
    action: keyof PermissionItem,
    level: AccessLevel
  ) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      const modulePermissions = { ...newPermissions[module] };

      // Update the specific permission
      (modulePermissions as any)[action] = level;

      // Update the module permissions
      newPermissions[module] = modulePermissions;

      return newPermissions;
    });
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!role) return;

    setIsSaving(true);
    try {
      // Create update data
      const updateData = {
        permissions
      };

      // Update role
      await updateRole(role.id, updateData);

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle apply template
  const handleApplyTemplate = (templateId: string) => {
    const templatePermissions = roleTemplateService.getTemplateById(templateId);
    if (templatePermissions) {
      setPermissions(templatePermissions);

      toast({
        title: "Template Applied",
        description: `The "${templateId}" template has been applied. Click Save to confirm changes.`,
      });
    }
  };

  // Render loading state
  if (loadingRole || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
            <p className="text-muted-foreground">Loading role information...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !role) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
            <p className="text-muted-foreground">Error loading role</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/roles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load role information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={`${role.name} Permissions`}
        description="Configure access levels for this role"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/roles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        }
      />

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

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Role Information</AlertTitle>
        <AlertDescription>
          This role is currently assigned to {role.staffCount} staff member(s).
          Changes to permissions will affect all users with this role.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Permission Templates</h3>
        <Select onValueChange={handleApplyTemplate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Apply Template" />
          </SelectTrigger>
          <SelectContent>
            {roleTemplateService.getAvailableTemplates().map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto">
          {modules.map(module => (
            <TabsTrigger
              key={module.id}
              value={module.id}
              className="flex flex-col items-center justify-center space-y-1 py-2 h-full"
            >
              <module.icon className={`h-5 w-5 ${module.color}`} />
              <span className="text-xs font-medium">{module.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map(module => (
          <TabsContent key={module.id} value={module.id} className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <module.icon className={`h-5 w-5 ${module.color} mr-2`} />
                  {module.label} Permissions
                </CardTitle>
                <CardDescription>
                  Configure what users with this role can do with {module.label.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {actions.map(action => {
                    // Skip if this action doesn't exist in the module's permissions
                    if (!(permissions[module.id as keyof Permissions] as any)[action.id]) {
                      return null;
                    }

                    return (
                      <div key={action.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <action.icon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">{action.label}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {action.description}
                        </p>
                        <Select
                          value={(permissions[module.id as keyof Permissions] as any)[action.id]}
                          onValueChange={(value) =>
                            handlePermissionChange(
                              module.id as keyof Permissions,
                              action.id as keyof PermissionItem,
                              value as AccessLevel
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AccessLevel.NONE}>No Access</SelectItem>
                            <SelectItem value={AccessLevel.SELF}>Self Only</SelectItem>
                            <SelectItem value={AccessLevel.DEPARTMENT}>Department</SelectItem>
                            <SelectItem value={AccessLevel.ALL}>Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}

                  {/* Module-specific permissions */}
                  {module.id === 'sales' && (
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-4">Additional Sales Permissions</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Add module-specific permissions here */}
                        {/* Example: */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">Process Refunds</h4>
                          </div>
                          <Select
                            value={
                              (permissions.sales as any).processRefunds ? "true" : "false"
                            }
                            onValueChange={(value) => {
                              setPermissions(prev => ({
                                ...prev,
                                sales: {
                                  ...prev.sales,
                                  processRefunds: value === "true"
                                }
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Allowed</SelectItem>
                              <SelectItem value="false">Not Allowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSavePermissions} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default PermissionsManagementPage;
