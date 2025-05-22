/**
 * Role Details Page
 *
 * Displays detailed information about a specific role,
 * including its permissions and assigned users.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IRole } from '@/features/users/types/role';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Shield, Edit, Trash2, Users, ChevronRight, AlertTriangle } from 'lucide-react';

// Custom Components
import { RolePermissionsGrid } from '../components/roles/RolePermissionsGrid';
import { UsersWithRoleList } from '../components/roles/UsersWithRoleList';
import { PageHeader } from '@/components/page-header';

// Hooks and Services
import { useToast } from '@/lib/toast';
import { roleService } from '@/features/users/services/roleService';
import { useRoles } from '../hooks/useRoles';
import { Skeleton } from "@/components/ui/skeleton";

export function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<IRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load role details
  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setIsError(false);
        const roleData = await roleService.getRoleById(id);
        setRole(roleData);
      } catch (error) {
        console.error('Error fetching role details:', error);
        setIsError(true);
        toast({
          title: 'Error',
          description: 'Failed to load role details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleDetails();
  }, [id, toast]);

  // Handle edit role
  const handleEditRole = () => {
    navigate(`/staff/roles/edit/${id}`);
  };

  // Handle delete role
  const handleDeleteRole = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm role deletion
  const confirmDeleteRole = async () => {
    if (!id) return;

    try {
      await roleService.deleteRole(id);
      toast({
        title: 'Role Deleted',
        description: `The role "${role?.name}" has been deleted successfully.`,
      });
      navigate('/staff/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Handle role status toggle
  const handleToggleStatus = async () => {
    if (!role || !id) return;

    try {
      const updatedRole = {
        ...role,
        isActive: !role.isActive
      };

      await roleService.updateRole(id, updatedRole);
      setRole(updatedRole);
      toast({
        title: 'Role Updated',
        description: `The role "${role.name}" is now ${updatedRole.isActive ? 'active' : 'inactive'}.`,
      });
    } catch (error) {
      console.error('Error updating role status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Role Not Found"
          description="The requested role could not be found"
          icon={<AlertTriangle className="h-6 w-6 mr-2" />}
        >
          <Button onClick={() => navigate('/staff/roles')}>
            Back to Roles
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Role Not Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              The role you are looking for does not exist or you may not have permission to view it.
            </p>
            <Button onClick={() => navigate('/staff/roles')}>
              Return to Roles Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/staff">Staff</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/staff/roles">Roles</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>
              {isLoading ? 'Loading...' : role?.name || 'Role Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        title={isLoading ? 'Loading Role...' : role?.name || 'Role Details'}
        description={isLoading ? '' : role?.description || 'No description provided'}
        icon={<Shield className="h-6 w-6 mr-2" />}
      >
        <div className="flex items-center gap-2">
          {!isLoading && role && (
            <>
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={role.isSystem}
              >
                {role.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                onClick={handleEditRole}
                disabled={role.isSystem}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRole}
                disabled={role.isSystem}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : role ? (
        <div className="space-y-6">
          {/* Role status banner */}
          {!role.isActive && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-md flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">This role is currently inactive</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Users assigned to this role will not have access to its permissions.
                </p>
              </div>
            </div>
          )}

          {/* Role Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Role Details</span>
                {role.isSystem && (
                  <Badge variant="secondary">System Role</Badge>
                )}
                <Badge variant={role.isActive ? 'default' : 'outline'}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Detailed information about this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="users">Assigned Users</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Role Name</h4>
                        <p className="font-medium">{role.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <p>{role.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                        <p>{role.isSystem ? 'System Role' : 'Custom Role'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                        <p>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                        <p>{role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Created By</h4>
                        <p>{role.createdBy || 'Unknown'}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{role.description || 'No description provided'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  <RolePermissionsGrid
                    role={role}
                    readOnly={role.isSystem}
                  />
                </TabsContent>

                <TabsContent value="users">
                  <UsersWithRoleList
                    roleId={role.id}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{role?.name}"? This action cannot be undone.
              {role?.isSystem && (
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
              disabled={!role || role.isSystem}
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

export default RoleDetailsPage;
