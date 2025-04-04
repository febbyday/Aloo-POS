import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Users, 
  Settings,
  DollarSign,
  ShoppingCart,
  Package,
  FileText,
  Store,
  Briefcase,
  UserCheck
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRoles } from '../hooks/useRoles';
import { roleService } from '../services/roleService';
import { roleTemplateService } from '../services/roleTemplateService';
import { getDefaultPermissions, Permissions } from '../types/permissions';
import { Role } from '../types/role';
import { PageHeader } from '@/components/page-header';

// Define permission modules with icons for visual representation
const permissionModules = [
  { id: "sales", label: "Sales", icon: ShoppingCart, color: "text-green-500" },
  { id: "inventory", label: "Inventory", icon: Package, color: "text-blue-500" },
  { id: "staff", label: "Staff", icon: Users, color: "text-purple-500" },
  { id: "customers", label: "Customers", icon: UserCheck, color: "text-yellow-500" },
  { id: "shops", label: "Shops", icon: Store, color: "text-indigo-500" },
  { id: "reports", label: "Reports", icon: FileText, color: "text-orange-500" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-gray-500" },
  { id: "financial", label: "Financial", icon: DollarSign, color: "text-red-500" },
];

/**
 * Role Management Page
 * 
 * This page provides an interface for managing roles and their permissions.
 */
export function RoleManagementPage() {
  // State for search and dialogs
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [newRole, setNewRole] = useState<Omit<Role, "id" | "staffCount" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    permissions: getDefaultPermissions(),
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the role hook to fetch and manage roles
  const { 
    roles, 
    isLoading, 
    error, 
    refreshRoles, 
    createRole, 
    updateRole,
    deleteRole
  } = useRoles();

  const navigate = useNavigate();
  const { toast } = useToast();

  // Get available role templates from service
  const availableTemplates = roleTemplateService.getAvailableTemplates();

  // Add cleanupInProgress ref for handling unmounting
  const cleanupInProgress = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupInProgress.current = true;
    };
  }, []);

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => {
    const searchLower = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower))
    );
  });

  // Handle dialog close with cleanup
  const handleDialogClose = (setDialogState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setDialogState(false);
    setIsSubmitting(false);
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId === "none") {
      // Reset to default permissions
      setNewRole({
        ...newRole,
        permissions: getDefaultPermissions()
      });
    } else {
      // Apply template permissions
      const templatePermissions = roleTemplateService.getTemplateById(templateId);
      if (templatePermissions) {
        setNewRole({
          ...newRole,
          permissions: templatePermissions
        });
      }
    }
  };

  // Handle create role
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a simplified role object that matches the API expectations
      const roleData = {
        name: newRole.name,
        description: newRole.description || '',
        permissions: newRole.permissions,
        isActive: true
      };
      
      // Call the createRole function from useRoles
      await createRole(roleData);
      
      // Show success message
      toast({
        title: "Success",
        description: `Role "${newRole.name}" was created successfully.`,
      });
      
      // Close the dialog
      handleDialogClose(setShowAddRoleDialog);
      
      // Reset form state if component is still mounted
      if (!cleanupInProgress.current) {
        setNewRole({
          name: "",
          description: "",
          permissions: getDefaultPermissions(),
          isActive: true
        });
        setSelectedTemplate("none");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      if (!cleanupInProgress.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Handle edit role
  const handleEditRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = roles.find(r => r.id === roleId);
    
    if (role) {
      setNewRole({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions,
        isActive: role.isActive
      });
      setShowEditRoleDialog(true);
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!selectedRoleId || !newRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a simplified role object that matches the API expectations
      const roleData = {
        name: newRole.name,
        description: newRole.description || '',
        permissions: newRole.permissions,
        isActive: newRole.isActive
      };
      
      // Call the updateRole function from useRoles
      await updateRole(selectedRoleId, roleData);
      
      // Show success message
      toast({
        title: "Success",
        description: `Role "${newRole.name}" was updated successfully.`,
      });
      
      // Close the dialog
      handleDialogClose(setShowEditRoleDialog);
      
      // Reset form state if component is still mounted
      if (!cleanupInProgress.current) {
        setNewRole({
          name: "",
          description: "",
          permissions: getDefaultPermissions(),
          isActive: true
        });
        setSelectedRoleId(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      if (!cleanupInProgress.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Handle delete role
  const handleDeleteRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowDeleteConfirmation(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedRoleId) return;
    
    try {
      setIsSubmitting(true);
      
      // Call the deleteRole function from useRoles
      await deleteRole(selectedRoleId);
      
      // Show success message
      toast({
        title: "Success",
        description: "Role was deleted successfully.",
      });
      
      // Close the dialog
      handleDialogClose(setShowDeleteConfirmation);
      
      // Reset selected role if component is still mounted
      if (!cleanupInProgress.current) {
        setSelectedRoleId(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      if (!cleanupInProgress.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Handle edit permissions
  const handleEditPermissions = (roleId: string) => {
    navigate(`/permissions/${roleId}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Role Management"
        description="Manage roles and their permissions"
        actions={<Shield className="h-6 w-6" />}
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
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddRoleDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading roles...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load roles. Please try again later.
          </AlertDescription>
        </Alert>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No roles found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? "Try a different search term" : "Create a new role to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      {role.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {role.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {role.staffCount} {role.staffCount === 1 ? "member" : "members"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-4 gap-2">
                  {permissionModules.map((module) => {
                    const ModuleIcon = module.icon;
                    const hasPermission = Object.values(
                      (role.permissions as Permissions)[module.id as keyof Permissions] || {}
                    ).some(value => value !== 'none');
                    
                    return (
                      <div 
                        key={module.id}
                        className={`flex flex-col items-center justify-center p-2 rounded-md ${
                          hasPermission ? 'bg-primary/10' : 'bg-muted'
                        }`}
                        title={`${module.label} permissions`}
                      >
                        <ModuleIcon className={`h-5 w-5 ${hasPermission ? module.color : 'text-muted-foreground'}`} />
                        <span className={`text-xs mt-1 ${hasPermission ? 'font-medium' : 'text-muted-foreground'}`}>
                          {module.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditPermissions(role.id)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Permissions
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditRole(role.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Role Dialog */}
      <Dialog 
        open={showAddRoleDialog} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) handleDialogClose(setShowAddRoleDialog);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Store Manager"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe the role's responsibilities"
                value={newRole.description || ''}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-template">Permission Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger id="role-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template (Default)</SelectItem>
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
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleDialogClose(setShowAddRoleDialog)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={isSubmitting || !newRole.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog 
        open={showEditRoleDialog} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) handleDialogClose(setShowEditRoleDialog);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                placeholder="e.g., Store Manager"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                placeholder="Describe the role's responsibilities"
                value={newRole.description || ''}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleDialogClose(setShowEditRoleDialog)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={isSubmitting || !newRole.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteConfirmation}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) handleDialogClose(setShowDeleteConfirmation);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove its association from any staff members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Role'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default RoleManagementPage;
