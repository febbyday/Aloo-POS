/**
 * Badge Component Tests
 * 
 * This file contains tests for the Badge component.
 */

import { describe, it, expect } from 'vitest';
import { customRender, screen } from '@/test/utils';
import { Badge } from './Badge';

describe('Badge Component', () => {
  // Test rendering with default props
  it('renders with default props', () => {
    customRender(<Badge>Test Badge</Badge>);
    
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
  });
  
  // Test rendering different variants
  it('renders different variants correctly', () => {
    const { rerender } = customRender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
    
    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
    
    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border');
    
    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-success');
    
    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-warning');
  });
  
  // Test rendering different sizes
  it('renders different sizes correctly', () => {
    const { rerender } = customRender(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');
    
    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('text-sm');
    
    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-base');
  });
  
  // Test applying custom class name
  it('applies custom className', () => {
    customRender(<Badge className="custom-class">Custom Class</Badge>);
    expect(screen.getByText('Custom Class')).toHaveClass('custom-class');
  });
  
  // Test passing additional props
  it('passes additional props to the element', () => {
    customRender(<Badge data-testid="test-badge">Test Props</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });
}); 