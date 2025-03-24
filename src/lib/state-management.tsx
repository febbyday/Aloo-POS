import React, { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';

// Generic type for any entity with an ID
export interface Entity {
  id: string;
  [key: string]: any;
}

// Action types for CRUD operations
export type ActionType = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Entity[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'CREATE'; payload: Entity }
  | { type: 'UPDATE'; payload: Entity }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_SELECTED'; payload: string | null }
  | { type: 'RESET' };

// State interface for the entity store
export interface EntityState<T extends Entity> {
  items: T[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

// Initial state factory
export const createInitialState = <T extends Entity>(): EntityState<T> => ({
  items: [],
  loading: false,
  error: null,
  selectedId: null,
});

// Generic reducer for entity CRUD operations
export const createEntityReducer = <T extends Entity>() => {
  return (state: EntityState<T>, action: ActionType): EntityState<T> => {
    switch (action.type) {
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null,
        };
      case 'FETCH_SUCCESS':
        return {
          ...state,
          items: action.payload as T[],
          loading: false,
          error: null,
        };
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.error,
        };
      case 'CREATE':
        return {
          ...state,
          items: [...state.items, action.payload as T],
        };
      case 'UPDATE':
        return {
          ...state,
          items: state.items.map(item => 
            item.id === (action.payload as T).id ? action.payload as T : item
          ),
        };
      case 'DELETE':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
          selectedId: state.selectedId === action.payload ? null : state.selectedId,
        };
      case 'SET_SELECTED':
        return {
          ...state,
          selectedId: action.payload,
        };
      case 'RESET':
        return createInitialState<T>();
      default:
        return state;
    }
  };
};

// Type for the context value
export interface EntityContextValue<T extends Entity> {
  state: EntityState<T>;
  dispatch: React.Dispatch<ActionType>;
  getById: (id: string) => T | undefined;
  getSelected: () => T | undefined;
  create: (item: Omit<T, 'id'>) => void;
  update: (item: T) => void;
  remove: (id: string) => void;
  setSelected: (id: string | null) => void;
  reset: () => void;
}

// Create a typed context creator
export function createEntityContext<T extends Entity>() {
  return createContext<EntityContextValue<T> | undefined>(undefined);
}

// Hook factory for creating entity providers
export function createEntityProvider<T extends Entity>(
  EntityContext: React.Context<EntityContextValue<T> | undefined>,
  entityName: string,
  fetchItems?: () => Promise<T[]>,
  storageKey?: string
) {
  return function EntityProvider({ children }: { children: React.ReactNode }) {
    const reducer = createEntityReducer<T>();
    const [state, dispatch] = useReducer(reducer, createInitialState<T>());

    // Load from localStorage if storageKey is provided
    useEffect(() => {
      if (storageKey) {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            dispatch({ type: 'FETCH_SUCCESS', payload: parsedData });
          } catch (error) {
            console.error(`Error parsing ${entityName} data from localStorage:`, error);
          }
        }
      }
    }, [storageKey]);

    // Fetch data if fetchItems function is provided
    useEffect(() => {
      if (fetchItems) {
        const loadData = async () => {
          dispatch({ type: 'FETCH_START' });
          try {
            const data = await fetchItems();
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
          } catch (error) {
            dispatch({ 
              type: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : `Failed to fetch ${entityName}`
            });
          }
        };

        loadData();
      }
    }, [fetchItems]);

    // Save to localStorage when state changes
    useEffect(() => {
      if (storageKey && state.items.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      }
    }, [state.items, storageKey]);

    // Helper functions
    const getById = (id: string) => state.items.find(item => item.id === id);
    
    const getSelected = () => 
      state.selectedId ? state.items.find(item => item.id === state.selectedId) : undefined;

    const create = (item: Omit<T, 'id'>) => {
      const newItem = {
        ...item,
        id: `${entityName.toLowerCase()}_${Date.now()}`,
      } as T;
      
      dispatch({ type: 'CREATE', payload: newItem });
    };

    const update = (item: T) => {
      dispatch({ type: 'UPDATE', payload: item });
    };

    const remove = (id: string) => {
      dispatch({ type: 'DELETE', payload: id });
    };

    const setSelected = (id: string | null) => {
      dispatch({ type: 'SET_SELECTED', payload: id });
    };

    const reset = () => {
      dispatch({ type: 'RESET' });
    };

    const value = useMemo(() => ({
      state,
      dispatch,
      getById,
      getSelected,
      create,
      update,
      remove,
      setSelected,
      reset
    }), [state]);

    return (
      <EntityContext.Provider value={value}>
        {children}
      </EntityContext.Provider>
    );
  };
}

