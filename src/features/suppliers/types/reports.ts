export interface ReportSettings {
  showLogo: boolean;
  accentColor: string;
  preparedBy: string;
  baseCommissionRate: number;
  performanceBonus: number;
  qualityThreshold: number;
  deliveryTimeThreshold: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl?: string;
  };
}

export interface ReportSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReportSettings;
  onSettingsChange: (settings: ReportSettings) => void;
}

export interface SupplierSalesData {
  supplierId: string;
  supplierName: string;
  products: Array<{
    name: string;
    sku: string;
    sales: number;
    stock: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  }>;
  totalSales: number;
  totalQuantity: number;
  performance: {
    previousPeriodSales: number;
    percentChange: number;
    targetAchievement?: number;
    inventoryMetrics: {
      totalStockValue: number;
      averageTurnoverRate: number;
      lowStockCount: number;
      overstockCount: number;
    };
  };
}