import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, Save, RefreshCw, Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import {
  Permissions,
  PermissionItem
} from "@/shared/schemas/permissions";
import { AccessLevel } from "@/shared/schemas/accessLevel";
import { getDefaultPermissions } from "@/shared/schemas/permissions";
import { Role } from "@/features/users/types/role";
import { roleTemplateService } from "@/features/users/services/roleTemplateService";

export interface PermissionManagerProps {
  role: Role;
  onSave: (permissions: Permissions) => Promise<void>;
  isReadOnly?: boolean;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  role,
  onSave,
  isReadOnly = false
}) => {
  const [permissions, setPermissions] = useState<Permissions>(role.permissions);
  const [activeTab, setActiveTab] = useState("sales");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const { toast } = useToast();

  // Define module metadata for UI display
  const modules = [
    { id: 'sales', label: 'Sales', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'inventory', label: 'Inventory', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'staff', label: 'Staff', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'reports', label: 'Reports', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'settings', label: 'Settings', icon: <ShieldAlert className="h-4 w-4 mr-2" /> },
    { id: 'financial', label: 'Financial', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
    { id: 'customers', label: 'Customers', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'shops', label: 'Shops', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'markets', label: 'Markets', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'expenses', label: 'Expenses', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'repairs', label: 'Repairs', icon: <Shield className="h-4 w-4 mr-2" /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Shield className="h-4 w-4 mr-2" /> },
  ];

  // Access level display metadata
  const accessLevelOptions = [
    { value: AccessLevel.NONE, label: 'None', description: 'No access to this feature' },
    { value: AccessLevel.SELF, label: 'Self', description: 'Access to own resources only' },
    { value: AccessLevel.DEPARTMENT, label: 'Department', description: 'Access to department resources' },
    { value: AccessLevel.ALL, label: 'All', description: 'Access to all resources' },
  ];

  useEffect(() => {
    // Load available permission templates
    setTemplates(roleTemplateService.getTemplateList());
  }, []);

  useEffect(() => {
    setPermissions(role.permissions);
  }, [role]);

  // Handle changes to access level permissions
  const handleAccessLevelChange = (
    module: keyof Permissions,
    operation: keyof PermissionItem,
    value: AccessLevel
  ) => {
    if (isReadOnly) return;

    setPermissions((prev: Permissions) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [operation]: value
      }
    }));
    setIsChanged(true);
  };

  // Handle changes to boolean permissions
  const handleBooleanPermissionChange = (
    module: keyof Permissions,
    permission: string,
    checked: boolean
  ) => {
    if (isReadOnly) return;

    setPermissions((prev: Permissions) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: checked
      }
    }));
    setIsChanged(true);
  };

  // Handle applying a template to the current permissions
  const handleApplyTemplate = (templateId: string) => {
    if (isReadOnly) return;

    const updatedPermissions = roleTemplateService.getTemplateById(templateId);
    if (updatedPermissions) {
      setPermissions(updatedPermissions);
      setIsChanged(true);
      toast({
        title: "Template Applied",
        description: `Applied the ${templates.find(t => t.id === templateId)?.name} template`,
      });
    }
  };

  // Handle saving permission changes
  const handleSavePermissions = async () => {
    try {
      await onSave(permissions);
      setIsChanged(false);
      toast({
        title: "Permissions Saved",
        description: "The role permissions have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save permissions",
        variant: "destructive",
      });
    }
  };

  // Apply a preset for a specific module
  const handleQuickSetModule = (module: keyof Permissions, preset: 'none' | 'view' | 'manage' | 'full') => {
    if (isReadOnly) return;

    let updatedModule = { ...permissions[module] };

    if (preset === 'none') {
      // Set all access levels to NONE
      (Object.keys(updatedModule) as Array<keyof typeof updatedModule>).forEach(key => {
        if (['view', 'create', 'edit', 'delete', 'export', 'approve'].includes(key as string)) {
          updatedModule[key] = AccessLevel.NONE;
        } else if (typeof updatedModule[key] === 'boolean') {
          updatedModule[key] = false;
        }
      });
    } else if (preset === 'view') {
      // Set view to ALL, others to NONE
      updatedModule.view = AccessLevel.ALL;
      updatedModule.create = AccessLevel.NONE;
      updatedModule.edit = AccessLevel.NONE;
      updatedModule.delete = AccessLevel.NONE;
      if (updatedModule.export) updatedModule.export = AccessLevel.NONE;
      if (updatedModule.approve) updatedModule.approve = AccessLevel.NONE;

      // Set boolean permissions that are view-related to true
      (Object.keys(updatedModule) as Array<keyof typeof updatedModule>).forEach(key => {
        if (typeof updatedModule[key] === 'boolean' && String(key).startsWith('view')) {
          updatedModule[key] = true;
        }
      });
    } else if (preset === 'manage') {
      // Set view, create, edit to ALL, delete to NONE
      updatedModule.view = AccessLevel.ALL;
      updatedModule.create = AccessLevel.ALL;
      updatedModule.edit = AccessLevel.ALL;
      updatedModule.delete = AccessLevel.NONE;
      if (updatedModule.export) updatedModule.export = AccessLevel.ALL;
      if (updatedModule.approve) updatedModule.approve = AccessLevel.NONE;

      // Set many boolean permissions to true
      (Object.keys(updatedModule) as Array<keyof typeof updatedModule>).forEach(key => {
        if (typeof updatedModule[key] === 'boolean' &&
            !String(key).includes('delete') &&
            !String(key).includes('void')) {
          updatedModule[key] = true;
        }
      });
    } else if (preset === 'full') {
      // Set all access levels to ALL
      (Object.keys(updatedModule) as Array<keyof typeof updatedModule>).forEach(key => {
        if (['view', 'create', 'edit', 'delete', 'export', 'approve'].includes(key as string)) {
          updatedModule[key] = AccessLevel.ALL;
        } else if (typeof updatedModule[key] === 'boolean') {
          updatedModule[key] = true;
        }
      });
    }

    setPermissions((prev: Permissions) => ({
      ...prev,
      [module]: updatedModule
    }));
    setIsChanged(true);
  };

  // Quick set all permissions
  const handleQuickSetAll = (preset: 'none' | 'view' | 'manage' | 'full') => {
    if (isReadOnly) return;

    modules.forEach(module => {
      handleQuickSetModule(module.id as keyof Permissions, preset);
    });
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev: string[]) =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Filter modules based on search term
  const filteredModules = modules.filter(module =>
    module.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render the access level radio group for a permission
  const renderAccessLevelControl = (
    module: keyof Permissions,
    operation: keyof PermissionItem,
    currentValue: AccessLevel
  ) => (
    <RadioGroup
      value={currentValue}
      onValueChange={(value) => handleAccessLevelChange(module, operation, value as AccessLevel)}
      className="flex space-x-1 mt-1"
      disabled={isReadOnly}
    >
      {accessLevelOptions.map(option => (
        <div key={option.value} className="flex items-center space-x-1">
          <RadioGroupItem value={option.value} id={`${module}-${operation}-${option.value}`} />
          <Label
            htmlFor={`${module}-${operation}-${option.value}`}
            className="text-xs cursor-pointer"
            title={option.description}
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  // Render boolean permission control
  const renderBooleanPermission = (
    module: keyof Permissions,
    permission: string,
    label: string,
    checked: boolean
  ) => (
    <div className="flex items-center space-x-2 mb-2">
      <Checkbox
        id={`${module}-${permission}`}
        checked={checked}
        onCheckedChange={(checked) =>
          handleBooleanPermissionChange(module, permission, checked === true)
        }
        disabled={isReadOnly}
      />
      <Label htmlFor={`${module}-${permission}`} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );

  // Render a module's permission controls
  const renderModulePermissions = (module: keyof Permissions) => {
    const modulePermissions = permissions[module];
    const standardPermissions = ['view', 'create', 'edit', 'delete', 'export', 'approve'];
    const specialPermissions = Object.keys(modulePermissions).filter(
      key => !standardPermissions.includes(key)
    );

    return (
      <div className="space-y-4">
        {/* Quick Set Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSetModule(module, 'none')}
            disabled={isReadOnly}
          >
            <ShieldX className="h-4 w-4 mr-1" /> None
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSetModule(module, 'view')}
            disabled={isReadOnly}
          >
            <Shield className="h-4 w-4 mr-1" /> View Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSetModule(module, 'manage')}
            disabled={isReadOnly}
          >
            <ShieldCheck className="h-4 w-4 mr-1" /> Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSetModule(module, 'full')}
            disabled={isReadOnly}
          >
            <ShieldAlert className="h-4 w-4 mr-1" /> Full Access
          </Button>
        </div>

        {/* Standard Operations */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Standard Operations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardPermissions.map(operation => {
              // Skip if this module doesn't have this operation
              if (!(operation in modulePermissions)) return null;

              return (
                <div key={operation} className="space-y-1">
                  <h5 className="text-sm font-medium capitalize">{operation}</h5>
                  {renderAccessLevelControl(
                    module,
                    operation as keyof PermissionItem,
                    modulePermissions[operation as keyof typeof modulePermissions] as AccessLevel
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Permissions */}
        {specialPermissions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Special Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {specialPermissions.map(permission => {
                const value = modulePermissions[permission as keyof typeof modulePermissions];

                // Handle AccessLevel enum
                if (typeof value === 'string' && Object.values(AccessLevel).includes(value as AccessLevel)) {
                  return (
                    <div key={permission} className="space-y-1">
                      <h5 className="text-sm font-medium capitalize">{permission.replace(/([A-Z])/g, ' $1')}</h5>
                      {renderAccessLevelControl(
                        module,
                        permission as keyof PermissionItem,
                        value as AccessLevel
                      )}
                    </div>
                  );
                }

                // Handle boolean permissions
                if (typeof value === 'boolean') {
                  return renderBooleanPermission(
                    module,
                    permission,
                    permission.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to sentence
                    value
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>
              Configure permissions for {role.name}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {!isReadOnly && (
              <>
                <Select onValueChange={handleApplyTemplate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Apply Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="default"
                  onClick={handleSavePermissions}
                  disabled={!isChanged}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Set Buttons */}
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="w-full md:w-auto flex items-center space-x-2 mb-2 md:mb-0">
              <Label className="whitespace-nowrap">Quick Set All:</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetAll('none')}
            >
              <ShieldX className="h-4 w-4 mr-1" /> None
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetAll('view')}
            >
              <Shield className="h-4 w-4 mr-1" /> View Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetAll('manage')}
            >
              <ShieldCheck className="h-4 w-4 mr-1" /> Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSetAll('full')}
            >
              <ShieldAlert className="h-4 w-4 mr-1" /> Full Access
            </Button>
          </div>
        )}

        <div className="relative mt-4">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules..."
            className="pl-8 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
          />
        </div>
      </CardHeader>

      <CardContent>
        {searchTerm ? (
          // Display search results in accordion format
          <Accordion type="multiple" value={expandedSections}>
            {filteredModules.map(module => (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger onClick={() => toggleSection(module.id)}>
                  <div className="flex items-center">
                    {module.icon}
                    <span>{module.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {renderModulePermissions(module.id as keyof Permissions)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          // Display tabs for all modules
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 mb-4 gap-0.5">
              {modules.map(module => (
                <TabsTrigger key={module.id} value={module.id} className="flex items-center">
                  {module.icon}
                  <span className="hidden md:inline">{module.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {modules.map(module => (
              <TabsContent key={module.id} value={module.id}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  {module.icon}
                  <span>{module.label} Permissions</span>
                </h3>
                {renderModulePermissions(module.id as keyof Permissions)}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {isChanged && !isReadOnly && (
          <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              You have unsaved changes to these permissions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PermissionManager;
