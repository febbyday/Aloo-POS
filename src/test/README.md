# Testing Framework Documentation

This document provides guidelines and instructions for using the testing framework in the POS system.

## Overview

The POS system uses Vitest as the testing framework along with React Testing Library for component testing. This combination provides a fast, modern testing environment with a focus on testing components as users would interact with them.

## Getting Started

### Running Tests

The following npm scripts are available for running tests:

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (tests rerun when files change)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface
- `npm run test:e2e` - Run end-to-end tests

### Test File Structure

Test files should be co-located with the code they test, using the `.test.tsx` or `.spec.tsx` suffix:

```
src/
  features/
    products/
      components/
        ProductCard.tsx
        ProductCard.test.tsx
```

## Writing Tests

### Component Tests

For testing React components, use the `customRender` function from our test utilities:

```tsx
import { customRender, screen } from '@/test/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    customRender(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Testing with User Interactions

For testing user interactions, use the `userEvent` from our test utilities:

```tsx
import { customRender, screen, userEvent } from '@/test/utils';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<Counter />);
    
    await user.click(screen.getByRole('button', { name: /increment/i }));
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Testing Forms

For testing forms, use a combination of `userEvent` and form queries:

```tsx
import { customRender, screen, userEvent, waitFor } from '@/test/utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits the form with user data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    customRender(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });
});
```

### Testing with Routes

For components that depend on routing, use the `customRender` function with the `route` option:

```tsx
import { customRender, screen } from '@/test/utils';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user information', () => {
    customRender(<UserProfile />, { 
      route: '/users/123' 
    });
    
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });
});
```

### Testing Accessibility

Use the `testAccessibility` function to check for accessibility violations:

```tsx
import { customRender, testAccessibility } from '@/test/utils';
import { Button } from './Button';

describe('Button', () => {
  it('has no accessibility violations', async () => {
    const { container } = customRender(<Button>Click me</Button>);
    const results = await testAccessibility(container);
    
    expect(results.violations.length).toBe(0);
  });
});
```

## Mocking

### Mocking Hooks

Use Vitest's mocking capabilities to mock hooks:

```tsx
import { vi } from 'vitest';
import { customRender, screen } from '@/test/utils';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedComponent } from './ProtectedComponent';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('ProtectedComponent', () => {
  it('shows content when user is authenticated', () => {
    // Set up the mock implementation
    (useAuth as any).mockReturnValue({ 
      isAuthenticated: true, 
      user: { name: 'Test User' } 
    });
    
    customRender(<ProtectedComponent />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  it('redirects when user is not authenticated', () => {
    // Change the mock implementation
    (useAuth as any).mockReturnValue({ 
      isAuthenticated: false, 
      user: null 
    });
    
    customRender(<ProtectedComponent />);
    expect(screen.getByText('Please login')).toBeInTheDocument();
  });
});
```

### Mocking API Calls

For mocking API calls, use Vitest's mocking with fetch or axios:

```tsx
import { vi } from 'vitest';
import { customRender, screen, waitFor } from '@/test/utils';
import { UserList } from './UserList';

// Mock fetch globally
global.fetch = vi.fn();

describe('UserList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('displays users from API', async () => {
    // Mock the fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [{ id: 1, name: 'John Doe' }] })
    });
    
    customRender(<UserList />);
    
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // After loading, shows the user
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/users');
  });
});
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it.
2. **Use role-based queries** - Prefer queries like `getByRole` over `getByTestId`.
3. **Test from the user's perspective** - Write tests that simulate how users interact with your components.
4. **Keep tests simple** - Each test should verify one specific behavior.
5. **Use descriptive test names** - Test names should clearly describe what is being tested.
6. **Avoid testing library internals** - Don't test the behavior of third-party libraries.
7. **Clean up after tests** - The `afterEach` cleanup is handled automatically, but be mindful of any additional cleanup needed.

## Troubleshooting

### Common Issues

1. **Test can't find elements** - Check if the element is actually rendered, or if you need to use a different query.
2. **Async updates not reflected** - Use `waitFor` or `findBy` queries for elements that appear after async operations.
3. **Event handlers not triggered** - Make sure you're using `userEvent` correctly and waiting for any async operations.

### Debugging Tips

1. **Use screen.debug()** - This will print the current DOM state to the console.
2. **Use test.only** - Focus on a specific test with `it.only` or `describe.only`.
3. **Check the test output** - Look for error messages and stack traces in the test output.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
- [Common Testing Library Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 