/**
 * useLocalStorage Hook Tests
 * 
 * This file contains tests for the useLocalStorage custom hook
 * created in Phase 2.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
  })();
  
  // Replace the global localStorage with our mock
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Clear mock calls between tests
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    localStorageMock.clear();
  });
  
  it('should initialize with the default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });
  
  it('should initialize with the value from localStorage if it exists', () => {
    // Set up localStorage with a value
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('storedValue');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });
  
  it('should update the value in localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });
  
  it('should handle complex objects correctly', () => {
    const complexObject = { name: 'John', age: 30, preferences: { theme: 'dark' } };
    
    const { result } = renderHook(() => useLocalStorage('complexKey', complexObject));
    
    expect(result.current[0]).toEqual(complexObject);
    
    const updatedObject = { ...complexObject, age: 31 };
    
    act(() => {
      result.current[1](updatedObject);
    });
    
    expect(result.current[0]).toEqual(updatedObject);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('complexKey', JSON.stringify(updatedObject));
  });
  
  it('should handle function updates correctly', () => {
    const { result } = renderHook(() => useLocalStorage('countKey', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(2);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  });
  
  it('should handle JSON parsing errors gracefully', () => {
    // Set up localStorage with invalid JSON
    vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error('Invalid JSON');
    });
    
    localStorageMock.setItem('invalidKey', 'not-valid-json');
    
    const { result } = renderHook(() => useLocalStorage('invalidKey', 'fallbackValue'));
    
    expect(result.current[0]).toBe('fallbackValue');
  });
}); 