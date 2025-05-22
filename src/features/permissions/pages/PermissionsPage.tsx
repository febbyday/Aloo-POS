import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastService } from '@/lib/toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PermissionManager from '../components/PermissionManager';
import { roleService } from '@/features/users/services/roleService';
import type { Role } from '@/features/users/types/role';
import type { Permissions } from '@/shared/schemas/permissions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const PermissionsPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const isReadOnly = !hasPermission('staff.assignPermissions');

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        ToastService.error(
          'Error',
          'No role ID provided'
        );
        navigate('/roles');
        return;
      }

      try {
        setLoading(true);
        const fetchedRole = await roleService.getRoleById(roleId);
        setRole(fetchedRole);
      } catch (error) {
        console.error('Error fetching role:', error);
        ToastService.error(
          'Error',
          error instanceof Error ? error.message : 'Failed to fetch role'
        );
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId, navigate]);

  const handleSavePermissions = async (updatedPermissions: Permissions) => {
    if (!role || !roleId) return;

    try {
      setSaving(true);
      const updatedRole = await roleService.updateRole(roleId, {
        ...role,
        permissions: updatedPermissions,
      });

      setRole(updatedRole);

      ToastService.success(
        'Success',
        `Permissions for "${role.name}" have been updated`
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating permissions:', error);
      ToastService.error(
        'Error',
        error instanceof Error ? error.message : 'Failed to update permissions'
      );

      return Promise.reject(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading role permissions...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-6 bg-destructive/10 rounded-md">
        <h2 className="text-xl font-semibold text-destructive">Role not found</h2>
        <p className="mt-2">The requested role could not be found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/roles')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </div>
    );
  }

  const isSystemRole = role.isSystemRole;
  const readOnlyMessage = isSystemRole
    ? "System roles cannot be modified"
    : !isReadOnly
      ? null
      : "You don't have permission to edit role permissions";

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage permissions for the "{role.name}" role
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate(`/roles/${roleId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Details
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {readOnlyMessage && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-amber-700 dark:text-amber-400">
            {readOnlyMessage}
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="edit">Edit Permissions</TabsTrigger>
          <TabsTrigger value="preview">Permission Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <PermissionManager
            role={role}
            onSave={handleSavePermissions}
            isReadOnly={isSystemRole || isReadOnly}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Permission Summary</h2>
            <p className="mb-6 text-muted-foreground">
              This view shows an overview of all permissions assigned to this role.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(role.permissions).map(([module, perms]) => (
                <div key={module} className="border rounded-md p-4">
                  <h3 className="font-medium text-lg capitalize mb-2">{module}</h3>
                  <div className="space-y-2">
                    {Object.entries(perms).map(([perm, value]) => (
                      <div key={perm} className="flex justify-between items-center py-1 border-b border-dashed last:border-0">
                        <span className="text-sm capitalize text-muted-foreground">
                          {perm.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium">
                          {typeof value === 'boolean'
                            ? (value ? 'Yes' : 'No')
                            : value
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionsPage;
