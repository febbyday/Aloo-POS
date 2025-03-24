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
  };
}

class TemplateStorage {
  private readonly STORAGE_KEY = 'label_templates';
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
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  }

  saveTemplate(template: LabelTemplate) {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index === -1) {
      templates.push(template);
    } else {
      templates[index] = template;
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
    return template || null;
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
        id: Date.now().toString() + Math.random()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveTemplate(newTemplate);
    return newTemplate;
  }
}

export const templateStorage = new TemplateStorage();
