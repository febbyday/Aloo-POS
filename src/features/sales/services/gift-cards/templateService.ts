/**
 * @deprecated This service is deprecated. Use the factory-based template service instead.
 * Import from the parent directory's index.ts file:
 * import { TemplateService } from '../services';
 */
import { DesignTemplate } from '../../types/gift-cards';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { withApiTransition } from '@/lib/api/api-transition-utils';
import { v4 as uuidv4 } from 'uuid';

// Fallback data for when API is unavailable
const fallbackDesignTemplates: DesignTemplate[] = [
  {
    id: "1",
    name: "Birthday Celebration",
    description: "Colorful birthday-themed gift card design with confetti and balloons",
    category: "birthday",
    occasion: "birthday",
    season: null,
    isActive: true,
    isDefault: true,
    version: "1.0",
    thumbnail: "/assets/gift-cards/templates/birthday-thumb.jpg",
    elements: [
      {
        id: "element-1",
        type: "image",
        src: "/assets/gift-cards/elements/balloons.png",
        x: 20,
        y: 20,
        width: 100,
        height: 100
      },
      {
        id: "element-2",
        type: "text",
        value: "Happy Birthday!",
        x: 150,
        y: 50,
        fontSize: 24,
        fontFamily: "Poppins",
        color: "#FF5252"
      }
    ],
    styles: {
      backgroundColor: "#FFECB3",
      backgroundImage: "/assets/gift-cards/backgrounds/confetti.jpg",
      width: 600,
      height: 300
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    id: "2",
    name: "Thank You",
    description: "Elegant thank you design with floral elements",
    category: "gratitude",
    occasion: "thank_you",
    season: null,
    isActive: true,
    isDefault: false,
    version: "1.0",
    thumbnail: "/assets/gift-cards/templates/thankyou-thumb.jpg",
    elements: [
      {
        id: "element-1",
        type: "image",
        src: "/assets/gift-cards/elements/flowers.png",
        x: 20,
        y: 20,
        width: 120,
        height: 100
      },
      {
        id: "element-2",
        type: "text",
        value: "Thank You!",
        x: 150,
        y: 50,
        fontSize: 24,
        fontFamily: "Dancing Script",
        color: "#4CAF50"
      }
    ],
    styles: {
      backgroundColor: "#E8F5E9",
      backgroundImage: null,
      width: 600,
      height: 300
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    id: "3",
    name: "Winter Holidays",
    description: "Winter-themed holiday gift card with snowflakes",
    category: "seasonal",
    occasion: "holiday",
    season: "winter",
    isActive: true,
    isDefault: false,
    version: "1.0",
    thumbnail: "/assets/gift-cards/templates/winter-thumb.jpg",
    elements: [
      {
        id: "element-1",
        type: "image",
        src: "/assets/gift-cards/elements/snowflake.png",
        x: 20,
        y: 20,
        width: 80,
        height: 80
      },
      {
        id: "element-2",
        type: "text",
        value: "Happy Holidays!",
        x: 150,
        y: 50,
        fontSize: 24,
        fontFamily: "Montserrat",
        color: "#1976D2"
      }
    ],
    styles: {
      backgroundColor: "#E3F2FD",
      backgroundImage: "/assets/gift-cards/backgrounds/snowy.jpg",
      width: 600,
      height: 300
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system"
  }
];

// Local cache for templates
let localTemplates: DesignTemplate[] = [...fallbackDesignTemplates];

// Helper to generate a new ID
const generateId = (): string => {
  return uuidv4();
};

// Template Service to handle design templates operations
export const TemplateService = {
  // Get all design templates
  getAllTemplates: async (): Promise<DesignTemplate[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATES'),
        localTemplates,
        { endpoint: 'gift-cards/TEMPLATES' }
      );

      if (response.success) {
        localTemplates = response.data; // Update local cache
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch design templates');
      }
    } catch (error) {
      console.error('Error fetching design templates:', error);
      return localTemplates;
    }
  },

  // Get active templates
  getActiveTemplates: async (): Promise<DesignTemplate[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATES_ACTIVE'),
        localTemplates.filter(template => template.isActive),
        { endpoint: 'gift-cards/TEMPLATES_ACTIVE' }
      );

      if (response.success) {
        // Update the active status in local cache
        const activeIds = new Set(response.data.map(t => t.id));
        localTemplates.forEach(t => {
          if (activeIds.has(t.id)) {
            const updated = response.data.find(rt => rt.id === t.id);
            if (updated) Object.assign(t, updated);
          }
        });

        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch active design templates');
      }
    } catch (error) {
      console.error('Error fetching active design templates:', error);
      return localTemplates.filter(template => template.isActive);
    }
  },

  // Get template by ID
  getTemplateById: async (id: string): Promise<DesignTemplate | null> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATE_DETAIL', { id }),
        localTemplates.find(t => t.id === id) || null,
        { endpoint: 'gift-cards/TEMPLATE_DETAIL' }
      );

      if (response.success) {
        // Update local cache if found
        if (response.data) {
          const index = localTemplates.findIndex(t => t.id === id);
          if (index !== -1) {
            localTemplates[index] = response.data;
          } else {
            localTemplates.push(response.data);
          }
        }
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Design template with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error fetching design template with ID ${id}:`, error);
      return localTemplates.find(t => t.id === id) || null;
    }
  },

  // Get default template
  getDefaultTemplate: async (): Promise<DesignTemplate | null> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATE_DEFAULT'),
        localTemplates.find(t => t.isDefault) || null,
        { endpoint: 'gift-cards/TEMPLATE_DEFAULT' }
      );

      if (response.success) {
        // Update local cache if found
        if (response.data) {
          const index = localTemplates.findIndex(t => t.id === response.data.id);
          if (index !== -1) {
            localTemplates[index] = response.data;
          } else {
            localTemplates.push(response.data);
          }
        }
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Default design template not found');
      }
    } catch (error) {
      console.error('Error fetching default design template:', error);
      return localTemplates.find(t => t.isDefault) || null;
    }
  },

  // Create a new template
  createTemplate: async (templateData: Partial<DesignTemplate>): Promise<DesignTemplate> => {
    const newTemplate: DesignTemplate = {
      id: generateId(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // In a real app, this would be the current user's ID
    };

    try {
      // If this is being set as the default template, unset any existing default
      if (newTemplate.isDefault) {
        // First try to update any existing default template in the API
        const defaultTemplate = localTemplates.find(t => t.isDefault);
        if (defaultTemplate) {
          await TemplateService.updateTemplate(defaultTemplate.id, { isDefault: false });
        }
      }

      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/TEMPLATE_CREATE', newTemplate),
        newTemplate,
        { endpoint: 'gift-cards/TEMPLATE_CREATE' }
      );

      if (response.success) {
        // Update local cache
        localTemplates.push(response.data);
        return response.data;
      } else if (response.isMock) {
        // Handle the case of using fallback data
        // If this is being set as the default, unset any existing defaults in local cache
        if (newTemplate.isDefault) {
          localTemplates.forEach(t => {
            if (t.isDefault) {
              t.isDefault = false;
            }
          });
        }

        // Add to local cache
        localTemplates.push(newTemplate);
        return newTemplate;
      } else {
        throw new Error(response.error || 'Failed to create design template');
      }
    } catch (error) {
      console.error('Error creating design template:', error);

      // Fallback: Add to local cache
      // If this is being set as the default, unset any existing defaults
      if (newTemplate.isDefault) {
        localTemplates.forEach(t => {
          if (t.isDefault) {
            t.isDefault = false;
          }
        });
      }

      localTemplates.push(newTemplate);
      return newTemplate;
    }
  },

  // Update a template
  updateTemplate: async (id: string, updates: Partial<DesignTemplate>): Promise<DesignTemplate | null> => {
    const existingTemplate = localTemplates.find(t => t.id === id);
    if (!existingTemplate) return null;

    const updatedTemplate: DesignTemplate = {
      ...existingTemplate,
      ...updates,
      // These fields cannot be updated directly
      id: existingTemplate.id,
      createdAt: existingTemplate.createdAt,
      createdBy: existingTemplate.createdBy,
      updatedAt: new Date().toISOString(),
      // Merge styles appropriately
      styles: {
        ...existingTemplate.styles,
        ...(updates.styles || {}),
      },
    };

    try {
      // If this is being set as the default template, unset any existing default
      if (updates.isDefault) {
        const currentDefault = localTemplates.find(t => t.id !== id && t.isDefault);
        if (currentDefault) {
          await TemplateService.updateTemplate(currentDefault.id, { isDefault: false });
        }
      }

      const response = await withApiTransition(
        () => enhancedApiClient.put('gift-cards/TEMPLATE_UPDATE', updatedTemplate, { id }),
        updatedTemplate,
        { endpoint: 'gift-cards/TEMPLATE_UPDATE' }
      );

      if (response.success) {
        // Update local cache
        const index = localTemplates.findIndex(t => t.id === id);
        if (index !== -1) {
          localTemplates[index] = response.data;
        }
        return response.data;
      } else if (response.isMock) {
        // Handle the case of using fallback data
        // If this is being set as the default, unset any existing defaults in local cache
        if (updatedTemplate.isDefault) {
          localTemplates.forEach(t => {
            if (t.id !== id && t.isDefault) {
              t.isDefault = false;
            }
          });
        }

        // Update in local cache
        const index = localTemplates.findIndex(t => t.id === id);
        if (index !== -1) {
          localTemplates[index] = updatedTemplate;
        }
        return updatedTemplate;
      } else {
        throw new Error(response.error || `Failed to update design template with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error updating design template with ID ${id}:`, error);

      // Fallback: Update in local cache
      // If this is being set as the default, unset any existing defaults
      if (updatedTemplate.isDefault) {
        localTemplates.forEach(t => {
          if (t.id !== id && t.isDefault) {
            t.isDefault = false;
          }
        });
      }

      const index = localTemplates.findIndex(t => t.id === id);
      if (index !== -1) {
        localTemplates[index] = updatedTemplate;
      }
      return updatedTemplate;
    }
  },

  // Duplicate a template
  duplicateTemplate: async (id: string, newName?: string): Promise<DesignTemplate | null> => {
    const existingTemplate = localTemplates.find(t => t.id === id);
    if (!existingTemplate) return null;

    // Create a copy but with a new ID and updated name
    const dupName = newName || `${existingTemplate.name} (Copy)`;
    const duplicateData: Partial<DesignTemplate> = {
      ...existingTemplate,
      name: dupName,
      isDefault: false, // A duplicate is never the default
      createdAt: undefined,
      updatedAt: undefined,
      id: undefined, // Will be auto-generated
    };

    // Use the create template method to add the duplicate
    return TemplateService.createTemplate(duplicateData);
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<boolean> => {
    // Check if template exists
    const existingTemplate = localTemplates.find(t => t.id === id);
    if (!existingTemplate) return false;

    // Cannot delete the default template
    if (existingTemplate.isDefault) {
      console.error('Cannot delete the default template');
      return false;
    }

    try {
      const response = await withApiTransition(
        () => enhancedApiClient.delete('gift-cards/TEMPLATE_DELETE', { id }),
        true,
        { endpoint: 'gift-cards/TEMPLATE_DELETE' }
      );

      if (response.success) {
        // Update local cache
        localTemplates = localTemplates.filter(t => t.id !== id);
        return true;
      } else if (response.isMock) {
        // Update local cache
        localTemplates = localTemplates.filter(t => t.id !== id);
        return true;
      } else {
        throw new Error(response.error || `Failed to delete design template with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting design template with ID ${id}:`, error);

      // Fallback: Update local cache
      localTemplates = localTemplates.filter(t => t.id !== id);
      return true;
    }
  },

  // Set a template as default
  setDefaultTemplate: async (id: string): Promise<DesignTemplate | null> => {
    // Check if template exists
    const existingTemplate = localTemplates.find(t => t.id === id);
    if (!existingTemplate) return null;

    // If it's already the default, just return it
    if (existingTemplate.isDefault) {
      return existingTemplate;
    }

    try {
      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/TEMPLATE_SET_DEFAULT', {}, { id }),
        { ...existingTemplate, isDefault: true },
        { endpoint: 'gift-cards/TEMPLATE_SET_DEFAULT' }
      );

      if (response.success) {
        // Update all templates in local cache
        localTemplates.forEach(t => {
          t.isDefault = (t.id === id);
        });

        // Get the updated template
        return TemplateService.getTemplateById(id);
      } else if (response.isMock) {
        // Update all templates in local cache
        localTemplates.forEach(t => {
          t.isDefault = (t.id === id);
        });

        return { ...existingTemplate, isDefault: true };
      } else {
        throw new Error(response.error || `Failed to set design template with ID ${id} as default`);
      }
    } catch (error) {
      console.error(`Error setting design template with ID ${id} as default:`, error);

      // Fallback: Update all templates in local cache
      localTemplates.forEach(t => {
        t.isDefault = (t.id === id);
      });

      return { ...existingTemplate, isDefault: true };
    }
  },

  // Get templates by category
  getTemplatesByCategory: async (category: string): Promise<DesignTemplate[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATES_BY_CATEGORY', { category }),
        localTemplates.filter(t => t.category === category),
        { endpoint: 'gift-cards/TEMPLATES_BY_CATEGORY' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to fetch templates for category ${category}`);
      }
    } catch (error) {
      console.error(`Error fetching templates for category ${category}:`, error);
      return localTemplates.filter(t => t.category === category);
    }
  },

  // Get templates by occasion
  getTemplatesByOccasion: async (occasion: string): Promise<DesignTemplate[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATES_BY_OCCASION', { occasion }),
        localTemplates.filter(t => t.occasion === occasion),
        { endpoint: 'gift-cards/TEMPLATES_BY_OCCASION' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to fetch templates for occasion ${occasion}`);
      }
    } catch (error) {
      console.error(`Error fetching templates for occasion ${occasion}:`, error);
      return localTemplates.filter(t => t.occasion === occasion);
    }
  },

  // Get templates by season
  getTemplatesBySeason: async (season: string): Promise<DesignTemplate[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TEMPLATES_BY_SEASON', { season }),
        localTemplates.filter(t => t.season === season),
        { endpoint: 'gift-cards/TEMPLATES_BY_SEASON' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to fetch templates for season ${season}`);
      }
    } catch (error) {
      console.error(`Error fetching templates for season ${season}:`, error);
      return localTemplates.filter(t => t.season === season);
    }
  },
};

export default TemplateService;