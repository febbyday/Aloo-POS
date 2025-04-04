import { useState, useEffect, useCallback } from 'react';
import { DesignTemplate } from '../types';
import TemplateService from '../services/templateService';

// Interface for template filtering
interface TemplateFilter {
  category?: string;
  occasion?: string;
  season?: string;
  isActive?: boolean;
  search?: string;
}

// Hook for managing templates
export function useTemplates() {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);

  // Load all templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await TemplateService.getAllTemplates();
      setTemplates(result);
      setFilteredTemplates(result);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load active templates only
  const loadActiveTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await TemplateService.getActiveTemplates();
      setTemplates(result);
      setFilteredTemplates(result);
    } catch (err) {
      setError('Failed to load active templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get template by ID
  const getTemplateById = useCallback(async (id: string) => {
    try {
      return await TemplateService.getTemplateById(id);
    } catch (err) {
      console.error('Failed to get template', err);
      return null;
    }
  }, []);

  // Get default template
  const getDefaultTemplate = useCallback(async () => {
    try {
      return await TemplateService.getDefaultTemplate();
    } catch (err) {
      console.error('Failed to get default template', err);
      return null;
    }
  }, []);

  // Create new template
  const createTemplate = useCallback(async (templateData: Partial<DesignTemplate>) => {
    try {
      const newTemplate = await TemplateService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      applyFilter(filter, [...templates, newTemplate]);
      return newTemplate;
    } catch (err) {
      console.error('Failed to create template', err);
      throw err;
    }
  }, [templates, filter]);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<DesignTemplate>) => {
    try {
      const updatedTemplate = await TemplateService.updateTemplate(id, updates);
      if (updatedTemplate) {
        setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
        applyFilter(filter, templates.map(t => t.id === id ? updatedTemplate : t));
        
        // Update selected template if it's the one being updated
        if (selectedTemplate && selectedTemplate.id === id) {
          setSelectedTemplate(updatedTemplate);
        }
      }
      return updatedTemplate;
    } catch (err) {
      console.error('Failed to update template', err);
      throw err;
    }
  }, [templates, selectedTemplate, filter]);

  // Duplicate template
  const duplicateTemplate = useCallback(async (id: string, newName?: string) => {
    try {
      const duplicatedTemplate = await TemplateService.duplicateTemplate(id, newName);
      if (duplicatedTemplate) {
        setTemplates(prev => [...prev, duplicatedTemplate]);
        applyFilter(filter, [...templates, duplicatedTemplate]);
      }
      return duplicatedTemplate;
    } catch (err) {
      console.error('Failed to duplicate template', err);
      throw err;
    }
  }, [templates, filter]);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const success = await TemplateService.deleteTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        applyFilter(filter, templates.filter(t => t.id !== id));
        
        // Clear selected template if it's the one being deleted
        if (selectedTemplate && selectedTemplate.id === id) {
          setSelectedTemplate(null);
        }
      }
      return success;
    } catch (err) {
      console.error('Failed to delete template', err);
      throw err;
    }
  }, [templates, selectedTemplate, filter]);

  // Set default template
  const setDefaultTemplate = useCallback(async (id: string) => {
    try {
      const defaultTemplate = await TemplateService.setDefaultTemplate(id);
      if (defaultTemplate) {
        setTemplates(prev => prev.map(t => ({
          ...t,
          isDefault: t.id === id
        })));
        applyFilter(filter, templates.map(t => ({
          ...t,
          isDefault: t.id === id
        })));
        
        // Update selected template if it's the one being set as default
        if (selectedTemplate && selectedTemplate.id === id) {
          setSelectedTemplate({
            ...selectedTemplate,
            isDefault: true
          });
        }
      }
      return defaultTemplate;
    } catch (err) {
      console.error('Failed to set default template', err);
      throw err;
    }
  }, [templates, selectedTemplate, filter]);

  // Get templates by category
  const getTemplatesByCategory = useCallback(async (category: string) => {
    try {
      return await TemplateService.getTemplatesByCategory(category);
    } catch (err) {
      console.error('Failed to get templates by category', err);
      return [];
    }
  }, []);

  // Apply filter function
  const applyFilter = useCallback((filter: TemplateFilter, templatesList: DesignTemplate[] = templates) => {
    setFilter(filter);
    
    let filtered = [...templatesList];
    
    // Apply category filter
    if (filter.category) {
      filtered = filtered.filter(t => t.category === filter.category);
    }
    
    // Apply occasion filter
    if (filter.occasion) {
      filtered = filtered.filter(t => t.occasion === filter.occasion);
    }
    
    // Apply season filter
    if (filter.season) {
      filtered = filtered.filter(t => t.season === filter.season);
    }
    
    // Apply active filter
    if (filter.isActive !== undefined) {
      filtered = filtered.filter(t => t.isActive === filter.isActive);
    }
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates]);

  // Select a template
  const selectTemplate = useCallback((template: DesignTemplate) => {
    setSelectedTemplate(template);
  }, []);

  // Clear selected template
  const clearSelectedTemplate = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  // Load templates on initial render
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    filteredTemplates,
    loading,
    error,
    filter,
    selectedTemplate,
    loadTemplates,
    loadActiveTemplates,
    getTemplateById,
    getDefaultTemplate,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getTemplatesByCategory,
    selectTemplate,
    clearSelectedTemplate,
    applyFilter,
  };
} 