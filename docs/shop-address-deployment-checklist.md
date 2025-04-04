# Shop Address Deployment Checklist

This checklist outlines the steps to verify that the shop address structure has been properly implemented and deployed.

## Backend Verification

- [x] Address type is properly defined in the shared schema
- [x] Address type is properly imported in the backend types
- [x] ShopAddress type is properly defined in the backend types
- [x] Address schema is properly defined in the shared schema
- [x] Address validation is properly implemented in the backend

## Database Verification

- [x] Address column exists in the Shop table
- [x] Old address columns have been removed from the Shop table
- [x] Address data has been properly migrated to the new structure
- [x] Address data is properly formatted as a JSON object
- [x] Required address fields are present in the address data

## Frontend Verification

- [x] ShopDetailsPage displays the address correctly
- [x] ShopsPage displays the address correctly in shop cards
- [x] ShopDialog form has fields for the address components
- [x] Address validation is properly implemented in the form
- [x] Address data is properly submitted to the backend

## Testing

- [x] Unit tests for the shop service have been updated
- [x] Unit tests for the shop components have been updated
- [x] Integration tests for the shop address flow have been updated
- [x] All tests pass

## Deployment

- [ ] Changes have been deployed to the staging environment
- [ ] Verification scripts have been run in the staging environment
- [ ] Changes have been deployed to the production environment
- [ ] Verification scripts have been run in the production environment
- [ ] Rollback plan has been tested and is ready in case of issues

## Post-Deployment

- [ ] Monitor the application for any issues related to shop addresses
- [ ] Update documentation to reflect the new address structure
- [ ] Remove any temporary migration scripts or files

## Notes

- The address structure has been updated to use a JSON object instead of individual fields
- The address object has the following structure:
  ```json
  {
    "street": "123 Main Street",
    "street2": "Suite 100",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- Required fields: street, city, state, postalCode, country
- Optional fields: street2, latitude, longitude
