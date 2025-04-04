# User Module and Roles/Permissions Restructuring Tasks

## 1. Centralize Roles and Permissions
- [ ] Move roles and permissions to users module
  - [ ] Create `/src/features/users/roles` directory
  - [ ] Move role types and interfaces
  - [ ] Move permission schemas
  - [ ] Move role templates
  - [ ] Update imports across the application

## 2. Update File Structure
- [ ] Create new directory structure
  ```
  src/features/users/
  ├── roles/
  │   ├── components/
  │   │   ├── RolesList.tsx
  │   │   ├── RoleForm.tsx
  │   │   ├── PermissionsForm.tsx
  │   │   └── RoleDetails.tsx
  │   ├── services/
  │   │   ├── roleService.ts
  │   │   └── roleTemplateService.ts
  │   ├── types/
  │   │   ├── role.types.ts
  │   │   └── permissions.types.ts
  │   └── utils/
  │       └── roleUtils.ts
  ```

## 3. Update Role Management Components
- [ ] Move and update role components
  - [ ] Migrate RolesPage from staff module
  - [ ] Update PermissionsPage
  - [ ] Create new RoleManagement component
  - [ ] Update role templates interface
- [ ] Update permission components
  - [ ] Create reusable permission selector
  - [ ] Update permission matrix component
  - [ ] Create permission group component
  - [ ] Add role template selector

## 4. Update Services
- [ ] Consolidate role services
  - [ ] Merge staff roleService into users module
  - [ ] Update roleTemplateService
  - [ ] Create unified permission validation service
  - [ ] Update API endpoints
- [ ] Update related services
  - [ ] Update userService to include role management
  - [ ] Update authService role checking
  - [ ] Create permission checking utilities
  - [ ] Add role caching service

## 5. Update Types and Interfaces
- [ ] Consolidate type definitions
  - [ ] Move role types from staff module
  - [ ] Update permission interfaces
  - [ ] Create unified role schema
  - [ ] Update Zod validation schemas
- [ ] Update related types
  - [ ] Update user types to include roles
  - [ ] Create permission guard types
  - [ ] Add role template types
  - [ ] Update API response types

## 6. Update Staff Module
- [ ] Remove duplicate role functionality
  - [ ] Remove role components
  - [ ] Remove role services
  - [ ] Remove role types
  - [ ] Update imports
- [ ] Update staff module to use centralized roles
  - [ ] Update staff components
  - [ ] Update staff services
  - [ ] Update staff types
  - [ ] Add role references

## 7. Update Routes and Navigation
- [ ] Update route configuration
  - [ ] Move role routes to users module
  - [ ] Update role management paths
  - [ ] Update permission paths
  - [ ] Update navigation structure
- [ ] Update navigation components
  - [ ] Update sidebar navigation
  - [ ] Update breadcrumbs
  - [ ] Update role management links
  - [ ] Update permission links

## 8. Update Documentation
- [ ] Update role management documentation
  - [ ] Document new structure
  - [ ] Update role management guide
  - [ ] Update permission guide
  - [ ] Add migration guide
- [ ] Update API documentation
  - [ ] Update role endpoints
  - [ ] Update permission endpoints
  - [ ] Update example requests
  - [ ] Update response schemas

## 9. Testing Updates
- [ ] Update test suite
  - [ ] Move role tests to users module
  - [ ] Update permission tests
  - [ ] Add integration tests
  - [ ] Update mock data
- [ ] Create new tests
  - [ ] Test role management flow
  - [ ] Test permission inheritance
  - [ ] Test role templates
  - [ ] Test staff integration

## 10. Migration Plan
- [ ] Create data migration strategy
  - [ ] Plan role data migration
  - [ ] Plan permission data migration
  - [ ] Create backup procedure
  - [ ] Plan rollback strategy
- [ ] Implementation steps
  - [ ] Create migration scripts
  - [ ] Test migration process
  - [ ] Plan deployment sequence
  - [ ] Create verification steps

## Priority Order
1. Centralize Roles and Permissions
2. Update File Structure
3. Update Types and Interfaces
4. Update Services
5. Update Role Management Components
6. Update Staff Module
7. Update Routes and Navigation
8. Testing Updates
9. Update Documentation
10. Migration Plan

## Notes
- Ensure backward compatibility during migration
- Maintain existing role assignments
- Update all import paths across the application
- Test role and permission inheritance
- Verify staff module functionality after changes
- Document breaking changes
- Create clear upgrade path for existing code

## Breaking Changes
- Role management routes will move to /users/roles/*
- Role service import paths will change
- Permission types will be centralized
- Staff module role references will need updating