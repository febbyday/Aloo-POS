# Staff Bank Branch Implementation

This documentation details the implementation of the branch location feature for staff banking details in the POS system.

## Overview

The staff bank branch feature enhances the banking details module by adding branch location information. This is essential for proper payroll processing and financial operations that require specific bank branch information.

## Technical Implementation

### 1. Data Model Changes

#### Staff Banking Details Schema

The `staffSchema` was updated to include branch location in the banking details:

```typescript
bankingDetails: z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountType: z.string().min(1, "Account type is required"),
  branchLocation: z.string().min(1, "Branch location is required"), // New field
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
  bankAddress: z.string().optional(),
}).optional()
```

### 2. Form Component Updates

#### StaffModal Component

The `StaffModal` component's banking details section was enhanced to include a field for branch location:

```tsx
<FormField
  control={form.control}
  name="bankingDetails.branchLocation"
  render={({ field }) => (
    <FormFieldWrapper label="Branch Location">
      <Input {...field} readOnly={isReadOnly} />
    </FormFieldWrapper>
  )}
/>
```

### 3. UI Display Updates

#### StaffDetailsPage Component

The staff details page was updated to display the branch location:

```tsx
<div className="grid grid-cols-3">
  <span className="text-sm font-medium">Branch Location</span>
  <span className="text-sm col-span-2">
    {staff.bankingDetails.branchLocation || "Not specified"}
  </span>
</div>
```

### 4. API Integration

#### Backend API Endpoint

The backend API now supports the branch location field in the staff banking details:

```javascript
// Example of staff data structure in the API
{
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  // ... other staff fields
  bankingDetails: {
    accountName: 'John Doe',
    accountNumber: '1234567890',
    bankName: 'Example Bank',
    accountType: 'Checking',
    branchLocation: 'Downtown Branch', // New field
    branchCode: '001',
    swiftCode: 'EXBKUS33',
  }
}
```

#### Frontend Service

The staff service was updated to handle the new field when making API calls:

```typescript
create: async (data: Partial<Staff>, requestId: string = 'createStaff'): Promise<Staff> => {
  // API call implementation with banking details including branch location
}
```

## Validation

Form validation was updated to include rules for the branch location field:

```typescript
bankingDetails: {
  // ... other validation messages
  branchLocation: {
    required: "Branch location is required"
  }
}
```

## Testing

The feature can be tested by:

1. Creating a new staff member with banking details including branch location
2. Updating an existing staff member to add or change branch location
3. Viewing staff details to confirm the branch location is displayed correctly

## Future Enhancements

Potential future enhancements include:

1. Adding a dropdown of common bank branches based on the selected bank
2. Implementing validation for branch codes against bank-specific formats
3. Adding automated lookup of branch information based on branch code 