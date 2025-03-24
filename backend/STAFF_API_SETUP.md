# Staff API Setup

This document outlines the setup and usage of the Staff API for the POS system.

## Implementation Overview

The Staff API provides endpoints for managing staff members through the following routes:

- `GET /api/v1/staff` - List all staff members
- `GET /api/v1/staff/:id` - Get a specific staff member
- `POST /api/v1/staff` - Create a new staff member
- `PATCH /api/v1/staff/:id` - Update a staff member
- `DELETE /api/v1/staff/:id` - Delete a staff member

## Current Implementation

Currently, the Staff API is implemented with mock data in memory. In a future update, this will be replaced with a database implementation using Prisma ORM. The current implementation serves as a functional API that the frontend can use while the database model is being developed.

## API Documentation

### Staff Data Structure

```typescript
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "on_leave";
  hireDate: string;
  department: string;
  position: string;
  employmentType: string;
  bankingDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}
```

### API Endpoints

#### GET /api/v1/staff

Returns a list of all staff members.

Example response:
```json
[
  {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "role": "Manager",
    "status": "active",
    "hireDate": "2022-01-15",
    "department": "Sales",
    "position": "Sales Manager",
    "employmentType": "full-time",
    "bankingDetails": {
      "accountName": "John Doe",
      "accountNumber": "1234567890",
      "bankName": "Example Bank",
      "accountType": "Checking"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "098-765-4321"
    }
  },
  // More staff members...
]
```

#### GET /api/v1/staff/:id

Returns a single staff member by ID.

Example response for `/api/v1/staff/1`:
```json
{
  "id": "1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "123-456-7890",
  "role": "Manager",
  "status": "active",
  "hireDate": "2022-01-15",
  "department": "Sales",
  "position": "Sales Manager",
  "employmentType": "full-time",
  "bankingDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Example Bank",
    "accountType": "Checking"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "098-765-4321"
  }
}
```

#### POST /api/v1/staff

Creates a new staff member.

Required fields:
- `firstName`
- `lastName`
- `email`

Example request body:
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "phone": "555-123-4567",
  "role": "Cashier",
  "status": "active",
  "hireDate": "2023-02-15",
  "department": "Operations",
  "position": "Junior Cashier",
  "employmentType": "part-time",
  "bankingDetails": {
    "accountName": "Alice Johnson",
    "accountNumber": "9876543210",
    "bankName": "City Bank",
    "accountType": "Checking"
  },
  "emergencyContact": {
    "name": "Bob Johnson",
    "relationship": "Spouse",
    "phone": "555-987-6543"
  }
}
```

#### PATCH /api/v1/staff/:id

Updates an existing staff member.

Example request to update a staff member's position and department:
```json
{
  "position": "Senior Cashier",
  "department": "Front Office"
}
```

#### DELETE /api/v1/staff/:id

Deletes a staff member by ID.

Example response:
```json
{
  "success": true
}
```

## Testing the API

You can test the API implementation using:

1. The frontend Staff page at `/staff`
2. API tools like Postman or cURL
3. The browser's developer tools to monitor network requests

Example cURL request to list all staff members:

```bash
curl http://localhost:5000/api/v1/staff
```

## Future Enhancements

In future updates, the following enhancements are planned:

1. Database integration using Prisma ORM
2. Authentication and authorization for staff management
3. Role-based access control
4. Staff activity logging
5. Advanced filtering and pagination for staff listing

## Troubleshooting

### API Returns 500 Internal Server Error

If you encounter 500 errors, check:

1. Server logs for specific error messages
2. Make sure the request body matches the expected format
3. Verify that the Express server is running correctly

### Frontend Shows "Using Mock Data" Warning

This indicates the frontend couldn't connect to the backend API and is falling back to using mock data. Check:

1. Backend server - Ensure it's running on the correct port
2. API URL - Verify the frontend is using the correct API URL
3. CORS settings - Ensure CORS is properly configured in the backend 