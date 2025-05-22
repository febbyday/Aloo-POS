import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { 
  VariationTemplate, 
  VariationTemplateFormData, 
  VariationTemplateFilter, 
  VariationTemplateSort,
  PREDEFINED_VARIATION_TEMPLATES
} from '../types/variation-template';
import { batchVariationTemplateService } from '../services/batch-variation-template-service';

// Storage key for local storage (for backward compatibility)
const STORAGE_KEY = 'pos_variation_templates';

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize templates with predefined ones if none exist (for backward compatibility)
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

interface BatchVariationTemplateContextType {
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

export const BatchVariationTemplateContext = createContext<BatchVariationTemplateContextType | undefined>(undefined);

interface BatchVariationTemplateProviderProps {
  children: ReactNode;
}

/**
 * BatchVariationTemplateProvider Component
 * 
 * Provides variation template data with optimized batch requests during initialization.
 */
export function BatchVariationTemplateProvider({ children }: BatchVariationTemplateProviderProps) {
  // State
  const [templates, setTemplates] = useState<VariationTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [filters, setFilters] = useState<VariationTemplateFilter>({});
  const [sort, setSort] = useState<VariationTemplateSort>({ field: 'name', direction: 'asc' });
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'variationTemplate',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Variation template provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing variation template provider', { error });
    }
  });
  
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
  
  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      performanceMonitor.markStart('variationTemplate:fetchTemplates');
      const fetchedTemplates = await batchGet<VariationTemplate[]>('variation-templates/LIST', filters, RequestPriority.MEDIUM);
      
      if (fetchedTemplates && fetchedTemplates.length > 0) {
        setTemplates(fetchedTemplates);
      } else {
        // Fallback to local storage if API returns nothing
        const localTemplates = initializeTemplates();
        setTemplates(localTemplates);
      }
    } catch (err) {
      logger.error('Error fetching variation templates', { error: err });
      // Fallback to local storage on error
      const localTemplates = initializeTemplates();
      setTemplates(localTemplates);
    } finally {
      performanceMonitor.markEnd('variationTemplate:fetchTemplates');
    }
  }, [batchGet, filters, isAuthenticated]);
  
  // Add a new template
  const addTemplate = useCallback(async (data: VariationTemplateFormData): Promise<VariationTemplate> => {
    performanceMonitor.markStart('variationTemplate:addTemplate');
    try {
      // Use batch request to add a new template
      const newTemplate = await batchPost<VariationTemplate>('variation-templates/CREATE', data, RequestPriority.MEDIUM);
      
      if (newTemplate) {
        // If this template is set as default, update other templates in local state
        if (newTemplate.isDefault) {
          setTemplates(prev => prev.map(template => ({
            ...template,
            isDefault: template.id === newTemplate.id
          })));
        } else {
          setTemplates(prev => [...prev, newTemplate]);
        }
        return newTemplate;
      } else {
        throw new Error('Failed to create template');
      }
    } catch (err) {
      logger.error('Error adding variation template', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('variationTemplate:addTemplate');
    }
  }, [batchPost]);
  
  // Update an existing template
  const updateTemplate = useCallback(async (id: string, data: Partial<VariationTemplateFormData>): Promise<VariationTemplate> => {
    performanceMonitor.markStart(`variationTemplate:updateTemplate:${id}`);
    try {
      // Use batch request to update a template
      const updatedTemplate = await batchPost<VariationTemplate>('variation-templates/UPDATE', {
        id,
        ...data
      }, RequestPriority.MEDIUM);
      
      if (updatedTemplate) {
        // If this template is set as default, update other templates in local state
        if (data.isDefault) {
          setTemplates(prev => prev.map(template => ({
            ...template,
            isDefault: template.id === id
          })));
        } else {
          setTemplates(prev => prev.map(template => 
            template.id === id ? updatedTemplate : template
          ));
        }
        return updatedTemplate;
      } else {
        throw new Error(`Template with ID ${id} not found`);
      }
    } catch (err) {
      logger.error('Error updating variation template', { error: err, templateId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`variationTemplate:updateTemplate:${id}`);
    }
  }, [batchPost]);
  
  // Delete a template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    performanceMonitor.markStart(`variationTemplate:deleteTemplate:${id}`);
    try {
      // Check if the template is default
      const template = templates.find(t => t.id === id);
      const isDefault = template?.isDefault;
      
      // Use batch request to delete a template
      await batchPost('variation-templates/DELETE', { id }, RequestPriority.MEDIUM);
      
      // Update local state
      const updatedTemplates = templates.filter(template => template.id !== id);
      
      // If the deleted template was default, set the first remaining template as default
      if (isDefault && updatedTemplates.length > 0) {
        const firstTemplate = updatedTemplates[0];
        await batchPost('variation-templates/SET_DEFAULT', { id: firstTemplate.id }, RequestPriority.MEDIUM);
        updatedTemplates[0] = { ...firstTemplate, isDefault: true };
      }
      
      setTemplates(updatedTemplates);
    } catch (err) {
      logger.error('Error deleting variation template', { error: err, templateId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`variationTemplate:deleteTemplate:${id}`);
    }
  }, [batchPost, templates]);
  
  // Delete multiple templates
  const deleteTemplates = useCallback(async (ids: string[]): Promise<void> => {
    performanceMonitor.markStart('variationTemplate:deleteTemplates');
    try {
      // Check if any default template is being deleted
      const isDefaultBeingDeleted = templates.some(template => 
        ids.includes(template.id) && template.isDefault
      );
      
      // Use batch request to delete templates
      await batchPost('variation-templates/DELETE_MANY', { ids }, RequestPriority.MEDIUM);
      
      // Update local state
      const updatedTemplates = templates.filter(template => !ids.includes(template.id));
      
      // If a default template was deleted, set the first remaining template as default
      if (isDefaultBeingDeleted && updatedTemplates.length > 0) {
        const firstTemplate = updatedTemplates[0];
        await batchPost('variation-templates/SET_DEFAULT', { id: firstTemplate.id }, RequestPriority.MEDIUM);
        updatedTemplates[0] = { ...firstTemplate, isDefault: true };
      }
      
      setTemplates(updatedTemplates);
      setSelectedTemplates([]);
    } catch (err) {
      logger.error('Error deleting multiple variation templates', { error: err, templateIds: ids });
      throw err;
    } finally {
      performanceMonitor.markEnd('variationTemplate:deleteTemplates');
    }
  }, [batchPost, templates]);
  
  // Get a template by ID
  const getTemplate = useCallback((id: string): VariationTemplate | undefined => {
    return templates.find(template => template.id === id);
  }, [templates]);
  
  // Apply a template (increment usage count and update lastUsed)
  const applyTemplate = useCallback(async (id: string): Promise<VariationTemplate> => {
    performanceMonitor.markStart(`variationTemplate:applyTemplate:${id}`);
    try {
      // Use batch request to apply a template
      const updatedTemplate = await batchPost<VariationTemplate>('variation-templates/APPLY', { id }, RequestPriority.MEDIUM);
      
      if (updatedTemplate) {
        // Update local state
        setTemplates(prev => prev.map(template => 
          template.id === id ? updatedTemplate : template
        ));
        return updatedTemplate;
      } else {
        throw new Error(`Template with ID ${id} not found`);
      }
    } catch (err) {
      logger.error('Error applying variation template', { error: err, templateId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`variationTemplate:applyTemplate:${id}`);
    }
  }, [batchPost]);
  
  // Duplicate a template
  const duplicateTemplate = useCallback(async (id: string): Promise<VariationTemplate> => {
    performanceMonitor.markStart(`variationTemplate:duplicateTemplate:${id}`);
    try {
      const templateToDuplicate = templates.find(template => template.id === id);
      
      if (!templateToDuplicate) {
        throw new Error(`Template with ID ${id} not found`);
      }
      
      // Create a new template based on the existing one
      const newTemplateData: VariationTemplateFormData = {
        name: `${templateToDuplicate.name} (Copy)`,
        description: templateToDuplicate.description,
        category: templateToDuplicate.category,
        attributes: templateToDuplicate.attributes,
        isDefault: false
      };
      
      // Use batch request to add a new template
      const newTemplate = await addTemplate(newTemplateData);
      return newTemplate;
    } catch (err) {
      logger.error('Error duplicating variation template', { error: err, templateId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`variationTemplate:duplicateTemplate:${id}`);
    }
  }, [addTemplate, templates]);
  
  // Set a template as the default
  const setDefaultTemplate = useCallback(async (id: string): Promise<void> => {
    performanceMonitor.markStart(`variationTemplate:setDefaultTemplate:${id}`);
    try {
      // Use batch request to set a template as default
      await batchPost('variation-templates/SET_DEFAULT', { id }, RequestPriority.MEDIUM);
      
      // Update local state
      setTemplates(prev => prev.map(template => ({
        ...template,
        isDefault: template.id === id
      })));
    } catch (err) {
      logger.error('Error setting variation template as default', { error: err, templateId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`variationTemplate:setDefaultTemplate:${id}`);
    }
  }, [batchPost]);
  
  // Refresh templates
  const refreshTemplates = useCallback(async () => {
    await fetchTemplates();
  }, [fetchTemplates]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing variation template provider');
      
      // Add requests to the batch
      fetchTemplates();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchTemplates, initialize]);
  
  // Context value
  const contextValue: BatchVariationTemplateContextType = {
    templates: getFilteredTemplates(),
    loading: isInitializing,
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
    <BatchVariationTemplateContext.Provider value={contextValue}>
      {children}
    </BatchVariationTemplateContext.Provider>
  );
}

export function useBatchVariationTemplates() {
  const context = useContext(BatchVariationTemplateContext);
  if (context === undefined) {
    throw new Error('useBatchVariationTemplates must be used within a BatchVariationTemplateProvider');
  }
  return context;
}

// For backward compatibility
export const useVariationTemplates = useBatchVariationTemplates;
