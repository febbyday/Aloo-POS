# Shared Schemas

## Module Compatibility

This directory contains schema definitions shared between the frontend and backend. Due to the different module systems used (ES modules in frontend, CommonJS in backend), we provide two versions of each schema:

- `.ts` files: ES module format for the frontend
- `.cjs` files: CommonJS format for the backend

## Fixing Import Issues

If you encounter module compatibility errors like:

```
Error: Must use import to load ES Module: .../shared/schemas/shopSchema.ts
```

Run the fix-backend-imports script to update imports in the backend:

```bash
npm run fix-backend-imports
```

## Adding New Schemas

When adding new shared schemas, please create both versions:

1. Create the ES module version (`.ts` file) for frontend use
2. Create the CommonJS version (`.cjs` file) for backend use

## Updating Schemas

When updating a schema, make sure to update both versions to keep them in sync.