// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Expense, ExpenseSchema, ExpenseCategory } from "../types/finance.types";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import mockDataService from "../services/MockDataService";

// Default expense categories
const defaultExpenseCategories: ExpenseCategory[] = [
  { id: "rent", name: "Rent & Lease", description: "Office and store rent expenses" },
  { id: "utilities", name: "Utilities", description: "Electricity, water, internet, etc." },
  { id: "inventory", name: "Inventory", description: "Inventory and stock purchases" },
  { id: "salaries", name: "Salaries & Wages", description: "Employee salaries and wages" },
  { id: "marketing", name: "Marketing", description: "Advertising and marketing expenses" },
  { id: "maintenance", name: "Maintenance", description: "Equipment and property maintenance" },
  { id: "other", name: "Other", description: "Miscellaneous expenses" },
];

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  loading: boolean;
  error: string | null;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  monthlyExpenses: { date: string; amount: number }[];
  upcomingRecurringExpenses: Expense[];
  expenseCategories: ExpenseCategory[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load expense data
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Use MockDataService instead of inline mock data generation
        const mockExpenses = mockDataService.generateExpenses(30);
        setExpenses(mockExpenses);
        
        // Use MockDataService for expense categories
        setExpenseCategories(defaultExpenseCategories);
        
        setError(null);
      } catch (err) {
        console.error("Failed to load expenses:", err);
        setError("Failed to load expense data");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  // Add new expense
  const addExpense = (expense: Omit<Expense, "id">) => {
    try {
      const newExpense = {
        ...expense,
        id: uuidv4(),
      };
      
      // Validate with Zod
      const validatedExpense = ExpenseSchema.parse(newExpense);
      
      setExpenses(prev => [validatedExpense, ...prev]);
      
      toast({
        title: "Expense added",
        description: "New expense entry has been added successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to add expense:", err);
      toast({
        title: "Error",
        description: "Failed to add expense. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Update existing expense
  const updateExpense = (id: string, expenseUpdate: Partial<Expense>) => {
    try {
      setExpenses(prev => 
        prev.map(exp => {
          if (exp.id === id) {
            const updated = { ...exp, ...expenseUpdate };
            // Validate with Zod
            return ExpenseSchema.parse(updated);
          }
          return exp;
        })
      );
      
      toast({
        title: "Expense updated",
        description: "Expense entry has been updated successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to update expense:", err);
      toast({
        title: "Error",
        description: "Failed to update expense. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    try {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      
      toast({
        title: "Expense deleted",
        description: "Expense entry has been deleted successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to delete expense:", err);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate derived data
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category;
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate monthly expenses
  const monthlyExpenses = (() => {
    const last12Months: { date: string; amount: number }[] = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });
      
      const totalForMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      last12Months.push({
        date: monthYear,
        amount: totalForMonth,
      });
    }
    
    return last12Months;
  })();
  
  // Get upcoming recurring expenses (next 30 days)
  const upcomingRecurringExpenses = (() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return expenses.filter(exp => 
      exp.recurring && 
      exp.nextDueDate && 
      exp.nextDueDate >= today && 
      exp.nextDueDate <= thirtyDaysFromNow
    ).sort((a, b) => {
      if (a.nextDueDate && b.nextDueDate) {
        return a.nextDueDate.getTime() - b.nextDueDate.getTime();
      }
      return 0;
    });
  })();

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        loading,
        error,
        totalExpenses,
        expensesByCategory,
        monthlyExpenses,
        upcomingRecurringExpenses,
        expenseCategories,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};
