/**
 * ESLint Rules for Component Patterns
 * 
 * This file contains custom ESLint rules to enforce the component patterns 
 * documented in component-patterns.md.
 * 
 * To use this configuration:
 * 1. Copy the rules to your .eslintrc.js file
 * 2. Install any required ESLint plugins
 */

module.exports = {
  // These rules should be added to your existing ESLint configuration
  rules: {
    // Discourage direct useState for loading/error states
    'no-restricted-syntax': [
      'warn',
      {
        selector: "CallExpression[callee.name='useState'][arguments.0.value=false][parent.id.name=/^(isLoading|loading)$/]",
        message: "Prefer useDataOperation hook over direct useState for loading states. See src/docs/component-patterns.md"
      },
      {
        selector: "CallExpression[callee.name='useState'][arguments.0.value=null][parent.id.name=/^(error)$/]",
        message: "Prefer useDataOperation hook over direct useState for error states. See src/docs/component-patterns.md"
      },
    ],
    
    // Encourage using the DataState component
    'react/no-unstable-nested-components': [
      'warn',
      {
        allowAsProps: true,
        customValidators: [
          {
            validator: (node) => {
              // Check if this is a conditional rendering based on loading
              if (node.test && 
                  node.test.name === 'loading' || 
                  node.test.name === 'isLoading') {
                return {
                  message: "Prefer using the DataState component instead of conditional rendering for loading states. See src/docs/component-patterns.md"
                };
              }
              return null;
            }
          }
        ]
      }
    ],

    // Custom rule to detect try/catch patterns that should use useDataOperation
    'no-restricted-patterns': [
      'warn',
      {
        message: "Consider using useDataOperation hook instead of manual try/catch with loading states. See src/docs/component-patterns.md",
        selector: `
          TryStatement[block.body.0.expression.callee.object.name='setLoading']
          [finalizer.body.0.expression.callee.object.name='setLoading']
        `
      }
    ],
    
    // Enforce proper import of loading state components
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/components/ui/spinner',
            message: "Import from '@/components/ui/loading-state' instead for consistent loading indicators"
          },
          {
            name: '@/components/spinner',
            message: "Import from '@/components/ui/loading-state' instead for consistent loading indicators"
          },
          {
            name: '@/components/loading',
            message: "Import from '@/components/ui/loading-state' instead for consistent loading indicators"
          }
        ],
        patterns: [
          {
            group: ['**/loading/*', '**/spinner/*'],
            message: "Import from '@/components/ui/loading-state' instead for consistent loading indicators"
          }
        ]
      }
    ]
  },
  
  // Optional plugin for additional validation
  plugins: [
    'react-hooks', // For validating hook usage
    'jsx-a11y', // For accessibility validation
  ],
  
  // Accessibility rules specifically for loading indicators
  'jsx-a11y/rules': {
    'jsx-a11y/aria-role': [
      'error',
      {
        ignoreNonDOM: false,
      }
    ],
    'jsx-a11y/aria-props': 'error',
  },
  
  // Example overrides for project-specific paths
  overrides: [
    {
      files: ['src/features/**/*.tsx', 'src/pages/**/*.tsx'],
      rules: {
        // Apply stricter rules to feature and page components
        'no-restricted-syntax': 'error', // Elevate to error
      }
    }
  ]
}; 