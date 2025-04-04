import { DesignTemplate } from '../../types/gift-cards';
import { mockDesignTemplates } from '../../data/mockData';

// Helper to generate a new ID based on current array length
const generateId = (array: any[]): string => {
  return (array.length + 1).toString();
};

// Template Service to handle design templates operations
export const TemplateService = {
  // Get all design templates
  getAllTemplates: async (): Promise<DesignTemplate[]> => {
    // In a real application, this would fetch from an API
    return Promise.resolve([...mockDesignTemplates]);
  },

  // Get active templates
  getActiveTemplates: async (): Promise<DesignTemplate[]> => {
    const activeTemplates = mockDesignTemplates.filter(template => template.isActive);
    return Promise.resolve([...activeTemplates]);
  },

  // Get template by ID
  getTemplateById: async (id: string): Promise<DesignTemplate | null> => {
    const template = mockDesignTemplates.find(t => t.id === id);
    return Promise.resolve(template || null);
  },

  // Get default template
  getDefaultTemplate: async (): Promise<DesignTemplate | null> => {
    const defaultTemplate = mockDesignTemplates.find(t => t.isDefault);
    return Promise.resolve(defaultTemplate || null);
  },

  // Create a new template
  createTemplate: async (templateData: Partial<DesignTemplate>): Promise<DesignTemplate> => {
    const newTemplate: DesignTemplate = {
      id: generateId(mockDesignTemplates),
      name: templateData.name || 'New Template',
      description: templateData.description || null,
      category: templateData.category || 'default',
      occasion: templateData.occasion,
      season: templateData.season,
      isActive: templateData.isActive !== undefined ? templateData.isActive : true,
      isDefault: templateData.isDefault !== undefined ? templateData.isDefault : false,
      version: templateData.version || '1.0',
      thumbnail: templateData.thumbnail || '/assets/gift-cards/templates/default-thumb.jpg',
      elements: templateData.elements || [],
      styles: {
        backgroundColor: templateData.styles?.backgroundColor || '#ffffff',
        backgroundImage: templateData.styles?.backgroundImage,
        width: templateData.styles?.width || 600,
        height: templateData.styles?.height || 300,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // In a real app, this would be the current user's ID
    };

    // If this is being set as the default template, unset any existing default
    if (newTemplate.isDefault) {
      mockDesignTemplates.forEach(t => {
        if (t.isDefault) {
          t.isDefault = false;
        }
      });
    }

    // In a real application, this would call an API to create the template
    mockDesignTemplates.push(newTemplate);

    return Promise.resolve(newTemplate);
  },

  // Update a template
  updateTemplate: async (id: string, updates: Partial<DesignTemplate>): Promise<DesignTemplate | null> => {
    const index = mockDesignTemplates.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);

    // If this is being set as the default template, unset any existing default
    if (updates.isDefault) {
      mockDesignTemplates.forEach(t => {
        if (t.id !== id && t.isDefault) {
          t.isDefault = false;
        }
      });
    }

    const updatedTemplate = {
      ...mockDesignTemplates[index],
      ...updates,
      // These fields cannot be updated directly
      id: mockDesignTemplates[index].id,
      createdAt: mockDesignTemplates[index].createdAt,
      createdBy: mockDesignTemplates[index].createdBy,
      updatedAt: new Date(),
      // Merge styles appropriately
      styles: {
        ...mockDesignTemplates[index].styles,
        ...(updates.styles || {}),
      },
    };

    // In a real application, this would call an API to update the template
    mockDesignTemplates[index] = updatedTemplate;

    return Promise.resolve(updatedTemplate);
  },

  // Duplicate a template
  duplicateTemplate: async (id: string, newName?: string): Promise<DesignTemplate | null> => {
    const template = mockDesignTemplates.find(t => t.id === id);
    if (!template) return Promise.resolve(null);

    const duplicatedTemplate: DesignTemplate = {
      ...template,
      id: generateId(mockDesignTemplates),
      name: newName || `${template.name} (Copy)`,
      isDefault: false, // A duplicated template can't be the default
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0', // Reset version for the copy
    };

    // In a real application, this would call an API to create the template
    mockDesignTemplates.push(duplicatedTemplate);

    return Promise.resolve(duplicatedTemplate);
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<boolean> => {
    const index = mockDesignTemplates.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(false);

    // Prevent deleting the default template
    if (mockDesignTemplates[index].isDefault) {
      return Promise.resolve(false);
    }

    // In a real application, this would call an API to delete the template
    mockDesignTemplates.splice(index, 1);

    return Promise.resolve(true);
  },

  // Set a template as default
  setDefaultTemplate: async (id: string): Promise<DesignTemplate | null> => {
    const template = mockDesignTemplates.find(t => t.id === id);
    if (!template) return Promise.resolve(null);

    // Clear existing default
    mockDesignTemplates.forEach(t => {
      t.isDefault = false;
    });

    // Set new default
    template.isDefault = true;
    template.updatedAt = new Date();

    return Promise.resolve(template);
  },

  // Get templates by category
  getTemplatesByCategory: async (category: string): Promise<DesignTemplate[]> => {
    const templates = mockDesignTemplates.filter(t => t.category === category);
    return Promise.resolve([...templates]);
  },

  // Get templates by occasion
  getTemplatesByOccasion: async (occasion: string): Promise<DesignTemplate[]> => {
    const templates = mockDesignTemplates.filter(t => t.occasion === occasion);
    return Promise.resolve([...templates]);
  },

  // Get templates by season
  getTemplatesBySeason: async (season: string): Promise<DesignTemplate[]> => {
    const templates = mockDesignTemplates.filter(t => t.season === season);
    return Promise.resolve([...templates]);
  },
};

export default TemplateService; 