// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { 
  Revenue, 
  Expense, 
  TaxRate,
  SalesData,
  TaxCategory,
  TaxReport 
} from "../types/finance.types";
import { v4 as uuidv4 } from "uuid";

/**
 * MockDataService provides centralized mock data generation for the Finance module
 * to ensure consistency across different components and contexts.
 */
class MockDataService {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Set a specific seed for deterministic data generation
   */
  setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Generate a pseudo-random number based on the current seed
   */
  private random(): number {
    // Simple pseudo-random number generator with seed
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random item from an array
   */
  randomItem<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Generate a date within the specified range
   */
  randomDate(start: Date, end: Date = new Date()): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = this.random() * (endTime - startTime) + startTime;
    return new Date(randomTime);
  }

  /**
   * Generate mock revenue data for a specified period
   */
  generateRevenues(days: number = 30): Revenue[] {
    const paymentMethods = ["cash", "card", "mobile", "bank"];
    const sources = ["in-store", "online", "phone", "delivery"];
    const mockData: Revenue[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate 1-5 transactions per day
      const transactionsCount = this.randomInt(1, 5);
      
      for (let j = 0; j < transactionsCount; j++) {
        mockData.push({
          id: uuidv4(),
          date: new Date(date),
          amount: parseFloat((this.random() * 1000 + 10).toFixed(2)),
          paymentMethod: this.randomItem(paymentMethods),
          source: this.randomItem(sources),
          description: `Sale #${this.randomInt(1000, 9999)}`,
        });
      }
    }
    
    return mockData;
  }

  /**
   * Generate sales data from revenue data to ensure consistency
   */
  generateSalesData(revenues: Revenue[]): SalesData[] {
    return revenues.map(rev => ({
      id: rev.id,
      date: rev.date,
      invoiceNumber: `INV-${this.randomInt(1000, 9999)}`,
      customer: `Customer ${this.randomInt(1, 100)}`,
      paymentMethod: rev.paymentMethod,
      amount: rev.amount,
      status: this.randomItem(['completed', 'pending', 'cancelled']) as 'completed' | 'pending' | 'cancelled',
    }));
  }

  /**
   * Generate mock expense data for a specified period
   */
  generateExpenses(days: number = 30): Expense[] {
    const categories = ["rent", "utilities", "inventory", "salaries", "marketing", "maintenance", "other"];
    const suppliers = ["Supplier A", "Supplier B", "Supplier C", "", "Supplier D"];
    const mockData: Expense[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate 0-3 expenses per day
      const expensesCount = this.randomInt(0, 3);
      
      for (let j = 0; j < expensesCount; j++) {
        const isRecurring = this.random() > 0.7;
        const category = this.randomItem(categories);
        
        mockData.push({
          id: uuidv4(),
          date: new Date(date),
          amount: parseFloat((this.random() * 500 + 20).toFixed(2)),
          category,
          supplier: this.randomItem(suppliers),
          description: `${category} expense`,
          recurring: isRecurring,
          recurringFrequency: isRecurring ? 
            this.randomItem(["monthly", "quarterly", "yearly"]) as "monthly" | "quarterly" | "yearly" : 
            undefined,
          nextDueDate: isRecurring ? new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()) : undefined,
        });
      }
    }
    
    return mockData;
  }

  /**
   * Generate default tax rates
   */
  generateTaxRates(): TaxRate[] {
    return [
      {
        id: "standard",
        name: "Standard Rate",
        rate: 20,
        isDefault: true,
        appliesTo: ["products", "services"],
        description: "Standard tax rate applied to most goods and services",
      },
      {
        id: "reduced",
        name: "Reduced Rate",
        rate: 5,
        isDefault: false,
        appliesTo: ["food", "books"],
        description: "Reduced tax rate for essential items",
      },
      {
        id: "zero",
        name: "Zero Rate",
        rate: 0,
        isDefault: false,
        appliesTo: ["exports", "children-items"],
        description: "Zero-rated items",
      },
    ];
  }

  /**
   * Generate tax categories
   */
  generateTaxCategories(): TaxCategory[] {
    return [
      { id: "goods", name: "Goods & Services", description: "Standard taxable goods and services" },
      { id: "food", name: "Food & Beverages", description: "Food and beverage items" },
      { id: "medical", name: "Medical", description: "Medical supplies and services" },
      { id: "education", name: "Education", description: "Educational materials and services" },
      { id: "export", name: "Exports", description: "Exported goods and services" },
    ];
  }

  /**
   * Generate collected taxes based on revenues and tax rates
   */
  generateCollectedTaxes(revenues: Revenue[], taxRates: TaxRate[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    // Initialize tax rate totals
    taxRates.forEach(rate => {
      result[rate.id] = 0;
    });
    
    // Apply random tax rates to revenues
    revenues.forEach(revenue => {
      const taxRate = this.randomItem(taxRates);
      result[taxRate.id] += (revenue.amount * taxRate.rate / 100);
    });
    
    return result;
  }

  /**
   * Generate tax reports for the past year
   */
  generateTaxReports(): TaxReport[] {
    const currentYear = new Date().getFullYear();
    return [
      { id: uuidv4(), name: "Q1 Tax Report", date: new Date(currentYear, 2, 31), amount: 4250.50 },
      { id: uuidv4(), name: "Q2 Tax Report", date: new Date(currentYear, 5, 30), amount: 5125.75 },
      { id: uuidv4(), name: "Q3 Tax Report", date: new Date(currentYear, 8, 30), amount: 4875.25 },
      { id: uuidv4(), name: "Q4 Tax Report", date: new Date(currentYear, 11, 31), amount: 6000.00 },
    ];
  }
}

// Create a singleton instance for use throughout the app
const mockDataService = new MockDataService();
export default mockDataService; 