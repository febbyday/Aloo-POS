import { Role } from "../types/role";
import { Permissions, permissionTemplates, getDefaultPermissions } from "../types/permissions";
import { toast } from "@/components/ui/use-toast";

/**
 * Service for working with predefined role templates
 * Helps create and apply permission templates to roles
 */
export class RoleTemplateService {
  /**
   * Get a list of all available role templates
   * @returns Array of template names with descriptions
   */
  getAvailableTemplates(): Array<{ id: string; name: string; description: string }> {
    return [
      {
        id: "administrator",
        name: "Administrator",
        description: "Full system access with ability to configure all settings and manage roles"
      },
      {
        id: "storeManager",
        name: "Store Manager",
        description: "Full access to store operations and management features"
      },
      {
        id: "cashier",
        name: "Cashier",
        description: "Processes sales transactions and basic customer service"
      },
      {
        id: "inventoryManager",
        name: "Inventory Manager",
        description: "Manages inventory, stock operations, and suppliers"
      },
      {
        id: "financeManager",
        name: "Finance Manager",
        description: "Oversees financial operations, expenses, and reconciliation"
      },
      {
        id: "staffManager",
        name: "Staff Manager",
        description: "Manages staff schedules, performance, and HR functions"
      },
      {
        id: "reportsAnalyst",
        name: "Reports Analyst",
        description: "Analyzes data and generates reports across all business areas"
      },
      {
        id: "salesAssociate",
        name: "Sales Associate",
        description: "Handles sales operations and basic customer service"
      }
    ];
  }

  /**
   * Get a specific permission template by ID
   * @param templateId - The ID of the template to retrieve
   * @returns The permissions object for the specified template or undefined if not found
   */
  getTemplateById(templateId: string): Permissions | undefined {
    const templateKey = templateId as keyof typeof permissionTemplates;
    return permissionTemplates[templateKey];
  }

  /**
   * Apply a template to a role
   * @param role - The role to update
   * @param templateId - The ID of the template to apply
   * @returns The updated role with the template permissions
   */
  applyTemplateToRole(role: Role, templateId: string): Role {
    const template = this.getTemplateById(templateId);
    
    if (!template) {
      toast({
        title: "Error",
        description: `Template "${templateId}" not found`,
        variant: "destructive"
      });
      return role;
    }
    
    // Create a deep copy to avoid reference issues
    const updatedRole: Role = {
      ...role,
      permissions: JSON.parse(JSON.stringify(template))
    };
    
    return updatedRole;
  }

  /**
   * Create a new role from a template
   * @param name - The name for the new role
   * @param description - The description for the new role
   * @param templateId - The ID of the template to use
   * @returns A new role object with the template permissions
   */
  createRoleFromTemplate(
    name: string,
    description: string,
    templateId: string
  ): Omit<Role, "id"> {
    const template = this.getTemplateById(templateId);
    
    return {
      name,
      description,
      staffCount: 0,
      permissions: template || getDefaultPermissions(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Merge a specific module's permissions from a template into an existing role
   * @param role - The role to update
   * @param templateId - The ID of the template to use
   * @param moduleKey - The module to apply permissions for
   * @returns The updated role with merged permissions for the specified module
   */
  mergeModuleFromTemplate(
    role: Role,
    templateId: string,
    moduleKey: keyof Permissions
  ): Role {
    const template = this.getTemplateById(templateId);
    
    if (!template || !template[moduleKey]) {
      toast({
        title: "Error",
        description: `Template "${templateId}" or module "${moduleKey}" not found`,
        variant: "destructive"
      });
      return role;
    }
    
    // Create a deep copy to avoid reference issues
    const updatedRole: Role = {
      ...role,
      permissions: {
        ...role.permissions,
        [moduleKey]: JSON.parse(JSON.stringify(template[moduleKey]))
      }
    };
    
    return updatedRole;
  }
}

// Create singleton instance
export const roleTemplateService = new RoleTemplateService(); 