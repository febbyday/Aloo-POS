/**
 * SearchInput Component
 * 
 * A search input component with integrated search icon and clear button.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createComponent } from '../createComponent';
import { Search, X } from 'lucide-react';

/**
 * SearchInput props
 */
export interface SearchInputProps {
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Default value
   */
  defaultValue?: string;
  
  /**
   * Current value (controlled)
   */
  value?: string;
  
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Change handler
   */
  onChange?: (value: string) => void;
  
  /**
   * Submit handler (called when Enter is pressed)
   */
  onSubmit?: (value: string) => void;
  
  /**
   * Whether to show the clear button
   */
  showClear?: boolean;
  
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional props
   */
  [key: string]: any;
}

/**
 * SearchInput component
 */
const SearchInput = createComponent<SearchInputProps>(
  {
    displayName: 'SearchInput',
    description: 'A search input component with integrated search icon and clear button.',
    defaultProps: {
      placeholder: 'Search...',
      showClear: true,
      size: 'md',
    },
  },
  (props) => {
    const {
      placeholder = 'Search...',
      defaultValue = '',
      value: controlledValue,
      disabled = false,
      className = '',
      onChange,
      onSubmit,
      showClear = true,
      size = 'md',
      ...rest
    } = props;
    
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const inputValue = isControlled ? controlledValue : uncontrolledValue;
    
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-8 text-sm';
        case 'lg':
          return 'h-12 text-lg';
        default:
          return 'h-10 text-base';
      }
    };
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      
      onChange?.(newValue);
    };
    
    // Handle key press (Enter)
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit(inputValue || '');
      }
    };
    
    // Handle clear button click
    const handleClear = () => {
      if (!isControlled) {
        setUncontrolledValue('');
      }
      
      onChange?.('');
      inputRef.current?.focus();
    };
    
    // Focus input on mount
    useEffect(() => {
      if (rest.autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [rest.autoFocus]);
    
    const sizeClasses = getSizeClasses();
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
    
    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <div className="absolute left-2.5 text-gray-400">
          <Search size={iconSize} />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className={`${sizeClasses} pl-9 pr-${showClear && inputValue ? '10' : '3'}`}
          {...rest}
        />
        
        {showClear && inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            disabled={disabled}
            tabIndex={-1}
          >
            <X size={iconSize - 2} />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    );
  }
);

export default SearchInput; 