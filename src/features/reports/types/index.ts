export interface CustomReportConfig {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  fields: ReportField[];
  filters: ReportFilter[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  groupBy?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'table';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    lastRun?: Date;
    nextRun?: Date;
  };
}

export interface ReportField {
  id: string;
  name: string;
  source: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  format?: string;
  visible: boolean;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  conjunction?: 'and' | 'or';
}

export interface ReportSettings {
  showLogo: boolean;
  accentColor: string;
  preparedBy: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl?: string;
  };
}

export interface ReportPreviewData {
  columns: string[];
  data: any[];
  totals?: Record<string, any>;
  metadata?: {
    generatedAt: Date;
    filteredCount: number;
    totalCount: number;
  };
}
