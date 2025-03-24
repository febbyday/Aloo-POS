# Database Setup for Staff Module

This document provides instructions for setting up the database for the staff module.

## Prerequisites

1. PostgreSQL database server installed and running
2. Node.js and npm installed
3. `.env` file in the backend directory with a valid `DATABASE_URL` 

## Setting Up the Database

### Option 1: Using the Batch File (Windows)

For Windows users, we've included a batch file that will handle the database setup and start the backend server:

```
cd backend
setup-and-run.bat
```

### Option 2: Manual Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Run the database setup script:
```
npm run setup-db
```

This script will:
- Create the necessary database tables through Prisma migrations
- Generate the Prisma client
- Seed the database with initial employment types and staff data

3. Start the backend server:
```
npm run dev
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, check:

1. Is PostgreSQL running?
2. Is your `.env` file configured correctly? It should contain a line like:
```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
```

3. Do you have the correct permissions to access the database?

### Migration Issues

If migrations fail:

1. Check the Prisma error messages
2. You can reset the database and run migrations from scratch:
```
npx prisma migrate reset --force
npm run setup-db
```

### Seed Data Issues

If seeding fails:

1. You can manually run the seed script:
```
npm run seed-staff
```

## Verifying the Setup

To verify that the setup was successful:

1. The backend server should be running without errors
2. You should be able to access the API endpoints at:
   - GET http://localhost:5000/api/v1/staff
   - GET http://localhost:5000/api/v1/employment-types

3. The frontend should display the staff data from the API instead of the mock data

## Working with an Existing Database

If you already have a database with employment types but need to add the staff model:

1. Run the migration to add the staff model:
```
npx prisma migrate dev --name add-staff-model
```

2. Seed the staff data:
```
npm run seed-staff
```

This will add the staff model while preserving existing data. 