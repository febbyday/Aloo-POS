# Products Module Routing Plan

This document outlines the plan for updating the routing to use the new page components while maintaining backward compatibility.

## Current Routing Structure

The current routing structure for the Products module is defined in `src/routes/productRoutes.ts`:

```typescript
export const PRODUCTS_ROUTES = {
  ROOT: 'products',
  LIST: '',
  ADD: 'add',
  EDIT: 'edit/:id',
  DETAILS: 'details/:id',
  CATEGORIES: 'categories',
  PRICING: 'pricing',
  STOCK: {
    ROOT: 'stock',
    ALERTS: 'alerts',
    HISTORY: 'history',
    TRANSFER: 'transfer',
    CREATE_TRANSFER: 'transfer/create',
    EDIT_TRANSFER: 'transfer/edit/:id',
  },
  LABELS: 'labels',
};

export const PRODUCTS_FULL_ROUTES = {
  ROOT: '/products',
  LIST: '/products',
  ADD: '/products/add',
  EDIT: (id: string) => `/products/edit/${id}`,
  DETAILS: (id: string) => `/products/details/${id}`,
  CATEGORIES: '/products/categories',
  PRICING: '/products/pricing',
  STOCK: {
    ROOT: '/products/stock',
    ALERTS: '/products/stock/alerts',
    HISTORY: '/products/stock/history',
    TRANSFER: '/products/stock/transfer',
    CREATE_TRANSFER: '/products/stock/transfer/create',
    EDIT_TRANSFER: (id: string) => `/products/stock/transfer/edit/${id}`,
  },
  LABELS: '/products/labels',
};
```

## New Routing Structure

We'll update the routing structure to support both legacy and new pages:

```typescript
export const PRODUCTS_ROUTES = {
  // Legacy routes
  ROOT: 'products',
  LIST: '',
  ADD: 'add',
  EDIT: 'edit/:id',
  DETAILS: 'details/:id',
  CATEGORIES: 'categories',
  PRICING: 'pricing',
  STOCK: {
    ROOT: 'stock',
    ALERTS: 'alerts',
    HISTORY: 'history',
    TRANSFER: 'transfer',
    CREATE_TRANSFER: 'transfer/create',
    EDIT_TRANSFER: 'transfer/edit/:id',
  },
  LABELS: 'labels',
  
  // New routes
  NEW: {
    ROOT: 'new',
    LIST: 'list',
    FORM: 'form',
    FORM_EDIT: 'form/:id',
    DETAILS: 'view/:id',
  },
};

export const PRODUCTS_FULL_ROUTES = {
  // Legacy routes
  ROOT: '/products',
  LIST: '/products',
  ADD: '/products/add',
  EDIT: (id: string) => `/products/edit/${id}`,
  DETAILS: (id: string) => `/products/details/${id}`,
  CATEGORIES: '/products/categories',
  PRICING: '/products/pricing',
  STOCK: {
    ROOT: '/products/stock',
    ALERTS: '/products/stock/alerts',
    HISTORY: '/products/stock/history',
    TRANSFER: '/products/stock/transfer',
    CREATE_TRANSFER: '/products/stock/transfer/create',
    EDIT_TRANSFER: (id: string) => `/products/stock/transfer/edit/${id}`,
  },
  LABELS: '/products/labels',
  
  // New routes
  NEW: {
    ROOT: '/products/new',
    LIST: '/products/new/list',
    FORM: '/products/new/form',
    FORM_EDIT: (id: string) => `/products/new/form/${id}`,
    DETAILS: (id: string) => `/products/new/view/${id}`,
  },
};
```

## Route Configuration

We'll update the route configuration to include both legacy and new pages:

```typescript
// In src/routes/index.tsx
import { ProductsPage, ProductAddPage, ProductEditPage, ProductDetailsPage } from '../features/products/pages';
import { ProductPage, ProductFormPage } from '../features/products/pages';

const routes = [
  // Legacy routes
  {
    path: PRODUCTS_ROUTES.ROOT,
    element: <ProductsLayout />,
    children: [
      { path: PRODUCTS_ROUTES.LIST, element: <ProductsPage /> },
      { path: PRODUCTS_ROUTES.ADD, element: <ProductAddPage /> },
      { path: PRODUCTS_ROUTES.EDIT, element: <ProductEditPage /> },
      { path: PRODUCTS_ROUTES.DETAILS, element: <ProductDetailsPage /> },
      // ... other legacy routes
    ],
  },
  
  // New routes
  {
    path: `${PRODUCTS_ROUTES.ROOT}/${PRODUCTS_ROUTES.NEW.ROOT}`,
    element: <ProductsLayout />,
    children: [
      { path: PRODUCTS_ROUTES.NEW.LIST, element: <ProductPage /> },
      { path: PRODUCTS_ROUTES.NEW.FORM, element: <ProductFormPage /> },
      { path: PRODUCTS_ROUTES.NEW.FORM_EDIT, element: <ProductFormPage /> },
      { path: PRODUCTS_ROUTES.NEW.DETAILS, element: <ProductDetailsPage /> },
    ],
  },
];
```

