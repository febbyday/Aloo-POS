/**
 * Role Edit Page
 *
 * Page for editing an existing staff role and its permissions
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IRole } from '@/features/users/types/role';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ChevronRight, Save, X, AlertTriangle, ArrowLeft } from 'lucide-react';

// Custom Components
import { PageHeader } from '@/components/page-header';
import { RolePermissionsGrid } from '../components/roles/RolePermissionsGrid';

// Hooks and Services
import { useToast } from '@/lib/toast';
import { roleService } from '@/features/users/services/roleService';
import { useRoleHistory } from '../context/RoleHistoryContext';

// Form schema
const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Role name must be at least 2 characters.',
  }).max(50, {
    message: 'Role name must not exceed 50 characters.'
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export function RoleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackAction } = useRoleHistory();

  const [role, setRole] = useState<IRole | null>(null);
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, boolean>>({});
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Initialize form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Load role data
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setIsError(false);

        const roleData = await roleService.getRoleById(id);
        setRole(roleData);

        // Set original permissions
        setOriginalPermissions(roleData.permissions || {});
        setPermissions(roleData.permissions || {});

        // Set form values
        form.reset({
          name: roleData.name,
          description: roleData.description || '',
          isActive: roleData.isActive,
        });
      } catch (error) {
        console.error('Error fetching role data:', error);
        setIsError(true);
        toast({
          title: 'Error',
          description: 'Failed to load role data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleData();
  }, [id, form, toast]);

  // Handle form submission
  const onSubmit = async (data: RoleFormValues) => {
    if (!id || !role) return;

    try {
      // Create updated role object
      const updatedRole = {
        ...role,
        ...data,
        permissions: permissions,
      };

      // Track changes for undo/redo
      const beforeChanges: Partial<IRole> = {};
      const afterChanges: Partial<IRole> = {};

      // Check name changes
      if (role.name !== data.name) {
        beforeChanges.name = role.name;
        afterChanges.name = data.name;
      }

      // Check description changes
      if (role.description !== data.description) {
        beforeChanges.description = role.description;
        afterChanges.description = data.description;
      }

      // Check status changes
      if (role.isActive !== data.isActive) {
        beforeChanges.isActive = role.isActive;
        afterChanges.isActive = data.isActive;
      }

      // Check permission changes
      const permissionChanges = Object.entries(permissions).some(
        ([key, value]) => originalPermissions[key] !== value
      );

      if (permissionChanges) {
        beforeChanges.permissions = { ...originalPermissions };
        afterChanges.permissions = { ...permissions };
      }

      // Update role
      await roleService.updateRole(id, updatedRole);

      // Track action in history
      if (Object.keys(beforeChanges).length > 0) {
        trackAction(
          {
            type: 'update_role',
            id: role.id,
            before: beforeChanges,
            after: afterChanges
          },
          `Updated role: ${data.name}`
        );
      }

      // Show success message
      toast({
        title: 'Role Updated',
        description: `The role "${data.name}" has been updated successfully.`,
      });

      // Navigate to role details page
      navigate(`/staff/roles/${id}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle permission changes
  const handlePermissionChange = (permissionId: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: value,
    }));
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/staff/roles/${id}`);
  };

  // Render error state
  if (isError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Role Not Found"
          description="The requested role could not be found for editing"
          icon={<AlertTriangle className="h-6 w-6 mr-2" />}
        >
          <Button onClick={() => navigate('/staff/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Role Not Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              The role you are trying to edit does not exist or you may not have permission to edit it.
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
            <BreadcrumbLink href={`/staff/roles/${id}`}>
              {isLoading ? 'Loading...' : role?.name || 'Role Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        title={isLoading ? 'Loading...' : `Edit ${role?.name || 'Role'}`}
        description="Modify role details and permissions"
        icon={<Shield className="h-6 w-6 mr-2" />}
      >
        <div className="flex items-center gap-2">
          <Button onClick={handleCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || role?.isSystem}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </PageHeader>

      {/* System role warning */}
      {!isLoading && role?.isSystem && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Role</AlertTitle>
          <AlertDescription>
            This is a system role and cannot be edited. System roles are essential for the proper functioning of the application.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role details form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
              <CardDescription>
                Update the basic information for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Store Manager"
                            {...field}
                            disabled={role?.isSystem}
                          />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose and responsibilities of this role"
                            className="min-h-[120px]"
                            {...field}
                            disabled={role?.isSystem}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide context about what this role is responsible for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active
                          </FormLabel>
                          <FormDescription>
                            Users with this role will have access to its permissions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={role?.isSystem}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Permissions configuration */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure access permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <RolePermissionsGrid
                  role={role}
                  readOnly={role?.isSystem || false}
                  onChange={handlePermissionChange}
                />
              </div>

              {!role?.isSystem && (
                <div className="flex justify-end mt-6">
                  <Button onClick={form.handleSubmit(onSubmit)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RoleEditPage;
