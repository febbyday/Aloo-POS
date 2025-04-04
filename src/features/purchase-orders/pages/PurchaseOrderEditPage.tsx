import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { PurchaseOrderModal } from '../components/PurchaseOrderModal';
import { usePurchaseOrderHistory } from '../context/PurchaseOrderHistoryContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PurchaseOrderEditPage() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = usePurchaseOrderHistory();
  
  const [purchaseOrder, setPurchaseOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch purchase order data
  useEffect(() => {
    if (purchaseOrderId) {
      setLoading(true);
      // Mock data for now - in a real app, you would fetch from an API
      setPurchaseOrder({
        id: purchaseOrderId,
        orderNumber: `PO-${purchaseOrderId}`,
        supplier: {
          id: "SUP-001",
          name: "Audio Supplies Co."
        },
        date: "2024-02-24",
        status: "Pending",
        total: 2499.99,
        items: 5,
        expectedDelivery: "2024-03-01"
      });
      setLoading(false);
    }
  }, [purchaseOrderId]);

  const handleSubmit = (data: any) => {
    if (!purchaseOrderId || !purchaseOrder) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'update_order', 
          id: purchaseOrderId,
          before: purchaseOrder,
          after: data
        },
        `Updated purchase order ${data.orderNumber}`
      );

      showToast.success('Success', 'Purchase order updated successfully');
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error updating purchase order:', error);
      showToast.error('Error', 'Failed to update purchase order');
    }
  };

  const handleDelete = () => {
    if (!purchaseOrderId || !purchaseOrder) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'delete_order', 
          order: purchaseOrder
        },
        `Deleted purchase order ${purchaseOrder.orderNumber}`
      );

      showToast.success('Success', 'Purchase order deleted successfully');
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      showToast.error('Error', 'Failed to delete purchase order');
    }
  };

  const handleCancel = () => {
    navigate('/purchase-orders');
  };

  if (loading) {
    return <div>Loading purchase order data...</div>;
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found</div>;
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Purchase Order"
        description="Update purchase order information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Purchase Order
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
        initialData={purchaseOrder}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase order
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