## Feature Flag for Routing

We'll implement a feature flag to control which version of the pages is used:

```typescript
// In src/config/features.ts
export const FEATURES = {
  PRODUCTS: {
    USE_NEW_PAGES: true,
  },
};

// In src/routes/index.tsx
import { FEATURES } from '../config/features';

const routes = [
  {
    path: PRODUCTS_ROUTES.ROOT,
    element: <ProductsLayout />,
    children: [
      { 
        path: PRODUCTS_ROUTES.LIST, 
        element: FEATURES.PRODUCTS.USE_NEW_PAGES 
          ? <Navigate to={PRODUCTS_FULL_ROUTES.NEW.LIST} replace /> 
          : <ProductsPage /> 
      },
      { 
        path: PRODUCTS_ROUTES.ADD, 
        element: FEATURES.PRODUCTS.USE_NEW_PAGES 
          ? <Navigate to={PRODUCTS_FULL_ROUTES.NEW.FORM} replace /> 
          : <ProductAddPage /> 
      },
      // ... other routes with feature flag redirects
    ],
  },
  
  // New routes are always available
  {
    path: `${PRODUCTS_ROUTES.ROOT}/${PRODUCTS_ROUTES.NEW.ROOT}`,
    element: <ProductsLayout />,
    children: [
      { path: PRODUCTS_ROUTES.NEW.LIST, element: <ProductPage /> },
      { path: PRODUCTS_ROUTES.NEW.FORM, element: <ProductFormPage /> },
      { path: PRODUCTS_ROUTES.NEW.FORM_EDIT, element: <ProductFormPage /> },
      { path: PRODUCTS_ROUTES.NEW.DETAILS, element: <ProductDetailsPage /> },
    ],
  },
];
```

## Navigation Components

We'll update navigation components to use the appropriate routes based on the feature flag:

```typescript
// In src/components/navigation/ProductsNav.tsx
import { FEATURES } from '../../config/features';
import { PRODUCTS_FULL_ROUTES } from '../../routes/productRoutes';

export const ProductsNav = () => {
  const listRoute = FEATURES.PRODUCTS.USE_NEW_PAGES 
    ? PRODUCTS_FULL_ROUTES.NEW.LIST 
    : PRODUCTS_FULL_ROUTES.LIST;
  
  const addRoute = FEATURES.PRODUCTS.USE_NEW_PAGES 
    ? PRODUCTS_FULL_ROUTES.NEW.FORM 
    : PRODUCTS_FULL_ROUTES.ADD;
  
  return (
    <nav>
      <Link to={listRoute}>Products</Link>
      <Link to={addRoute}>Add Product</Link>
      {/* ... other navigation links */}
    </nav>
  );
};
```

## Implementation Plan

### Phase 1: Setup New Routes
- Update route definitions to include new routes
- Create feature flag configuration
- Implement new page components with basic functionality

### Phase 2: Implement Feature Flag Redirects
- Add conditional redirects based on feature flags
- Update navigation components to use appropriate routes
- Test both legacy and new routes

### Phase 3: Gradual Rollout
- Set feature flag to false by default
- Allow users to opt-in to new pages via settings
- Collect feedback and make improvements

### Phase 4: Complete Migration
- Set feature flag to true by default
- Add deprecation notices to legacy routes
- Plan for removal of legacy routes

## Testing Strategy

- Test both legacy and new routes
- Verify that feature flag redirects work correctly
- Test navigation between pages
- Test deep linking to specific pages
- Test browser history and back/forward navigation

## Backward Compatibility

- Legacy routes will continue to work during the transition
- Links to legacy routes will be redirected to new routes when feature flag is enabled
- External links to legacy routes will continue to work

## Timeline

- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 1 week
- Total: 5 weeks 