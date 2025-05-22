# Permission Conversion Guide

This guide explains how to work with permissions in the application, particularly focusing on converting between different permission formats when communicating with the API.

## Permission Formats

The application uses two main permission formats:

1. **Object Format** - Used in the frontend for easy manipulation and checking
2. **String Array Format** - Used when communicating with the API

### Object Format

The object format represents permissions as a structured object with modules and actions:

```typescript
{
  sales: {
    view: 'all',
    create: 'dept',
    edit: 'self',
    delete: 'none',
    processRefunds: true,
    applyDiscounts: false
  },
  inventory: {
    view: 'all',
    create: 'all',
    edit: 'none',
    delete: 'none',
    adjustStock: true,
    orderInventory: false
  }
}
```

### String Array Format

The string array format represents permissions as an array of strings:

```typescript
[
  'sales',
  'sales.view.all',
  'sales.create.dept',
  'sales.edit.self',
  'sales.processRefunds',
  'inventory',
  'inventory.view.all',
  'inventory.create.all',
  'inventory.adjustStock'
]
```

## Conversion Utilities

### Basic Utilities

The application provides basic utility functions for converting between formats:

```typescript
import { permissionsToStringArray, stringArrayToPermissions } from '@/shared/utils/permissionUtils';

// Convert from object to string array
const permissionsArray = permissionsToStringArray(permissions);

// Convert from string array to object
const permissionsObject = stringArrayToPermissions(permissionsArray);
```

### Enhanced Utilities

For better performance and error handling, use the enhanced utilities:

```typescript
import { 
  enhancedPermissionsToStringArray, 
  enhancedStringArrayToPermissions,
  unifiedPermissionConverter
} from '@/shared/utils/enhancedPermissionUtils';

// Convert from object to string array with caching and error handling
const permissionsArray = enhancedPermissionsToStringArray(permissions);

// Convert from string array to object with caching and error handling
const permissionsObject = enhancedStringArrayToPermissions(permissionsArray);

// Convert any format to standardized object format
const standardizedPermissions = unifiedPermissionConverter(anyPermissions);
```

### React Hooks

For React components, use the permission converter hooks:

```typescript
import { usePermissionConverter, usePermissions } from '@/shared/hooks/usePermissionConverter';

function MyComponent({ rolePermissions }) {
  // Get conversion functions
  const { toStringArray, toObjectPermissions, convertAny } = usePermissionConverter();
  
  // Convert permissions to string array
  const permissionsArray = toStringArray(rolePermissions);
  
  // Or use the usePermissions hook for a specific set of permissions
  const { permissions, permissionsArray } = usePermissions(rolePermissions);
  
  // ...
}
```

## API Integration

When working with API calls that involve permissions, use the API permission utilities:

```typescript
import { 
  preparePermissionsForApi, 
  processPermissionsFromApi,
  createPermissionApiWrapper
} from '@/shared/utils/apiPermissionUtils';

// Prepare data for sending to the API
const apiData = preparePermissionsForApi(roleData);

// Process data received from the API
const processedData = processPermissionsFromApi(apiResponse);

// Create a wrapper for API methods that handle permissions
const wrappedCreateRole = createPermissionApiWrapper(roleService.createRole, {
  convertRequestPermissions: true,
  convertResponsePermissions: true
});

// Use the wrapped method
const newRole = await wrappedCreateRole(roleData);
```

## Example: Creating a Role

Here's a complete example of creating a role with permissions:

```typescript
import { usePermissions } from '@/shared/hooks/usePermissionConverter';
import { roleService } from '@/features/users/services/roleService';
import { createPermissionApiWrapper } from '@/shared/utils/apiPermissionUtils';

// Create a wrapped version of the createRole method
const createRoleWithPermissions = createPermissionApiWrapper(roleService.createRole);

async function createNewRole(roleData) {
  try {
    // Convert permissions to the correct format and create the role
    const newRole = await createRoleWithPermissions(roleData);
    
    // The newRole object will have permissions in standardized object format
    return newRole;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

function RoleForm() {
  const [roleData, setRoleData] = useState({
    name: '',
    description: '',
    permissions: getDefaultPermissions()
  });
  
  // Use the permissions hook to work with the permissions
  const { permissions, permissionsArray } = usePermissions(roleData.permissions);
  
  // ...form implementation...
  
  const handleSubmit = async () => {
    try {
      const newRole = await createNewRole(roleData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Legacy Permissions

The application also supports converting legacy permission formats:

```typescript
import { enhancedConvertLegacyPermissions } from '@/shared/utils/enhancedPermissionUtils';

// Convert legacy permissions to standardized format
const standardizedPermissions = enhancedConvertLegacyPermissions(legacyPermissions);
```

## Performance Considerations

The enhanced utilities include caching to improve performance. The cache is automatically managed, but you can clear it if needed:

```typescript
import { clearPermissionCache } from '@/shared/utils/enhancedPermissionUtils';

// Clear the permission conversion cache
clearPermissionCache();
```
