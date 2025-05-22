/**
 * Component Creator Utility
 * 
 * This utility provides functions for creating consistent, well-documented
 * components that follow the project's component system guidelines.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Options for creating a component
 */
export interface CreateComponentOptions<TProps> {
  /**
   * Component display name for debugging
   */
  displayName: string;
  
  /**
   * Component description for documentation
   */
  description: string;
  
  /**
   * Default className to apply
   */
  defaultClassName?: string;
  
  /**
   * Whether the component should forward a ref
   */
  forwardRef?: boolean;
  
  /**
   * Default props
   */
  defaultProps?: Partial<TProps>;
}

/**
 * Creates a new component with consistent documentation and structure
 * @param options Component options
 * @param render Render function for the component
 * @returns The created component
 */
export function createComponent<
  TProps extends { className?: string },
  TRef = HTMLDivElement
>(
  options: CreateComponentOptions<TProps>,
  render: (props: TProps, ref?: React.Ref<TRef>) => React.ReactNode
) {
  const { 
    displayName, 
    description, 
    defaultClassName = '', 
    forwardRef = false,
    defaultProps = {}
  } = options;

  // Create the component based on whether it needs to forward a ref
  const Component = forwardRef
    ? forwardRef<TRef, TProps>((props, ref) => {
        const mergedProps = { ...defaultProps, ...props } as TProps;
        const className = cn(defaultClassName, mergedProps.className);
        
        return render({ ...mergedProps, className }, ref);
      })
    : (props: TProps) => {
        const mergedProps = { ...defaultProps, ...props } as TProps;
        const className = cn(defaultClassName, mergedProps.className);
        
        return render({ ...mergedProps, className });
      };
  
  // Set component metadata
  Component.displayName = displayName;
  
  // Add documentation as a static property
  (Component as any).docs = {
    description,
    props: Object.keys(defaultProps),
  };
  
  return Component;
}

/**
 * Type for component that supports documentation
 */
export type DocumentedComponent<TProps> = React.FC<TProps> & {
  docs: {
    description: string;
    props: string[];
  };
};

/**
 * Creates a component documentation object
 * @param component The component to document
 * @param examples Usage examples
 * @returns Documentation object
 */
export function createComponentDocs<TProps>(
  component: DocumentedComponent<TProps>,
  examples: React.ReactNode[]
) {
  return {
    component,
    description: component.docs.description,
    props: component.docs.props,
    examples
  };
}

/**
 * Default export
 */
export default createComponent; 