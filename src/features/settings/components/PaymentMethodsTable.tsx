import { PaymentMethod } from "../types/settings.types";
import { CrudTemplate } from "@/lib/crud-templates";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet, 
  Gift, 
  FileText,
  Building,
  CheckCircle2,
  X,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface PaymentMethodsTableProps {
  methods: PaymentMethod[];
  onEdit: (method: PaymentMethod) => void;
  onDelete: (methodId: string) => void;
  onToggleStatus: (methodId: string) => void;
  onAdd: () => void;
}

// Map of icon names to Lucide icon components
const iconMap: Record<string, React.ElementType> = {
  'credit-card': CreditCard,
  'cash': Banknote,
  'mobile': Smartphone,
  'wallet': Wallet,
  'gift-card': Gift,
  'check': FileText,
  'bank': Building
};

export function PaymentMethodsTable({
  methods,
  onEdit,
  onDelete,
  onToggleStatus,
  onAdd
}: PaymentMethodsTableProps) {
  return (
    <CrudTemplate
      title="Payment Methods"
      description="Manage payment methods available to customers"
      items={methods}
      primaryKey="id"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={(method) => {
        if (!method.systemDefined) {
          onDelete(method.id);
        }
      }}
      columns={[
        {
          header: "Method",
          accessorKey: (method) => {
            const Icon = iconMap[method.icon] || CreditCard;
            return (
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{method.name}</span>
                {method.systemDefined && (
                  <Badge variant="outline" className="ml-2">System</Badge>
                )}
              </div>
            );
          }
        },
        {
          header: "Status",
          accessorKey: (method) => {
            return (
              <div className="flex items-center gap-2">
                {method.enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{method.enabled ? "Enabled" : "Disabled"}</span>
              </div>
            );
          }
        },
        {
          header: "Toggle",
          accessorKey: (method) => {
            return (
              <Switch
                checked={method.enabled}
                onCheckedChange={() => onToggleStatus(method.id)}
              />
            );
          }
        }
      ]}
      actions={[
        {
          label: "Settings",
          icon: Settings,
          onClick: (method) => onEdit(method),
          condition: () => true
        }
      ]}
      emptyStateMessage="No payment methods configured"
      addButtonLabel="Add Payment Method"
    />
  );
}
