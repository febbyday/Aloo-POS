/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Expense, ExpenseSchema, ExpenseCategory } from "../types/finance.types";
import { toast } from "@/lib/toast";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/lib/api/api-client";
import { useApiTransition } from "@/hooks/useApiTransition";
import { withApiTransition } from "@/lib/api/api-transition-utils";

// Fallback expense categories when API is unavailable
const fallbackExpenseCategories: ExpenseCategory[] = [
  { id: "rent", name: "Rent & Lease", description: "Office and store rent expenses" },
  { id: "utilities", name: "Utilities", description: "Electricity, water, internet, etc." },
  { id: "inventory", name: "Inventory", description: "Inventory and stock purchases" },
  { id: "salaries", name: "Salaries & Wages", description: "Employee salaries and wages" },
  { id: "marketing", name: "Marketing", description: "Advertising and marketing expenses" },
  { id: "maintenance", name: "Maintenance", description: "Equipment and property maintenance" },
  { id: "other", name: "Other", description: "Miscellaneous expenses" },
];

// Fallback expenses data when API is unavailable
const generateFallbackExpenses = (count: number = 30): Expense[] => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const expenses: Expense[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 180)); // Random day in last 6 months

    const categoryIndex = Math.floor(Math.random() * fallbackExpenseCategories.length);
    const category = fallbackExpenseCategories[categoryIndex];

    const amount = Math.floor(Math.random() * 5000) + 100; // Between 100 and 5100

    expenses.push({
      id: uuidv4(),
      date: date.toISOString(),
      amount: amount,
      category: category.id,
      description: `${category.name} expense`,
      paymentMethod: Math.random() > 0.5 ? "credit_card" : "bank_transfer",
      reference: `REF-${Math.floor(Math.random() * 1000000)}`,
      status: Math.random() > 0.3 ? "completed" : "pending",
      recurring: Math.random() > 0.7,
      recurringFrequency: Math.random() > 0.7 ? "monthly" : undefined,
      attachments: [],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use API transition for expense categories
  const {
    data: expenseCategories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useApiTransition<ExpenseCategory[]>({
    apiCall: () => apiClient.get('finance/expense-categories'),
    fallbackData: fallbackExpenseCategories,
    dependencies: []
  });

  // Load expense data
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);

        // Try to get expenses from API with transition fallback
        const response = await withApiTransition(
          () => apiClient.get('finance/expenses'),
          generateFallbackExpenses(30),
          { endpoint: 'finance/expenses' }
        );

        if (response.success) {
          setExpenses(response.data);
        } else {
          // If API call failed and we're using mock data
          if (response.isMock) {
            setExpenses(response.data);
          } else {
            throw new Error(response.error || "Failed to load expenses");
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load expenses:", err);
        setError(err instanceof Error ? err.message : "Failed to load expense data");
        setExpenses(generateFallbackExpenses(30));
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  // Add new expense
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const newExpense = {
        ...expense,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Validate with Zod
      const validatedExpense = ExpenseSchema.parse(newExpense);

      // Try to save to API with transition fallback
      const response = await withApiTransition(
        () => apiClient.post('finance/expenses', validatedExpense),
        validatedExpense,
        { endpoint: 'finance/expenses/create' }
      );

      // Update local state
      setExpenses(prev => [validatedExpense, ...prev]);

      toast.success("Expense Added", "New expense entry has been added successfully.");
    } catch (err) {
      console.error("Failed to add expense:", err);

      toast.error("Error Adding Expense", err instanceof Error ? err.message : "Failed to add expense. Please check your input.");
    }
  };

  // Update existing expense
  const updateExpense = async (id: string, expenseUpdate: Partial<Expense>) => {
    try {
      // Find the expense to update
      const existingExpense = expenses.find(exp => exp.id === id);

      if (!existingExpense) {
        throw new Error("Expense not found");
      }

      // Combine existing data with updates
      const updatedExpense = {
        ...existingExpense,
        ...expenseUpdate,
        updatedAt: new Date().toISOString()
      };

      // Validate with Zod
      const validatedExpense = ExpenseSchema.parse(updatedExpense);

      // Try to update via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.put(`finance/expenses/${id}`, validatedExpense),
        validatedExpense,
        { endpoint: `finance/expenses/${id}` }
      );

      // Update local state
      setExpenses(prev =>
        prev.map(exp => exp.id === id ? validatedExpense : exp)
      );

      toast.success("Expense Updated", "Expense has been updated successfully.");
    } catch (err) {
      console.error("Failed to update expense:", err);

      toast.error("Error Updating Expense", err instanceof Error ? err.message : "Failed to update expense. Please check your input.");
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    try {
      // Find the expense to delete
      const expenseToDelete = expenses.find(exp => exp.id === id);

      if (!expenseToDelete) {
        throw new Error("Expense not found");
      }

      // Try to delete via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.delete(`finance/expenses/${id}`),
        undefined,
        { endpoint: `finance/expenses/${id}` }
      );

      // Update local state
      setExpenses(prev => prev.filter(exp => exp.id !== id));

      toast.success("Expense Deleted", "Expense has been deleted successfully.");
    } catch (err) {
      console.error("Failed to delete expense:", err);

      toast.error("Error Deleting Expense", err instanceof Error ? err.message : "Failed to delete expense. Please try again.");
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate monthly expenses for charts
  const monthlyExpenses = React.useMemo(() => {
    const months: Record<string, number> = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      months[monthYear] = (months[monthYear] || 0) + expense.amount;
    });

    // Convert to array and sort by date
    return Object.entries(months)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses]);

  // Get upcoming recurring expenses
  const upcomingRecurringExpenses = React.useMemo(() => {
    return expenses
      .filter(expense => expense.recurring && expense.status !== "completed")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  const value: ExpenseContextType = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    loading: loading || categoriesLoading,
    error: error || categoriesError?.message || null,
    totalExpenses,
    expensesByCategory,
    monthlyExpenses,
    upcomingRecurringExpenses,
    expenseCategories: expenseCategories || fallbackExpenseCategories,
  };

  return (
    <ExpenseContext.Provider value={value}>
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

export default ExpenseContext;
