/**
 * Role Add Page
 *
 * Page for creating a new staff role with custom permissions
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Shield, ChevronRight, Save, X } from 'lucide-react';

// Custom Components
import { PageHeader } from '@/components/page-header';
import { RolePermissionsGrid } from '../components/roles/RolePermissionsGrid';

// Hooks and Services
import { ToastService } from '@/lib/toast';
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

export function RoleAddPage() {
  const navigate = useNavigate();
  const { trackAction } = useRoleHistory();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Initialize form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Handle form submission
  const onSubmit = async (data: RoleFormValues) => {
    try {
      // Create new role
      const newRole = {
        ...data,
        permissions: permissions,
        isSystem: false,
      };

      const createdRole = await roleService.createRole(newRole);

      // Track action in history
      trackAction(
        { type: 'create_role', role: createdRole },
        `Created role: ${data.name}`
      );

      // Show success message
      ToastService.success(
        'Role Created',
        `The role "${data.name}" has been created successfully.`
      );

      // Navigate to role details page
      navigate(`/staff/roles/${createdRole.id}`);
    } catch (error) {
      console.error('Error creating role:', error);
      ToastService.error(
        'Error',
        'Failed to create role. Please try again.'
      );
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
    navigate('/staff/roles');
  };

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
            <BreadcrumbLink>Create New Role</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        title="Create New Role"
        description="Add a new role with specific permissions"
        icon={<Shield className="h-6 w-6 mr-2" />}
      >
        <div className="flex items-center gap-2">
          <Button onClick={handleCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="h-4 w-4 mr-2" />
            Save Role
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role details form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Define the basic information for this role
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
                        <Input placeholder="e.g., Store Manager" {...field} />
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
                role={{ id: "new", permissions: permissions }}
                readOnly={false}
                onChange={handlePermissionChange}
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={form.handleSubmit(onSubmit)}>
                <Save className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RoleAddPage;
