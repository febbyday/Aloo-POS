# Products Module Migration Plan

This document outlines the plan for gradually migrating the existing Products module components to use the new Zustand store and specialized hooks.

## Migration Phases

### Phase 1: Core Components (Current)
- ✅ Create Zustand store
- ✅ Create specialized hooks
- ✅ Create ProductForm component
- ✅ Create ProductFormAdapter for legacy integration

### Phase 2: Table and List Components (Next)
- [ ] Migrate ProductsTable to use the store
- [ ] Migrate ProductsToolbar to use the store
- [ ] Migrate ProductFilters to use useProductFilters hook
- [ ] Migrate ProductSearch to use useProductFilters hook
- [ ] Migrate ProductActions to use useProductOperations hook

### Phase 3: Detail and Form Components
- [ ] Migrate ProductDialog to use the store
- [ ] Migrate ViewProductDialog to use the store
- [ ] Migrate ProductPreview to use the store
- [ ] Migrate ProductVariantsManager to use the store
- [ ] Migrate VariantManager to use the store

### Phase 4: Pages
- [ ] Create new ProductListPage using the store
- [ ] Create new ProductDetailPage using the store
- [ ] Update routing to use new pages alongside legacy pages
- [ ] Gradually phase out legacy pages

### Phase 5: Utility Components
- [ ] Migrate ImportDialog to use the store
- [ ] Migrate ExportDialog to use the store
- [ ] Migrate BulkEditModal to use the store
- [ ] Migrate FilterDialog to use useProductFilters

### Phase 6: Analytics and Reporting
- [ ] Migrate PriceHistoryChart to use the store
- [ ] Migrate StockHeatmap to use the store
- [ ] Migrate StockAlerts to use the store

## Component Migration Priority

### High Priority
1. ProductsTable (core listing component)
2. ProductsToolbar (core filtering/actions)
3. ProductFilters (core filtering)
4. ProductDialog (core CRUD operations)
5. ProductsPage (main page)

### Medium Priority
1. ProductVariantsManager (complex but important)
2. ViewProductDialog (frequently used)
3. BulkEditModal (important for operations)
4. ImportExportDialog (data management)
5. ProductDetailsPage (detailed view)

### Low Priority
1. StatsCard (simple display component)
2. CategoryComponents (less frequently used)
3. StockTransferDialog (specialized functionality)
4. PrintLabelsPage (specialized functionality)

## Migration Strategy for Each Component

### For UI Components
1. Create a new version of the component using the store
2. Implement feature parity with the old component
3. Replace imports in consuming components
4. Add tests for the new component
5. Remove the old component when no longer referenced

### For Pages
1. Create new page components using the store
2. Update routing to support both old and new pages
3. Add a feature flag to control which version is used
4. Gradually transition to new pages
5. Remove old pages when no longer needed

### For Hooks
1. Identify where legacy hooks are used
2. Create adapter hooks that use the new store but maintain old interfaces
3. Replace direct usage with new hooks
4. Add deprecation notices to adapter hooks
5. Remove adapter hooks when no longer referenced

## Testing Strategy
- Each migrated component should have unit tests
- Integration tests should verify component interactions
- End-to-end tests should verify critical user flows
- Test both old and new implementations during transition

## Documentation
- Document each migrated component
- Update README.md with migration progress
- Provide examples of using new components
- Document breaking changes and migration paths

## Timeline
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 2 weeks
- Phase 5: 1 week
- Phase 6: 1 week
- Total: 8 weeks 