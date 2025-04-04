import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { PurchaseOrderModal } from '../components/PurchaseOrderModal';
import { usePurchaseOrderHistory } from '../context/PurchaseOrderHistoryContext';

export function PurchaseOrderAddPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = usePurchaseOrderHistory();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = (data: any) => {
    try {
      // Track this action for history
      trackAction(
        { type: 'create_order', order: data },
        `Created purchase order ${data.orderNumber}`
      );

      showToast.success('Success', 'Purchase order created successfully');
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      showToast.error('Error', 'Failed to create purchase order');
    }
  };

  const handleCancel = () => {
    navigate('/purchase-orders');
  };

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Purchase Order"
        description="Create a new purchase order in your system"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        }
      />

      <PurchaseOrderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            handleCancel();
          }
        }}
      />
    </div>
  );
}
