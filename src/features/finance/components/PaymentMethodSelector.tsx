import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFinance } from "../context/FinanceContext";
import { PaymentMethod } from "../types/finance.types";
import { Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface PaymentMethodSelectorProps {
  title?: string;
  description?: string;
  selectedMethodId?: string;
  onSelect: (methodId: string) => void;
  showDisabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  title = "Payment Method",
  description = "Select a payment method",
  selectedMethodId,
  onSelect,
  showDisabled = false,
}) => {
  const { settings, loading } = useFinance();

  // Filter enabled payment methods
  const paymentMethods = settings.paymentMethods.filter(
    (method) => showDisabled || method.enabled
  );

  // Handle selection change
  const handleSelectionChange = (value: string) => {
    onSelect(value);
  };

  // Dynamic icon component
  const IconComponent = (iconName: string) => {
    // @ts-ignore - Dynamic icon import
    const Icon = LucideIcons[iconName] || LucideIcons.CreditCard;
    return <Icon className="h-5 w-5" />;
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethodId}
          onValueChange={handleSelectionChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {paymentMethods.map((method) => (
            <PaymentMethodOption
              key={method.id}
              method={method}
              selected={selectedMethodId === method.id}
            />
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

interface PaymentMethodOptionProps {
  method: PaymentMethod;
  selected: boolean;
}

const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  method,
  selected,
}) => {
  // @ts-ignore - Dynamic icon import
  const Icon = LucideIcons[method.icon] || LucideIcons.CreditCard;

  return (
    <div className="relative">
      <RadioGroupItem
        value={method.id}
        id={`payment-method-${method.id}`}
        className="peer sr-only"
        disabled={!method.enabled}
      />
      <Label
        htmlFor={`payment-method-${method.id}`}
        className={`flex items-center justify-between p-4 rounded-md border-2 ${
          selected
            ? "border-primary bg-primary/5"
            : "border-muted bg-background"
        } ${
          !method.enabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-accent hover:text-accent-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              selected ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{method.name}</p>
            {method.systemDefined && (
              <p className="text-xs text-muted-foreground">System defined</p>
            )}
          </div>
        </div>
        {!method.enabled && (
          <span className="text-xs text-muted-foreground">Disabled</span>
        )}
      </Label>
    </div>
  );
};
