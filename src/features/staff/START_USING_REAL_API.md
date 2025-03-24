# Setting Up Real API For Staff Module

The staff module has been updated to use real backend APIs instead of mock data. This document provides instructions on how to set up and test the real API connection.

## What Has Been Changed

1. The following services have been updated to use real APIs by default:
   - `staffService.ts` - Now connects to `/api/v1/staff` endpoints
   - `roleService.ts` - Now connects to `/api/v1/roles` endpoints
   - `employmentTypeService.ts` - Now connects to `/api/v1/employment-types` endpoints

2. All services now use the `getApiEndpoint` helper to get the correct URL based on the environment.

3. The `useMockData` flag has been set to `false` in all services, making them use real APIs by default.

4. If the API is unavailable or returns an error, the system will automatically fall back to mock data.

## Testing the API Connection

Follow these steps to test the API connection:

### Step 1: Start the Backend Server

1. Open a new PowerShell window
2. Navigate to the backend directory:
   ```
   cd D:\Projects\POS\backend
   ```
3. Start the backend server:
   ```
   npx ts-node-dev --respawn src/index.ts
   ```
   Or use the PowerShell script provided:
   ```
   .\start-backend.ps1
   ```

### Step 2: Check API Endpoints

Ensure the following API endpoints are working:

1. Staff API:
   ```
   GET http://localhost:5000/api/v1/staff
   ```

2. Roles API:
   ```
   GET http://localhost:5000/api/v1/roles
   ```

3. Employment Types API:
   ```
   GET http://localhost:5000/api/v1/employment-types
   ```

You can test these using a web browser, Postman, or any API testing tool.

### Step 3: Refresh the Frontend

1. Return to your frontend application
2. Reload the page to establish new API connections
3. Check the browser console for logs showing API connections

## Troubleshooting

If you see mock data warnings:

1. Check that the backend server is running
2. Verify that PostgreSQL database is running and accessible
3. Check the console for API connection errors
4. If needed, see `backend/BACKEND_STARTUP.md` for detailed backend setup steps

## Reverting to Mock Data

If you need to revert to using mock data while fixing backend issues:

1. In each service file (staffService.ts, roleService.ts, employmentTypeService.ts):
   - Change `let useMockData = false;` to `let useMockData = true;`

2. Save the files and reload the frontend application 