# Role Routes Removal Plan

This document outlines the plan for removing the deprecated role routes in the application.

## Current Status

The application currently has three role-related route paths:

1. **Main Route**: `/api/v1/roles/*` - This is the official endpoint for role management.
2. **Deprecated Route 1**: `/api/v1/users/roles/*` - This is a deprecated route that redirects to the main route.
3. **Deprecated Route 2**: `/api/v1/staff/roles/*` - This is a deprecated route that redirects to the main route.

The deprecated routes have been updated with enhanced logging to track usage and provide clear deprecation warnings.

## Frontend Status

The frontend code has been updated to use the main role service from `@/features/users/services/roleService` instead of the deprecated staff role service. The staff role service now delegates all calls to the main role service.

## Removal Timeline

The deprecated routes will be removed according to the following timeline:

1. **Phase 1: Enhanced Logging (Current)** - The deprecated routes now include enhanced logging to track usage and provide clear deprecation warnings.

2. **Phase 2: Frontend Migration (Current)** - The frontend code has been updated to use the main role service.

3. **Phase 3: Monitoring Period (1-2 months)** - Monitor the usage of deprecated routes through logs to identify any remaining code that still uses them.

4. **Phase 4: Removal Warning (After Phase 3)** - Update the deprecated routes to return a 410 Gone status code with a warning message, but still process the request.

5. **Phase 5: Final Removal (Version 2.0.0)** - Remove the deprecated routes completely.

## Implementation Details

### Phase 4: Removal Warning

Update the deprecated routes to return a 410 Gone status code with a warning message:

```typescript
// In userRolesRoutes.ts and staff.routes.ts
router.use('/roles', (req, res, next) => {
  // Log the access
  console.warn(`DEPRECATED ROUTE ACCESSED: ${req.originalUrl} is deprecated and will be removed in version 2.0.0.`);
  
  // Add deprecation warning header
  res.set('X-Deprecated-API', 'This endpoint is deprecated and will be removed in version 2.0.0. Please use /api/v1/roles instead.');
  
  // Set status code to 410 Gone
  res.status(410);
  
  // Continue processing the request
  next();
}, roleRoutes);
```

### Phase 5: Final Removal

Remove the deprecated routes completely:

1. Remove the `userRolesRoutes.ts` file.
2. Remove the role routes from `staff.routes.ts`.
3. Update the route mounting in `index.ts` to remove references to the deprecated routes.

## Monitoring

During the monitoring period, the following metrics will be tracked:

1. Number of requests to deprecated routes.
2. Source of requests (IP, user agent).
3. Specific endpoints being accessed.

This data will be used to identify any remaining code that still uses the deprecated routes and to prioritize updates.

## Communication

The following communication will be sent to developers:

1. Documentation updates (already completed).
2. Email notification about the deprecation and removal timeline.
3. Release notes highlighting the changes.

## Questions?

If you have any questions about the role routes removal plan, please contact the development team.
