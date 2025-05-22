import { Brand } from '../types/brand';

// Mock brands data
export const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Nike",
    description: "Athletic footwear and apparel",
    logo: "https://via.placeholder.com/150?text=Nike",
    website: "https://www.nike.com",
    products: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "nike",
    status: "active",
    metrics: {
      totalProducts: 45,
      activeProducts: 40,
      totalSales: 1250,
      totalRevenue: 75000,
      salesTrend: {
        percentage: 12,
        trend: 'up',
        periodChange: 12
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "2",
    name: "Adidas",
    description: "Sportswear and athletic equipment",
    logo: "https://via.placeholder.com/150?text=Adidas",
    website: "https://www.adidas.com",
    products: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "adidas",
    status: "active",
    metrics: {
      totalProducts: 38,
      activeProducts: 35,
      totalSales: 980,
      totalRevenue: 58000,
      salesTrend: {
        percentage: 8,
        trend: 'up',
        periodChange: 8
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "3",
    name: "Puma",
    description: "Athletic and casual footwear",
    logo: "https://via.placeholder.com/150?text=Puma",
    website: "https://www.puma.com",
    products: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "puma",
    status: "active",
    metrics: {
      totalProducts: 30,
      activeProducts: 28,
      totalSales: 750,
      totalRevenue: 45000,
      salesTrend: {
        percentage: 5,
        trend: 'up',
        periodChange: 5
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "4",
    name: "Reebok",
    description: "Fitness and training footwear",
    logo: "https://via.placeholder.com/150?text=Reebok",
    website: "https://www.reebok.com",
    products: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "reebok",
    status: "active",
    metrics: {
      totalProducts: 25,
      activeProducts: 22,
      totalSales: 620,
      totalRevenue: 37000,
      salesTrend: {
        percentage: 3,
        trend: 'up',
        periodChange: 3
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "5",
    name: "New Balance",
    description: "Athletic footwear and apparel",
    logo: "https://via.placeholder.com/150?text=New+Balance",
    website: "https://www.newbalance.com",
    products: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "new-balance",
    status: "active",
    metrics: {
      totalProducts: 20,
      activeProducts: 18,
      totalSales: 480,
      totalRevenue: 28000,
      salesTrend: {
        percentage: 2,
        trend: 'up',
        periodChange: 2
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "6",
    name: "Converse",
    description: "Casual footwear and apparel",
    logo: "https://via.placeholder.com/150?text=Converse",
    website: "https://www.converse.com",
    products: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "converse",
    status: "active",
    metrics: {
      totalProducts: 15,
      activeProducts: 12,
      totalSales: 350,
      totalRevenue: 21000,
      salesTrend: {
        percentage: 1,
        trend: 'stable',
        periodChange: 1
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "7",
    name: "Vans",
    description: "Skateboarding shoes and apparel",
    logo: "https://via.placeholder.com/150?text=Vans",
    website: "https://www.vans.com",
    products: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "vans",
    status: "active",
    metrics: {
      totalProducts: 18,
      activeProducts: 16,
      totalSales: 420,
      totalRevenue: 25000,
      salesTrend: {
        percentage: 4,
        trend: 'up',
        periodChange: 4
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "8",
    name: "Under Armour",
    description: "Performance apparel and footwear",
    logo: "https://via.placeholder.com/150?text=Under+Armour",
    website: "https://www.underarmour.com",
    products: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "under-armour",
    status: "inactive",
    metrics: {
      totalProducts: 22,
      activeProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      salesTrend: {
        percentage: 0,
        trend: 'stable',
        periodChange: 0
      },
      lastUpdated: new Date().toISOString()
    }
  }
];
