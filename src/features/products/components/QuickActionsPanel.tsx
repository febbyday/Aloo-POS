// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { Button } from '@/components/ui/button';
import { 
  Edit,
  Printer,
  Truck,
  ArrowDownUp,
  Tag,
  Package,
  ArrowLeftRight,
  History,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from '../types';

interface QuickActionsPanelProps {
  product: Product;
  onEdit: () => void;
  onPrintLabel: () => void;
  onCreatePurchaseOrder: () => void;
  onManagePrice: () => void;
  onCategorize: () => void;
  onViewHistory?: () => void;
  onExportReport?: () => void;
  onTransfer?: () => void;
}

export function QuickActionsPanel({
  product,
  onEdit,
  onPrintLabel,
  onCreatePurchaseOrder,
  onManagePrice,
  onCategorize,
  onViewHistory,
  onExportReport,
  onTransfer,
}: QuickActionsPanelProps) {
  const actions = [
    {
      icon: History,
      label: 'History',
      onClick: onViewHistory,
      tooltip: 'View product history'
    },
    {
      icon: Printer,
      label: 'Print Label',
      onClick: onPrintLabel,
      tooltip: 'Print product label'
    },
    {
      icon: ArrowDownUp,
      label: 'Pricing',
      onClick: onManagePrice,
      tooltip: 'Manage product pricing'
    },
    {
      icon: FileText,
      label: 'Export',
      onClick: onExportReport,
      tooltip: 'Export product report'
    },
    {
      icon: ArrowLeftRight,
      label: 'Transfer',
      onClick: onTransfer,
      tooltip: 'Transfer product between locations'
    },
    {
      icon: Truck,
      label: 'Reorder',
      onClick: onCreatePurchaseOrder,
      tooltip: 'Create purchase order to restock'
    },
    {
      icon: Tag,
      label: 'Categorize',
      onClick: onCategorize,
      tooltip: 'Update product category'
    }
  ].filter(action => action.onClick !== undefined);

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <TooltipProvider>
          {actions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={action.onClick}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
