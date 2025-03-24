// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
// 
// 👉 Frontend Standards:
// 1. Code organization: Components are organized by feature, not by type.
// 2. Naming conventions: Use PascalCase for component names and camelCase for variable names.
// 3. Code style: Use consistent spacing, indentation, and line wrapping.
// 4. Performance optimization: Avoid unnecessary re-renders and use memoization when possible.
// 5. Accessibility: Follow WAI-ARIA guidelines for accessible components.
// 6. Testing: Write unit tests for components and integration tests for features.
// 7. Code reviews: Perform code reviews before merging code into the main branch.

import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navigation } from '@/config/navigation';

/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

export function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img
            className="h-8 w-auto"
            src="/logo.svg"
            alt="POS System"
          />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.title}>
                    {item.children ? (
                      <div className="space-y-1">
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                              'hover:bg-accent hover:text-accent-foreground',
                              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                            )
                          }
                        >
                          {item.icon && <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />}
                          {item.title}
                        </NavLink>
                        <ul className="ml-6 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.title}>
                              <NavLink
                                to={child.href}
                                className={({ isActive }) =>
                                  cn(
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                                  )
                                }
                              >
                                {child.icon && <child.icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
                                {child.title}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                          )
                        }
                      >
                        {item.icon && <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />}
                        {item.title}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
