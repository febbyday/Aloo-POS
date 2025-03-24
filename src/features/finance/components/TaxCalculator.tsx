// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTax } from "../context/TaxContext";
import { useFinance } from "../context/FinanceContext";
import { Loader2, Calculator } from "lucide-react";

interface TaxCalculatorProps {
  title?: string;
  description?: string;
  showReset?: boolean;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  title = "Tax Calculator",
  description = "Calculate tax amounts for different rates",
  showReset = true,
}) => {
  const { taxRates, getDefaultTaxRate, loading } = useTax();
  const { settings } = useFinance();
  
  const [amount, setAmount] = useState<string>("0");
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>("");
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Set default tax rate on load
  useEffect(() => {
    if (!loading && taxRates.length > 0) {
      const defaultTaxRate = getDefaultTaxRate();
      if (defaultTaxRate) {
        setSelectedTaxRateId(defaultTaxRate.id);
      } else {
        setSelectedTaxRateId(taxRates[0].id);
      }
    }
  }, [loading, taxRates, getDefaultTaxRate]);
  
  // Format currency based on settings
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  // Calculate tax when inputs change
  useEffect(() => {
    if (selectedTaxRateId && amount) {
      const amountValue = parseFloat(amount) || 0;
      const taxRate = taxRates.find(rate => rate.id === selectedTaxRateId);
      
      if (taxRate) {
        const calculatedTax = (amountValue * taxRate.rate) / 100;
        setTaxAmount(calculatedTax);
        setTotalAmount(amountValue + calculatedTax);
      }
    }
  }, [amount, selectedTaxRateId, taxRates]);
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^(\d*\.?\d*)$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  // Handle tax rate change
  const handleTaxRateChange = (value: string) => {
    setSelectedTaxRateId(value);
  };
  
  // Handle reset
  const handleReset = () => {
    setAmount("0");
    const defaultTaxRate = getDefaultTaxRate();
    if (defaultTaxRate) {
      setSelectedTaxRateId(defaultTaxRate.id);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="taxRate" className="text-sm font-medium">
            Tax Rate
          </label>
          <Select value={selectedTaxRateId} onValueChange={handleTaxRateChange}>
            <SelectTrigger id="taxRate">
              <SelectValue placeholder="Select tax rate" />
            </SelectTrigger>
            <SelectContent>
              {taxRates.map((taxRate) => (
                <SelectItem key={taxRate.id} value={taxRate.id}>
                  {taxRate.name} ({taxRate.rate}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg bg-muted p-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal:</span>
              <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">
                Tax ({taxRates.find(rate => rate.id === selectedTaxRateId)?.rate || 0}%):
              </span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {showReset && (
        <CardFooter>
          <Button variant="outline" onClick={handleReset} className="w-full">
            Reset
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
