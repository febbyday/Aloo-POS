export interface LabelTemplate {
  id: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  elements: TemplateElement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateElement {
  id: string;
  type: 'barcode' | 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: string;
    opacity?: number;
    padding?: number;
    zIndex?: number;
  };
  zIndex?: number;
}

class TemplateStorage {
  private readonly STORAGE_KEY = 'label_templates';
  private readonly DEFAULT_DIMENSIONS = { width: 100, height: 50 };
  private readonly DEFAULT_ELEMENT_STYLE = {
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    textAlign: 'left' as const,
    color: '#000000',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: '#000000',
    borderStyle: 'solid',
    opacity: 1,
    padding: 0,
    zIndex: 1,
  };
  private listeners: (() => void)[] = [];

  constructor() {
    // Initialize storage if empty
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  getTemplates(): LabelTemplate[] {
    const templates = localStorage.getItem(this.STORAGE_KEY);
    if (!templates) return [];
    
    return JSON.parse(templates).map((template: any) => ({
      ...template,
      dimensions: template.dimensions || this.DEFAULT_DIMENSIONS,
      elements: template.elements.map((element: TemplateElement) => ({
        ...element,
        style: { ...this.DEFAULT_ELEMENT_STYLE, ...element.style },
      })),
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  }

  saveTemplate(template: LabelTemplate) {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    // Ensure template has all required properties
    const updatedTemplate = {
      ...template,
      dimensions: template.dimensions || this.DEFAULT_DIMENSIONS,
      elements: template.elements.map(element => ({
        ...element,
        style: { ...this.DEFAULT_ELEMENT_STYLE, ...element.style },
      })),
      updatedAt: new Date(),
    };
    
    if (index === -1) {
      templates.push(updatedTemplate);
    } else {
      templates[index] = updatedTemplate;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    this.notifyListeners();
  }

  deleteTemplate(id: string) {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(template => template.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
    this.notifyListeners();
  }

  getTemplate(id: string): LabelTemplate | null {
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) return null;

    return {
      ...template,
      dimensions: template.dimensions || this.DEFAULT_DIMENSIONS,
      elements: template.elements.map(element => ({
        ...element,
        style: { ...this.DEFAULT_ELEMENT_STYLE, ...element.style },
      })),
    };
  }

  async duplicateTemplate(id: string): Promise<LabelTemplate | null> {
    const template = await this.getTemplate(id);
    if (!template) return null;

    const newTemplate: LabelTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      elements: template.elements.map(element => ({
        ...element,
        id: Date.now().toString() + Math.random(),
        style: { ...this.DEFAULT_ELEMENT_STYLE, ...element.style },
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveTemplate(newTemplate);
    return newTemplate;
  }

  updateTemplateDimensions(id: string, dimensions: { width: number; height: number }) {
    const template = this.getTemplate(id);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      dimensions,
      updatedAt: new Date(),
    };

    this.saveTemplate(updatedTemplate);
    return updatedTemplate;
  }

  updateElementStyle(templateId: string, elementId: string, style: Partial<TemplateElement['style']>) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      elements: template.elements.map(element => 
        element.id === elementId
          ? { ...element, style: { ...element.style, ...style } }
          : element
      ),
      updatedAt: new Date(),
    };

    this.saveTemplate(updatedTemplate);
    return updatedTemplate;
  }
}

export const templateStorage = new TemplateStorage();
