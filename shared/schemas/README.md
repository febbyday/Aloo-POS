# Shared Schemas

## Module Compatibility

This directory contains schema definitions shared between the frontend and backend. The project uses TypeScript with ES modules throughout, so all schemas are defined in `.ts` files.

## Adding New Schemas

When adding new shared schemas:

1. Create the schema as a TypeScript file (`.ts`)
2. Export all types, schemas, and utility functions
3. Import the schema in both frontend and backend using ES module imports

## Updating Schemas

When updating a schema, make sure to test both frontend and backend to ensure compatibility.