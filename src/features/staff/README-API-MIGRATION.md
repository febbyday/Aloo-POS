# Employment Status API Migration

This document outlines the steps taken to migrate the Employment Status module from using mock data to integrating with the real API.

## Files Modified

1. **src/features/staff/services/employmentStatusService.ts**
   - Updated to support both mock data and real API calls
   - Added fallback to mock data when API is unavailable
   - Implemented proper error handling

2. **src/features/staff/hooks/useEmploymentStatuses.ts**
   - Enhanced with better error handling
   - Added mock data status indicator
   - Added loading state indicators (isLoading, isRefetching)

3. **src/features/staff/pages/EmploymentStatusPage.tsx**
   - Updated to show mock data indicator
   - Improved error handling with specific error messages
   - Added loading indicators

4. **src/features/staff/components/toolbars/EmploymentStatusToolbar.tsx**
   - Added support for refresh loading indicator

5. **scripts/toggle-mock-mode.js**
   - Created a utility script to toggle between mock and real API

## API Endpoints

The Employment Status module uses the following API endpoints:

- `GET /api/v1/staff/employment-statuses` - Get all employment statuses
- `GET /api/v1/staff/employment-statuses/:id` - Get an employment status by ID
- `POST /api/v1/staff/employment-statuses` - Create a new employment status
- `PUT /api/v1/staff/employment-statuses/:id` - Update an employment status
- `DELETE /api/v1/staff/employment-statuses/:id` - Delete an employment status

## Enabling/Disabling Mock Data

The service will fall back to mock data in the following scenarios:

1. When the API server is unavailable
2. When the environment variable `VITE_DISABLE_MOCK` is not set to "true"

### Using the Toggle Script

We've created a script to easily toggle between mock data and real API:

```bash
# Run the script
npm run toggle-mock
```

This will:
1. Check the current value of `VITE_DISABLE_MOCK` in `.env.development`
2. Ask you to confirm toggling the value
3. Update the file with your choice

Remember to restart your development server after toggling for the changes to take effect.

### Manual Configuration

To manually configure mock data usage:

1. Set `VITE_DISABLE_MOCK=true` in your `.env.development` file to use real API
2. Set `VITE_DISABLE_MOCK=false` to use mock data
3. Make sure the API server is running at the URL specified by `VITE_API_BASE_URL`

## Data Model

The Employment Status data model includes:

```typescript
interface EmploymentStatus {
  id?: string;
  name: string;
  description: string;
  color: string;
  benefits: string[];
  staffCount?: number;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}
```

## Error Handling

The implementation includes comprehensive error handling:

- Service layer errors are caught and logged
- UI displays appropriate error messages from the API or defaults
- Mock data failover when API is unavailable

## Testing

To test the migration:

1. Start with mock data (`VITE_DISABLE_MOCK=false`)
2. Verify all CRUD operations work with mock data
3. Start the API server
4. Set `VITE_DISABLE_MOCK=true` using `npm run toggle-mock`
5. Verify all operations work with the real API
6. Test error scenarios by stopping the API server

## Visual Indicators

The UI now includes visual indicators to help developers and testers:

1. **Mock Data Banner** - A yellow banner appears at the top of the page when using mock data
2. **Loading Spinner** - A spinner appears during initial loading
3. **Refresh Animation** - The refresh button shows a spinning animation when refreshing data
4. **Error Messages** - Detailed error messages appear when API errors occur
5. **Empty State** - A message appears when no results are found

## Future Improvements

1. Add data caching to improve performance
2. Implement optimistic updates for better UX
3. Add offline support for critical operations
4. Enhance error recovery mechanisms
5. Add more comprehensive logging for API interactions
 