import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { 
  VariationTemplate, 
  VariationTemplateFormData, 
  VariationTemplateFilter, 
  VariationTemplateSort,
  PREDEFINED_VARIATION_TEMPLATES
} from '../types/variation-template';

// Storage key for local storage
const STORAGE_KEY = 'pos_variation_templates';

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize templates with predefined ones if none exist
const initializeTemplates = (): VariationTemplate[] => {
  const storedTemplates = localStorage.getItem(STORAGE_KEY);
  
  if (storedTemplates) {
    return JSON.parse(storedTemplates);
  }
  
  // Create initial templates from predefined ones
  const initialTemplates = PREDEFINED_VARIATION_TEMPLATES.map((template, index) => ({
    ...template,
    id: `template-${index + 1}`,
    isDefault: index === 0, // Make the first one default
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  }));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTemplates));
  return initialTemplates;
};

interface VariationTemplateContextType {
  templates: VariationTemplate[];
  loading: boolean;
  error: Error | null;
  selectedTemplates: string[];
  filters: VariationTemplateFilter;
  sort: VariationTemplateSort;
  setSelectedTemplates: (ids: string[]) => void;
  setFilters: (filters: VariationTemplateFilter) => void;
  setSort: (sort: VariationTemplateSort) => void;
  addTemplate: (data: VariationTemplateFormData) => Promise<VariationTemplate>;
  updateTemplate: (id: string, data: Partial<VariationTemplateFormData>) => Promise<VariationTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  deleteTemplates: (ids: string[]) => Promise<void>;
  getTemplate: (id: string) => VariationTemplate | undefined;
  applyTemplate: (id: string) => Promise<VariationTemplate>;
  duplicateTemplate: (id: string) => Promise<VariationTemplate>;
  setDefaultTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

export const VariationTemplateContext = createContext<VariationTemplateContextType | undefined>(undefined);

export function VariationTemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<VariationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [filters, setFilters] = useState<VariationTemplateFilter>({});
  const [sort, setSort] = useState<VariationTemplateSort>({ field: 'name', direction: 'asc' });

  // Load templates from local storage on mount
  useEffect(() => {
    try {
      const loadedTemplates = initializeTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get filtered and sorted templates
  const getFilteredTemplates = useCallback(() => {
    let filtered = [...templates];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search)
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(template => template.category === filters.category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sort.field) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'category':
          valueA = a.category;
          valueB = b.category;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
          break;
        case 'usageCount':
          valueA = a.usageCount;
          valueB = b.usageCount;
          break;
        case 'lastUsed':
          valueA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          valueB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sort.direction === 'asc' 
          ? (valueA as number) - (valueB as number) 
          : (valueB as number) - (valueA as number);
      }
    });

    return filtered;
  }, [templates, filters, sort]);

  // Save templates to local storage
  const saveTemplatesToStorage = useCallback((updatedTemplates: VariationTemplate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  }, []);

  // Add a new template
  const addTemplate = async (data: VariationTemplateFormData): Promise<VariationTemplate> => {
    setLoading(true);
    try {
      const newTemplate: VariationTemplate = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isDefault: data.isDefault || false
      };

      // If this template is set as default, update other templates
      const updatedTemplates = [...templates];
      if (newTemplate.isDefault) {
        updatedTemplates.forEach(template => {
          template.isDefault = false;
        });
      }

      updatedTemplates.push(newTemplate);
      saveTemplatesToStorage(updatedTemplates);
      
      return newTemplate;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing template
  const updateTemplate = async (id: string, data: Partial<VariationTemplateFormData>): Promise<VariationTemplate> => {
    setLoading(true);
    try {
      const updatedTemplates = [...templates];
      const index = updatedTemplates.findIndex(template => template.id === id);
      
      if (index === -1) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Update the template
      updatedTemplates[index] = {
        ...updatedTemplates[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      // If this template is set as default, update other templates
      if (data.isDefault) {
        updatedTemplates.forEach((template, i) => {
          if (i !== index) {
            template.isDefault = false;
          }
        });
      }

      saveTemplatesToStorage(updatedTemplates);
      
      return updatedTemplates[index];
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const updatedTemplates = templates.filter(template => template.id !== id);
      
      // If the deleted template was default, set the first remaining template as default
      const wasDefault = templates.find(template => template.id === id)?.isDefault;
      if (wasDefault && updatedTemplates.length > 0) {
        updatedTemplates[0].isDefault = true;
      }
      
      saveTemplatesToStorage(updatedTemplates);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete multiple templates
  const deleteTemplates = async (ids: string[]): Promise<void> => {
    setLoading(true);
    try {
      const updatedTemplates = templates.filter(template => !ids.includes(template.id));
      
      // Check if any default template was deleted
      const wasDefaultDeleted = templates.some(template => 
        ids.includes(template.id) && template.isDefault
      );
      
      // If a default template was deleted, set the first remaining template as default
      if (wasDefaultDeleted && updatedTemplates.length > 0) {
        updatedTemplates[0].isDefault = true;
      }
      
      saveTemplatesToStorage(updatedTemplates);
      setSelectedTemplates([]);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a template by ID
  const getTemplate = (id: string): VariationTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  // Apply a template (increment usage count and update lastUsed)
  const applyTemplate = async (id: string): Promise<VariationTemplate> => {
    setLoading(true);
    try {
      const updatedTemplates = [...templates];
      const index = updatedTemplates.findIndex(template => template.id === id);
      
      if (index === -1) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Update usage count and lastUsed
      updatedTemplates[index] = {
        ...updatedTemplates[index],
        usageCount: updatedTemplates[index].usageCount + 1,
        lastUsed: new Date().toISOString()
      };

      saveTemplatesToStorage(updatedTemplates);
      
      return updatedTemplates[index];
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Duplicate a template
  const duplicateTemplate = async (id: string): Promise<VariationTemplate> => {
    setLoading(true);
    try {
      const templateToDuplicate = templates.find(template => template.id === id);
      
      if (!templateToDuplicate) {
        throw new Error(`Template with ID ${id} not found`);
      }

      const newTemplate: VariationTemplate = {
        ...templateToDuplicate,
        id: generateId(),
        name: `${templateToDuplicate.name} (Copy)`,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: undefined
      };

      const updatedTemplates = [...templates, newTemplate];
      saveTemplatesToStorage(updatedTemplates);
      
      return newTemplate;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set a template as the default
  const setDefaultTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const updatedTemplates = [...templates];
      
      // Update all templates
      updatedTemplates.forEach(template => {
        template.isDefault = template.id === id;
      });

      saveTemplatesToStorage(updatedTemplates);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh templates (reload from storage)
  const refreshTemplates = async (): Promise<void> => {
    setLoading(true);
    try {
      const loadedTemplates = initializeTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    templates: getFilteredTemplates(),
    loading,
    error,
    selectedTemplates,
    filters,
    sort,
    setSelectedTemplates,
    setFilters,
    setSort,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    deleteTemplates,
    getTemplate,
    applyTemplate,
    duplicateTemplate,
    setDefaultTemplate,
    refreshTemplates
  };

  return (
    <VariationTemplateContext.Provider value={value}>
      {children}
    </VariationTemplateContext.Provider>
  );
}

export function useVariationTemplates() {
  const context = useContext(VariationTemplateContext);
  if (context === undefined) {
    throw new Error('useVariationTemplates must be used within a VariationTemplateProvider');
  }
  return context;
}
