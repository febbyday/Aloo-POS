/**
 * SearchInput Example Component
 * 
 * This component demonstrates various ways to use the SearchInput component.
 */

import React, { useState } from 'react';
import { SearchInput } from '../molecules';

/**
 * SearchInput example component
 */
export function SearchInputExample() {
  const [searchValue, setSearchValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showClear, setShowClear] = useState(true);
  const [disabled, setDisabled] = useState(false);
  
  // Handle search submit
  const handleSubmit = (value: string) => {
    setSubmittedValue(value);
    console.log('Search submitted:', value);
  };
  
  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Basic Search Input</h2>
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search products..." 
            onChange={setSearchValue}
            onSubmit={handleSubmit}
          />
          
          {searchValue && (
            <div className="mt-2 text-sm text-gray-600">
              Current value: <span className="font-medium">{searchValue}</span>
            </div>
          )}
          
          {submittedValue && (
            <div className="mt-1 text-sm text-gray-600">
              Last submitted: <span className="font-medium">{submittedValue}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Customization Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="size" 
                  checked={size === 'sm'} 
                  onChange={() => setSize('sm')} 
                  className="mr-2"
                />
                Small
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="size" 
                  checked={size === 'md'} 
                  onChange={() => setSize('md')} 
                  className="mr-2"
                />
                Medium
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="size" 
                  checked={size === 'lg'} 
                  onChange={() => setSize('lg')} 
                  className="mr-2"
                />
                Large
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={showClear} 
                  onChange={() => setShowClear(!showClear)} 
                  className="mr-2"
                />
                Show Clear Button
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={disabled} 
                  onChange={() => setDisabled(!disabled)} 
                  className="mr-2"
                />
                Disabled
              </label>
            </div>
          </div>
        </div>
        
        <div className="max-w-md mt-4">
          <SearchInput
            placeholder="Customized search..."
            size={size}
            showClear={showClear}
            disabled={disabled}
            onChange={(value) => console.log('Value changed:', value)}
            onSubmit={(value) => console.log('Search submitted:', value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-medium">Product Search</h3>
            <SearchInput
              placeholder="Search products..."
              size="md"
              className="max-w-full"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">User Search</h3>
            <SearchInput
              placeholder="Search users..."
              size="md"
              className="max-w-full"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">Compact Search</h3>
            <SearchInput
              placeholder="Quick search..."
              size="sm"
              className="max-w-full"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">Large Search with Auto Focus</h3>
            <SearchInput
              placeholder="Detailed search..."
              size="lg"
              autoFocus
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchInputExample; 