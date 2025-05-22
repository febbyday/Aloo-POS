# Formatter Utilities Migration Scripts

This directory contains utility scripts to help with code maintenance and migration tasks.

## Formatter Imports Update Script

The `update-formatter-imports.js` script automatically updates imports of formatting utilities from `@/lib/utils` to their standardized location in `@/lib/utils/formatters`.

### Prerequisites

Make sure you have the required dependencies:

```bash
npm install glob
```

### Usage

To run the script with a preview of changes (without modifying files):

```bash
node scripts/update-formatter-imports.js --dry-run
```

To apply the changes:

```bash
node scripts/update-formatter-imports.js
```

For detailed output about each file:

```bash
node scripts/update-formatter-imports.js --verbose
```

### What This Script Does

1. Finds all TypeScript/TSX files in the `src` directory
2. Identifies imports from `@/lib/utils` that contain formatter functions
3. Moves those formatter imports to `@/lib/utils/formatters`
4. Handles the special case of `truncate` becoming `truncateText`
5. Preserves other non-formatter imports from `@/lib/utils`

### Formatter Functions Migrated

The following formatter functions will be migrated:

- `formatCurrency`
- `formatDate`
- `formatNumber`
- `formatPercentage`
- `formatRelativeTime`
- `truncate` → `truncateText`
- `formatFileSize`
- `formatPhoneNumber`

### After Running the Script

After running the script, it's recommended to:

1. Run TypeScript type-checking to make sure everything compiles:
   ```bash
   npx tsc --noEmit
   ```

2. Manually verify a few updated files to ensure the changes look correct

3. Run your tests to ensure the behavior remains the same:
   ```bash
   npm test
   ```
