# Shop Address Tests

This directory contains tests for the shop address functionality, ensuring that the address data is correctly displayed and saved throughout the application.

## Test Structure

The tests are organized into the following categories:

### Frontend Tests

1. **Service Tests** (`services/shopService.test.ts`)
   - Tests the shop service functionality, focusing on address handling
   - Verifies that shops are returned with structured address objects
   - Tests creating and updating shops with address data

2. **Component Tests**
   - **ShopDialog Tests** (`components/ShopDialog.test.ts`)
     - Tests the ShopDialog component's handling of address fields
     - Verifies that address fields are correctly rendered and populated
     - Tests address field validation and submission

   - **ShopDetailsPage Tests** (`components/ShopDetailsPage.test.ts`)
     - Tests the ShopDetailsPage component's display of address information
     - Verifies that address data is correctly formatted and displayed
     - Tests handling of missing or incomplete address data

   - **ShopsPage Tests** (`components/ShopsPage.test.ts`)
     - Tests the ShopsPage component's display of address information in shop cards
     - Verifies that address data is correctly formatted in the shop list

3. **Integration Tests** (`integration/shopAddressFlow.test.tsx`)
   - Tests the full flow of creating, viewing, and updating a shop with address data
   - Verifies that address data is correctly passed between components and services

### Backend Tests

1. **Controller Tests** (`backend/src/__tests__/controllers/shopController.test.ts`)
   - Tests the shop controller's handling of address data
   - Verifies that address validation is correctly applied
   - Tests creating and updating shops with address data

2. **Service Tests** (`backend/src/__tests__/services/shopService.test.ts`)
   - Tests the shop service's handling of address data
   - Verifies that address validation is correctly applied
   - Tests error handling for invalid address data

## Running the Tests

To run all the shop tests:

```bash
npm test -- --testPathPattern=src/features/shops/__tests__
```

To run a specific test file:

```bash
npm test -- src/features/shops/__tests__/components/ShopDialog.test.tsx
```

To run tests with coverage:

```bash
npm run test:coverage -- --testPathPattern=src/features/shops/__tests__
```

## Test Coverage

These tests cover the following aspects of the shop address functionality:

1. **Data Structure**
   - Verifies that the address is stored as a structured object
   - Tests all address fields (street, street2, city, state, postalCode, country)

2. **Form Handling**
   - Tests address field validation
   - Verifies that address data is correctly submitted in forms

3. **Display**
   - Tests that address data is correctly formatted for display
   - Verifies that address components are correctly rendered

4. **API Integration**
   - Tests that address data is correctly passed between frontend and backend
   - Verifies that address validation is applied consistently

5. **Error Handling**
   - Tests handling of missing or invalid address data
   - Verifies that appropriate error messages are displayed
