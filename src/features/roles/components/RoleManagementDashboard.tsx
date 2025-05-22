/**
 * Role Management Dashboard
 *
 * Comprehensive interface for managing user roles and permissions
 * Provides role listing, creation, editing, and permission assignment
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Shield,
  Users,
  Settings,
  AlertCircle,
  RefreshCw,
  Check,
  UserPlus,
  Trash
} from 'lucide-react';
import { IRole } from '../types/role';
import { roleService } from '../services';
import { RolesList } from './RolesList';
import { RoleEditor } from './RoleEditor';
import { RolePermissionsGrid } from './RolePermissionsGrid';
import { UsersWithRoleList } from './UsersWithRoleList';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/lib/toast';
import { useRoles } from '../hooks';

export function RoleManagementDashboard() {
  // State for tab control and role selection
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Use the roles hook for data management
  const {
    roles,
    isLoading,
    error,
    loadRoles: refreshRoles,
    createRole,
    updateRole,
    deleteRole
  } = useRoles();

  // Filter roles based on search query
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role selection
  const handleSelectRole = (role: IRole) => {
    setSelectedRole(role);
    setActiveTab('editor');
  };

  // Handle role creation
  const handleCreateRole = async (roleData: Omit<IRole, 'id' | 'staffCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createRole(roleData);
      toast({
        title: "Role created successfully",
        description: `The role "${roleData.name}" has been created.`,
      });
      refreshRoles();
      return true;
    } catch (error) {
      toast({
        title: "Failed to create role",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle role update
  const handleUpdateRole = async (roleId: string, roleData: Partial<IRole>) => {
    try {
      await updateRole(roleId, roleData);
      toast({
        title: "Role updated successfully",
        description: `The role has been updated.`,
      });
      refreshRoles();

      // If we're updating the currently selected role, update the local state
      if (selectedRole && selectedRole.id === roleId) {
        setSelectedRole({
          ...selectedRole,
          ...roleData
        } as IRole);
      }

      return true;
    } catch (error) {
      toast({
        title: "Failed to update role",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id);
      toast({
        title: "Role deleted successfully",
        description: `The role "${selectedRole.name}" has been deleted.`,
      });
      setSelectedRole(null);
      setActiveTab('roles');
      refreshRoles();
      setShowDeleteConfirmation(false);
    } catch (error) {
      toast({
        title: "Failed to delete role",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setShowDeleteConfirmation(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshRoles();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedRole}>
            <Settings className="mr-2 h-4 w-4" />
            Role Editor
          </TabsTrigger>
          <TabsTrigger value="users" disabled={!selectedRole}>
            <Users className="mr-2 h-4 w-4" />
            Users ({selectedRole?.staffCount || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Available Roles</CardTitle>
                <Button onClick={() => {
                  setSelectedRole(null);
                  setActiveTab('editor');
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Role
                </Button>
              </div>
              <CardDescription>
                View and manage user roles in the system
              </CardDescription>
              <div className="flex w-full items-center space-x-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <RolesList
                  roles={filteredRoles}
                  onSelectRole={handleSelectRole}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedRole ? (
                    <>Edit Role: {selectedRole.name}</>
                  ) : (
                    <>Create New Role</>
                  )}
                </CardTitle>
                {selectedRole && !selectedRole.isSystemRole && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Role
                  </Button>
                )}
              </div>
              <CardDescription>
                {selectedRole
                  ? "Edit role details and manage permissions"
                  : "Create a new role with custom permissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleEditor
                role={selectedRole}
                onSave={selectedRole
                  ? (data) => handleUpdateRole(selectedRole.id, data)
                  : handleCreateRole
                }
                onCancel={() => {
                  setSelectedRole(null);
                  setActiveTab('roles');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          {selectedRole && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Users with {selectedRole.name} Role</CardTitle>
                  <Button onClick={() => document.querySelector('.UsersWithRoleList button')?.click()}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign User
                  </Button>
                </div>
                <CardDescription>
                  View and manage users assigned to this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersWithRoleList roleId={selectedRole.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone and will remove this role from all assigned users.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteRole}
      />
    </div>
  );
}