// Hook factory for consuming entity contexts
export function createEntityHook<T extends Entity>(
  EntityContext: React.Context<EntityContextValue<T> | undefined>,
  entityName: string
) {
  return function useEntity() {
    const context = useContext(EntityContext);
    if (context === undefined) {
      throw new Error(`use${entityName} must be used within a ${entityName}Provider`);
    }
    return context;
  };
}

// Hook for managing filters and pagination
export interface FilterState<T> {
  filters: Partial<T>;
  search: string;
  sort: {
    field: keyof T | null;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export function useEntityFilters<T extends Entity>(
  items: T[],
  initialFilters: Partial<T> = {},
  initialPageSize: number = 10
) {
  const [filterState, setFilterState] = useState<FilterState<T>>({
    filters: initialFilters,
    search: '',
    sort: {
      field: null,
      direction: 'asc',
    },
    pagination: {
      page: 1,
      pageSize: initialPageSize,
      total: items.length,
    },
  });

  // Apply filters, search, and sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply filters
    if (Object.keys(filterState.filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filterState.filters).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          return item[key] === value;
        });
      });
    }

    // Apply search
    if (filterState.search) {
      const searchLower = filterState.search.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower);
          }
          return false;
        });
      });
    }

    // Apply sorting
    if (filterState.sort.field) {
      result.sort((a, b) => {
        const aValue = a[filterState.sort.field as keyof T];
        const bValue = b[filterState.sort.field as keyof T];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return filterState.sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [items, filterState]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const { page, pageSize } = filterState.pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredItems.slice(start, end);
  }, [filteredItems, filterState.pagination]);

  // Update total count when filtered items change
  useEffect(() => {
    setFilterState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: filteredItems.length,
        page: filteredItems.length === 0 ? 1 : Math.min(prev.pagination.page, Math.ceil(filteredItems.length / prev.pagination.pageSize))
      }
    }));
  }, [filteredItems.length]);

  // Helper functions
  const setFilters = (filters: Partial<T>) => {
    setFilterState(prev => ({
      ...prev,
      filters,
      pagination: {
        ...prev.pagination,
        page: 1
      }
    }));
  };

  const setSearch = (search: string) => {
    setFilterState(prev => ({
      ...prev,
      search,
      pagination: {
        ...prev.pagination,
        page: 1
      }
    }));
  };

  const setSort = (field: keyof T, direction?: 'asc' | 'desc') => {
    setFilterState(prev => ({
      ...prev,
      sort: {
        field,
        direction: direction || (prev.sort.field === field && prev.sort.direction === 'asc' ? 'desc' : 'asc')
      }
    }));
  };

  const setPage = (page: number) => {
    setFilterState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page
      }
    }));
  };

  const setPageSize = (pageSize: number) => {
    setFilterState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        pageSize,
        page: 1
      }
    }));
  };

  const resetFilters = () => {
    setFilterState(prev => ({
      ...prev,
      filters: initialFilters,
      search: '',
      pagination: {
        ...prev.pagination,
        page: 1
      }
    }));
  };

  return {
    filterState,
    filteredItems,
    paginatedItems,
    setFilters,
    setSearch,
    setSort,
    setPage,
    setPageSize,
    resetFilters
  };
}

// Hook for managing form state with validation
export function useEntityForm<T extends Entity, E = Record<keyof T, string>>(
  initialValues: Partial<T>,
  validate?: (values: Partial<T>) => E
) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Partial<E>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when initialValues change
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is changed
    if (errors[name as keyof E]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur if validate function exists
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name as keyof E]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name as keyof E]
        }));
      }
    }
  };

  const validateForm = () => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (hasErrors) {
      setErrors(validationErrors);
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      
      setTouched(allTouched);
    }
    
    return !hasErrors;
  };

  const handleSubmit = async (onSubmit: (values: Partial<T>) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(values);
        // Reset form after successful submission
        setTouched({} as Record<keyof T, boolean>);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
}
