# Module Connection Guide

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/[module]`) and backend (`backend/src/[module]`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on [MODULE_NAME]
   - [ ] List all modules that [MODULE_NAME] depends on
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by [MODULE_NAME]
   - [ ] List events consumed by [MODULE_NAME]
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
   - [ ] List shared components
   - [ ] Document shared state requirements

## File Storage Requirements
1. Check File Types:
   - [ ] List required file types (images, documents, etc.)
   - [ ] Define maximum file sizes
   - [ ] Define allowed file extensions
   - [ ] Document file naming conventions

2. Storage Configuration:
   - [ ] Configure storage provider (local/S3/Azure)
   - [ ] Set up storage paths
   - [ ] Configure access permissions
   - [ ] Set up CDN if required

3. File Processing Requirements:
   - [ ] Image optimization needs
   - [ ] Document conversion needs
   - [ ] Thumbnail generation
   - [ ] Metadata extraction

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for [MODULE_NAME] relationships
- [ ] Add file storage related fields if needed:
  ```prisma
  model [MODULE_NAME] {
    files    File[]
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_[module]_model`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields
- [ ] Add file metadata fields if needed

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/[module].dto.ts`
- [ ] Implement repository in `backend/src/repositories/[module].repository.ts`
- [ ] Create service layer in `backend/src/services/[module].service.ts`
- [ ] Set up controllers in `backend/src/controllers/[module].controller.ts`
- [ ] Configure routes in `backend/src/routes/[module].routes.ts`
- [ ] Add module-specific validators
- [ ] Implement error handlers
- [ ] Add file upload handlers:
  - Upload endpoint
  - Download endpoint
  - Delete endpoint
  - File validation
  - Error handling

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Create/update service in `src/features/[module]/services/[module].service.ts`
- [ ] Set up state management store
- [ ] Implement data transformers for API responses
- [ ] Add loading states and error handling
- [ ] Update form validation schemas
- [ ] Add file upload components:
  - File picker
  - Progress indicator
  - Preview component
  - Error handling
  - Retry logic

### 4. Settings & Configuration
- [ ] Add module settings to global config
- [ ] Configure locale-specific formatting (currency, dates, numbers)
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables
- [ ] Configure file storage settings:
  ```env
  [MODULE_NAME]_STORAGE_PATH=
  [MODULE_NAME]_MAX_FILE_SIZE=
  [MODULE_NAME]_ALLOWED_TYPES=
  [MODULE_NAME]_STORAGE_PROVIDER=
  ```

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure file sharing between modules if needed
- [ ] Set up file access permissions across modules

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test cross-module functionality
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments
- [ ] Test file operations:
  - Upload tests
  - Download tests
  - Delete tests
  - Permission tests
  - Error handling tests

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document file handling procedures
- [ ] Add file type specifications
- [ ] Document storage requirements

## Module-Specific File Considerations

### Products Module
- Product images
- Technical specifications (PDF)
- Import/export templates
- Bulk upload formats

### Orders Module
- Order attachments
- Invoices (PDF)
- Shipping labels
- Digital products delivery

### Customers Module
- Profile pictures
- ID documents
- Contract attachments
- Communication history

### Finance Module
- Transaction receipts
- Tax documents
- Financial reports
- Audit logs

### Inventory Module
- Stock photos
- Location maps
- Barcode images
- Import/export files

## Common Issues & Solutions
1. Foreign key constraints
2. Race conditions in concurrent operations
3. Cache invalidation
4. Cross-module event handling
5. Permission inheritance
6. File upload failures
7. Storage quota issues
8. File type mismatches
9. Concurrent file access
10. Orphaned file cleanup

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Real-time updates functioning
- [ ] Error handling tested
- [ ] Performance metrics acceptable
- [ ] Security measures in place
- [ ] Cross-module relationships verified
- [ ] Settings properly propagated
- [ ] File operations working
- [ ] Storage quotas configured
- [ ] Cleanup procedures in place

## Deployment Considerations
1. Database migration order
2. API version compatibility
3. Frontend/Backend deployment synchronization
4. Environment variable updates
5. Cache clearing requirements
6. Storage provider configuration
7. CDN setup if needed
8. Backup procedures
9. File migration strategy
10. Storage scaling plan

Use this guide by replacing [MODULE_NAME] with the specific module being connected.
