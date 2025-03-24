import { PaymentSettings } from "../types/settings.types";
import { CrudTemplate } from "@/lib/crud-templates";
import { Clock, DollarSign, Calendar } from "lucide-react";

interface InstallmentPlansTableProps {
  plans: PaymentSettings['installment']['plans'];
  onDelete: (planId: string) => void;
  onAdd: () => void;
}

export function InstallmentPlansTable({
  plans,
  onDelete,
  onAdd
}: InstallmentPlansTableProps) {
  return (
    <CrudTemplate
      title="Installment Plans"
      description="Configure installment payment options for customers"
      items={plans}
      primaryKey="id"
      onAdd={onAdd}
      onDelete={(plan) => onDelete(plan.id)}
      columns={[
        {
          header: "Period",
          accessorKey: (plan) => {
            return (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {plan.period.frequency} {plan.period.unit}
                  {plan.period.frequency > 1 ? 's' : ''}
                </span>
              </div>
            );
          }
        },
        {
          header: "Price Range",
          accessorKey: (plan) => {
            return (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${plan.priceRange.min.toFixed(2)} - ${plan.priceRange.max.toFixed(2)}</span>
              </div>
            );
          }
        },
        {
          header: "Installments",
          accessorKey: (plan) => {
            return (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{plan.numberOfInstallments}</span>
              </div>
            );
          }
        }
      ]}
      emptyStateMessage="No installment plans configured"
      addButtonLabel="Add Plan"
    />
  );
}
