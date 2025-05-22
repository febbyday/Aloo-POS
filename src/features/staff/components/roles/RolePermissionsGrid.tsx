/**
 * Role Permissions Grid
 *
 * Interactive grid for visualizing and editing role permissions
 * Supports different access levels and permission types
 */
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Permissions } from '@/shared/schemas/permissions';
import { AccessLevel } from '@/shared/schemas/accessLevel';
import { permissionsList } from '@/features/users/types/role';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Helper for dynamically rendering Lucide icons
const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.CircleHelp;
  return <IconComponent className="h-5 w-5" />;
};

interface RolePermissionsGridProps {
  permissions: Permissions;
  onPermissionsChange: (permissions: Permissions) => void;
  readOnly?: boolean;
}

export function RolePermissionsGrid({
  permissions,
  onPermissionsChange,
  readOnly = false,
}: RolePermissionsGridProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['sales']);

  // Access level options
  const accessLevelOptions = [
    { value: 'none', label: 'No Access' },
    { value: 'self', label: 'Self Only' },
    { value: 'dept', label: 'Department' },
    { value: 'all', label: 'Full Access' },
  ];

  // Handle changes to access level permissions
  const handleAccessLevelChange = (
    module: string,
    operation: string,
    value: AccessLevel
  ) => {
    if (readOnly) return;

    const updatedPermissions = { ...permissions };
    (updatedPermissions as any)[module][operation] = value;
    onPermissionsChange(updatedPermissions);
  };

  // Handle changes to boolean permissions
  const handleBooleanPermissionChange = (
    module: string,
    permission: string,
    checked: boolean
  ) => {
    if (readOnly) return;

    const updatedPermissions = { ...permissions };
    (updatedPermissions as any)[module][permission] = checked;
    onPermissionsChange(updatedPermissions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Permission Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure what actions users with this role can perform
          </p>
        </div>
        {readOnly && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            System Role (Read-only)
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          {permissionsList.map((section) => {
            // Skip sections that don't exist in the permissions object
            if (!(section.id in permissions)) return null;

            const modulePermissions = (permissions as any)[section.id];

            return (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <div className="bg-muted rounded-md p-2 mr-2">
                      <DynamicIcon name={section.icon} />
                    </div>
                    <span>{section.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    {/* Standard CRUD permission selectors */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">Basic Permissions</CardTitle>
                        <CardDescription>
                          Core access controls for {section.label.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(modulePermissions)
                            .filter(([key]) => ['view', 'create', 'edit', 'delete', 'export', 'approve'].includes(key))
                            .map(([operation, value]) => {
                              if (typeof value !== 'string') return null;

                              return (
                                <div key={`${section.id}-${operation}`} className="space-y-2">
                                  <Label
                                    htmlFor={`${section.id}-${operation}`}
                                    className="capitalize"
                                  >
                                    {operation}
                                  </Label>
                                  <Select
                                    value={value}
                                    onValueChange={(newValue) =>
                                      handleAccessLevelChange(section.id, operation, newValue as AccessLevel)
                                    }
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger id={`${section.id}-${operation}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {accessLevelOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Special permissions as switches */}
                    {Object.entries(modulePermissions)
                      .filter(([key, value]) => typeof value === 'boolean')
                      .length > 0 && (
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Special Permissions</CardTitle>
                          <CardDescription>
                            Additional permissions specific to {section.label.toLowerCase()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(modulePermissions)
                              .filter(([key, value]) => typeof value === 'boolean')
                              .map(([permission, value]) => (
                                <div
                                  key={`${section.id}-${permission}`}
                                  className="flex items-center justify-between space-x-2"
                                >
                                  <div className="flex flex-col">
                                    <Label
                                      htmlFor={`${section.id}-${permission}`}
                                      className="capitalize"
                                    >
                                      {permission.replace(/([A-Z])/g, ' $1').trim()}
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                      {value ? 'Allowed' : 'Not allowed'}
                                    </span>
                                  </div>
                                  <Switch
                                    id={`${section.id}-${permission}`}
                                    checked={value as boolean}
                                    onCheckedChange={(checked) =>
                                      handleBooleanPermissionChange(section.id, permission, checked)
                                    }
                                    disabled={readOnly}
                                  />
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>

      <div className="bg-muted p-3 rounded-md flex items-center text-sm mt-4">
        <Info className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>
          <strong>Access levels: </strong>
          <span className="text-muted-foreground">
            "None" = no access, "Self" = own records only, "Department" = department-wide access, "All" = full system access
          </span>
        </span>
      </div>
    </div>
  );
}
