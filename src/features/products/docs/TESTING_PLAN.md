# Products Module Testing Plan

This document outlines the testing strategy for the new Products module architecture.

## Testing Layers

### 1. Unit Tests

#### Store Tests
- Test store initialization
- Test selectors for retrieving products
- Test actions for CRUD operations
- Test state normalization and denormalization
- Test filtering and sorting functionality

```typescript
// Example store test
describe('useProductStore', () => {
  it('should add a product to the store', () => {
    const { addProduct } = useProductStore.getState();
    const product = { id: '1', name: 'Test Product' };
    
    addProduct(product);
    
    const state = useProductStore.getState();
    expect(state.products['1']).toEqual(product);
    expect(state.productIds).toContain('1');
  });
});
```

#### Hook Tests
- Test `useProductOperations` for CRUD operations
- Test `useProductFilters` for filtering and search
- Test `useProductForm` for form validation and submission

```typescript
// Example hook test
describe('useProductOperations', () => {
  it('should create a product', async () => {
    const { createProduct } = useProductOperations();
    const product = { name: 'Test Product' };
    
    const result = await createProduct(product);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Product');
  });
});
```

#### Component Tests
- Test `ProductForm` for rendering and validation
- Test `ProductFormAdapter` for data conversion
- Test UI components for rendering and interactions

```typescript
// Example component test
describe('ProductForm', () => {
  it('should render form fields', () => {
    render(<ProductForm />);
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    render(<ProductForm />);
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests

- Test interactions between components
- Test data flow through the application
- Test form submission and API interactions

```typescript
// Example integration test
describe('Product Creation Flow', () => {
  it('should create a product and show success message', async () => {
    // Mock API response
    server.use(
      rest.post('/api/products', (req, res, ctx) => {
        return res(ctx.json({ id: '1', ...req.body }));
      })
    );
    
    render(<ProductFormPage />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '19.99' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Product'));
    
    // Check success message
    expect(await screen.findByText('Product created successfully')).toBeInTheDocument();
  });
});
```

### 3. End-to-End Tests

- Test critical user flows
- Test integration with other modules
- Test performance and edge cases

```typescript
// Example E2E test
describe('Product Management', () => {
  it('should allow creating, editing, and deleting a product', async () => {
    // Navigate to products page
    cy.visit('/products');
    
    // Create new product
    cy.findByText('Add Product').click();
    cy.findByLabelText('Name').type('E2E Test Product');
    cy.findByLabelText('Price').type('29.99');
    cy.findByText('Save Product').click();
    
    // Verify product was created
    cy.findByText('Product created successfully').should('exist');
    cy.findByText('E2E Test Product').should('exist');
    
    // Edit product
    cy.findByText('E2E Test Product').click();
    cy.findByLabelText('Name').clear().type('Updated Product');
    cy.findByText('Save Changes').click();
    
    // Verify product was updated
    cy.findByText('Product updated successfully').should('exist');
    cy.findByText('Updated Product').should('exist');
    
    // Delete product
    cy.findByText('Updated Product').click();
    cy.findByText('Delete').click();
    cy.findByText('Confirm').click();
    
    // Verify product was deleted
    cy.findByText('Product deleted successfully').should('exist');
    cy.findByText('Updated Product').should('not.exist');
  });
});
```

## Test Coverage Goals

- **Store**: 90% coverage
- **Hooks**: 85% coverage
- **Components**: 80% coverage
- **Integration**: Key user flows
- **E2E**: Critical business processes

## Testing Tools

- **Unit & Integration**: Jest + React Testing Library
- **E2E**: Cypress
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: Jest Coverage

## Test Organization

```
src/features/products/
├── __tests__/
│   ├── store/
│   │   ├── productStore.test.ts
│   │   └── selectors.test.ts
│   ├── hooks/
│   │   ├── useProductOperations.test.ts
│   │   ├── useProductFilters.test.ts
│   │   └── useProductForm.test.ts
│   ├── components/
│   │   ├── ProductForm.test.tsx
│   │   ├── ProductFormAdapter.test.tsx
│   │   └── ProductsTable.test.tsx
│   └── integration/
│       ├── productCreation.test.tsx
│       └── productEditing.test.tsx
└── e2e/
    ├── productManagement.cy.ts
    └── productImportExport.cy.ts
```

## Testing Priorities

1. Core store functionality
2. CRUD operations in hooks
3. Form validation and submission
4. Table and filtering components
5. Integration between components
6. Critical user flows

## Implementation Plan

### Week 1: Store and Hook Tests
- Set up testing infrastructure
- Write tests for store actions and selectors
- Write tests for core hooks

### Week 2: Component Tests
- Write tests for ProductForm
- Write tests for ProductFormAdapter
- Write tests for table components

### Week 3: Integration Tests
- Write tests for form submission flows
- Write tests for filtering and searching
- Write tests for product operations

### Week 4: E2E Tests
- Set up Cypress
- Write tests for critical user flows
- Write tests for edge cases

## Continuous Integration

- Run unit and integration tests on every PR
- Run E2E tests nightly
- Enforce minimum coverage thresholds
- Block merges if tests fail 