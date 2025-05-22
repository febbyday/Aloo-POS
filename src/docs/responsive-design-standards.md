# Responsive Design Standards

## Breakpoints

The application uses the following breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md - lg)
- **Laptop**: 1024px - 1280px (lg - xl)
- **Desktop**: > 1280px (xl+)

## Core Principles

1. **Mobile-First Approach**: Design for mobile first, then enhance for larger screens
2. **Fluid Layouts**: Use relative units (%, rem, em) instead of fixed pixels
3. **Responsive Typography**: Scale text sizes appropriately across devices
4. **Touch-Friendly Controls**: Ensure interactive elements are at least 44px × 44px for touch targets
5. **Simplified Navigation**: Collapse navigation on smaller screens
6. **Responsive Tables**: Adapt tables for smaller screens using various techniques
7. **Responsive Forms**: Stack form fields on mobile, use columns on larger screens
8. **Media Queries**: Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) consistently

## Implementation Guidelines

### Layout Components

- Use Flexbox and Grid for responsive layouts
- Implement proper spacing that adjusts to screen size
- Ensure content doesn't overflow on small screens

### Navigation

- Mobile: Hamburger menu with slide-out drawer
- Tablet: Collapsed sidebar with icons only
- Desktop: Full sidebar with text and icons

### Forms

- Stack form fields vertically on mobile
- Use 2-column layout on tablet and larger screens where appropriate
- Ensure form controls are touch-friendly
- Maintain proper spacing between form elements

### Tables

- Responsive strategies:
  - Horizontal scrolling for complex tables
  - Card view for mobile (transform rows to cards)
  - Column hiding for less important data
  - Text wrapping and ellipsis for long content

### Cards and Containers

- Full width on mobile
- Grid layout on larger screens
- Consistent padding and margins

### Images and Media

- Use responsive images with appropriate sizing
- Consider art direction for different screen sizes

## Testing

- Test on actual devices when possible
- Use browser dev tools for device simulation
- Test touch interactions on mobile devices
- Verify keyboard navigation works on all screen sizes
