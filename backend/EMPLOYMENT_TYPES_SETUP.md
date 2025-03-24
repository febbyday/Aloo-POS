# Employment Types API Setup

This document outlines the steps to set up the Employment Types API feature for the POS system.

## Implementation Overview

The Employment Types API enables the frontend to manage employment type records through the following endpoints:

- `GET /api/v1/employment-types` - List all employment types
- `GET /api/v1/employment-types/:id` - Get a specific employment type
- `POST /api/v1/employment-types` - Create a new employment type
- `PATCH /api/v1/employment-types/:id` - Update an employment type
- `DELETE /api/v1/employment-types/:id` - Delete an employment type

## Setup Instructions

Follow these steps to set up the Employment Types API:

### 1. Set up the Database

The implementation relies on the Prisma ORM with a PostgreSQL database. Make sure your PostgreSQL database is running and accessible.

Update the `.env` file in the `backend` directory to include your database connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/pos_db"
```

### 2. Run Database Migrations

Navigate to the `backend` directory and run the setup script:

```bash
cd backend
npm run setup-db
```

This script will:
- Generate the Prisma client
- Run the necessary migrations to create the `EmploymentType` table

Alternatively, you can run these commands manually:

```bash
npx prisma migrate dev --name add-employment-types
npx prisma generate
```

### 3. Start the Backend Server

Start the backend server:

```bash
cd backend
npm run dev
```

The server should start on port 5000 (or the port specified in your .env file).

### 4. Configure the Frontend

The frontend is already configured to connect to the backend API at `/api/v1/employment-types`. 

The frontend includes a fallback to mock data if the API is unavailable, so even if the backend is not running, the UI will still function with sample data.

## Testing the Implementation

You can test the API implementation using:

1. The frontend Employment Types page at `/staff/employment-types`
2. API tools like Postman or cURL
3. The browser's developer tools to monitor the network requests

Example cURL request to list all employment types:

```bash
curl http://localhost:5000/api/v1/employment-types
```

## Troubleshooting

### API Returns 500 Internal Server Error

If you encounter 500 errors, check:

1. Database connection - Ensure the PostgreSQL database is running and accessible
2. Migration status - Run `npx prisma migrate status` to check if migrations have been applied
3. Server logs - Check the backend server console for specific error messages

### Frontend Shows "Using Mock Data" Warning

This indicates the frontend couldn't connect to the backend API and is falling back to using mock data. Check:

1. Backend server - Ensure it's running on the correct port
2. API URL - Verify the frontend is using the correct API URL
3. CORS settings - Ensure CORS is properly configured in the backend

## API Documentation

### Employment Type Schema

```typescript
interface EmploymentType {
  id: string;
  name: string;
  description: string;
  color: string;
  benefits: string[];
  staffCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### API Endpoints

#### GET /api/v1/employment-types
Returns a list of all employment types.

#### GET /api/v1/employment-types/:id
Returns a specific employment type by ID.

#### POST /api/v1/employment-types
Creates a new employment type.
Required fields: `name`, `description`, `color`
Optional fields: `benefits`, `isActive`, `staffCount`

#### PATCH /api/v1/employment-types/:id
Updates an existing employment type.
Any fields can be updated.

#### DELETE /api/v1/employment-types/:id
Deletes an employment type. 