/**
 * Staff Roles Management Page
 *
 * This page allows administrators to view, create, edit, and manage roles
 * and their associated permissions within the POS system.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRole } from '@/features/users/types/role';
import { useRoleHistory } from '../context/RoleHistoryContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Plus, Search, Shield, Undo, Redo, RefreshCw, Filter } from 'lucide-react';

// Custom Components
import { RolesList } from '../components/roles/RolesList';
import { RoleManagementDashboard } from '../components/roles/RoleManagementDashboard';
import { RolePermissionsGrid } from '../components/roles/RolePermissionsGrid';
import { UsersWithRoleList } from '../components/roles/UsersWithRoleList';
import { PageHeader } from '@/components/page-header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Hooks and Services
import { useToast } from '@/lib/toast';
import { roleService } from '@/features/users/services/roleService';
import { useRoles } from '../hooks/useRoles';

export function RolesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles, isLoading, isError, loadRoles } = useRoles();
  const { canUndo, canRedo, undo, redo, getUndoDescription, getRedoDescription } = useRoleHistory();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<IRole | null>(null);

  // Filtered roles based on search query and active tab
  const filteredRoles = roles
    .filter(role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(role => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return role.isActive;
      if (activeTab === 'inactive') return !role.isActive;
      if (activeTab === 'custom') return !role.isSystem;
      if (activeTab === 'system') return role.isSystem;
      return true;
    });

  // Handle role selection
  const handleSelectRole = (role: IRole) => {
    setSelectedRole(role);
  };

  // Handle creating a new role
  const handleCreateRole = () => {
    navigate('/staff/roles/add');
  };

  // Handle editing a role
  const handleEditRole = (role: IRole) => {
    navigate(`/staff/roles/edit/${role.id}`);
  };

  // Handle deleting a role
  const handleDeleteRole = (role: IRole) => {
    setPendingDeleteRole(role);
    setShowDeleteConfirm(true);
  };

  // Confirm role deletion
  const confirmDeleteRole = async () => {
    if (!pendingDeleteRole) return;

    try {
      await roleService.deleteRole(pendingDeleteRole.id);
      toast({
        title: 'Role Deleted',
        description: `The role "${pendingDeleteRole.name}" has been deleted successfully.`,
      });
      loadRoles();
      setSelectedRole(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteRole(null);
    }
  };

  // Handle role status toggle
  const handleToggleRoleStatus = async (role: IRole) => {
    try {
      const updatedRole = {
        ...role,
        isActive: !role.isActive
      };

      await roleService.updateRole(role.id, updatedRole);
      toast({
        title: 'Role Updated',
        description: `The role "${role.name}" is now ${updatedRole.isActive ? 'active' : 'inactive'}.`,
      });
      loadRoles();

      // Update selected role if it's the one being toggled
      if (selectedRole && selectedRole.id === role.id) {
        setSelectedRole(updatedRole);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle undo action
  const handleUndo = () => {
    const action = undo();
    if (action) {
      loadRoles();
      toast({
        title: 'Action Undone',
        description: getUndoDescription() || 'Previous action has been undone.',
      });
    }
  };

  // Handle redo action
  const handleRedo = () => {
    const action = redo();
    if (action) {
      loadRoles();
      toast({
        title: 'Action Redone',
        description: getRedoDescription() || 'Action has been redone.',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Role Management"
        description="Create and manage staff roles and permissions"
        icon={<Shield className="h-6 w-6 mr-2" />}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUndo}
            variant="outline"
            size="sm"
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>

          <Button
            onClick={handleRedo}
            variant="outline"
            size="sm"
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4 mr-2" />
            Redo
          </Button>

          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles list panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Staff Roles</CardTitle>
            <CardDescription>
              Manage roles and their permissions
            </CardDescription>

            <div className="flex flex-col gap-4 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2 mb-2">
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-sm text-muted-foreground">
                  Failed to load roles. Please try again.
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={loadRoles}>
                  Retry
                </Button>
              </div>
            ) : (
              <RolesList
                roles={filteredRoles}
                onSelectRole={handleSelectRole}
              />
            )}
          </CardContent>
        </Card>

        {/* Role details panel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedRole ? selectedRole.name : 'Role Details'}
            </CardTitle>
            <CardDescription>
              {selectedRole ? (
                <div className="flex items-center gap-2">
                  <span>{selectedRole.description || 'No description provided'}</span>
                  <Badge variant={selectedRole.isActive ? 'default' : 'outline'}>
                    {selectedRole.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedRole.isSystem && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              ) : (
                'Select a role to view details'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!selectedRole ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No role selected</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Select a role from the list to view and manage its details, permissions, and assigned users.
                </p>
                <Button onClick={handleCreateRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Role
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="users">Assigned Users</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Role Name</h4>
                        <p>{selectedRole.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <p>{selectedRole.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                        <p>{selectedRole.isSystem ? 'System Role' : 'Custom Role'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                        <p>{selectedRole.createdAt ? new Date(selectedRole.createdAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{selectedRole.description || 'No description provided'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleRoleStatus(selectedRole)}
                      disabled={selectedRole.isSystem}
                    >
                      {selectedRole.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleEditRole(selectedRole)}
                      disabled={selectedRole.isSystem}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteRole(selectedRole)}
                      disabled={selectedRole.isSystem}
                    >
                      Delete
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  {selectedRole && (
                    <RolePermissionsGrid
                      role={selectedRole}
                      readOnly={selectedRole.isSystem}
                    />
                  )}
                </TabsContent>

                <TabsContent value="users">
                  {selectedRole && (
                    <UsersWithRoleList
                      roleId={selectedRole.id}
                    />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{pendingDeleteRole?.name}"? This action cannot be undone.
              {pendingDeleteRole?.isSystem && (
                <div className="mt-2 text-red-500 font-medium">
                  System roles cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRole}
              disabled={!pendingDeleteRole || pendingDeleteRole.isSystem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default RolesPage;
