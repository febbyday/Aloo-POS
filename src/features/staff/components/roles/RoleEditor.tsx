/**
 * Role Editor Component
 *
 * Form for creating and editing roles with detailed permission management
 * Supports both basic role details and comprehensive permission assignment
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IRole } from '@/features/users/types/role';
import { Permissions } from '@/shared/schemas/permissions';
import { AccessLevel } from '@/shared/schemas/accessLevel';
import { getDefaultPermissions } from '@/shared/schemas/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RolePermissionsGrid } from './RolePermissionsGrid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Save, X } from 'lucide-react';

// Basic role validation schema
const roleSchema = z.object({
  name: z.string()
    .min(2, { message: 'Role name must be at least 2 characters long' })
    .max(50, { message: 'Role name cannot exceed 50 characters' }),
  description: z.string()
    .max(200, { message: 'Description cannot exceed 200 characters' })
    .optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof roleSchema> & {
  permissions: Permissions;
};

type RoleEditorProps = {
  role: IRole | null;
  onSave: (role: any) => Promise<boolean>;
  onCancel: () => void;
};

export function RoleEditor({ role, onSave, onCancel }: RoleEditorProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions>(
    role?.permissions && typeof role.permissions !== 'string'
      ? role.permissions as Permissions
      : getDefaultPermissions()
  );

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      isActive: role?.isActive ?? true,
      permissions,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const roleData = {
        ...data,
        permissions,
      };

      const success = await onSave(roleData);
      if (success) {
        // If this is a new role, reset the form
        if (!role) {
          form.reset({
            name: '',
            description: '',
            isActive: true,
            permissions: getDefaultPermissions(),
          });
          setPermissions(getDefaultPermissions());
        }
      }
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while saving the role'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle permission changes
  const handlePermissionChange = (updatedPermissions: Permissions) => {
    setPermissions(updatedPermissions);
  };

  return (
    <div>
      {saveError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name that identifies this role in the system
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
                          placeholder="Enter role description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of what this role is used for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Inactive roles cannot be assigned to users
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
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <RolePermissionsGrid
                    permissions={permissions}
                    onPermissionsChange={handlePermissionChange}
                    readOnly={role?.isSystemRole || false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || (role?.isSystemRole || false)}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Role'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
