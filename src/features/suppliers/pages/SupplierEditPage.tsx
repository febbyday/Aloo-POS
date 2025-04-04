import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { SupplierModal } from '../components/SupplierModal';
import { useSupplierHistory } from '../context/SupplierHistoryContext';
import { SupplierFormValues, Supplier } from '../types';
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

export function SupplierEditPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useSupplierHistory();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch supplier data
  useEffect(() => {
    if (supplierId) {
      setLoading(true);
      // Mock data for now - in a real app, you would fetch from an API
      setSupplier({
        id: supplierId,
        name: 'Sample Supplier',
        type: 'Manufacturer',
        contactPerson: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        products: 10,
        rating: 4.5,
        status: 'Active',
        lastOrder: '2023-01-15',
      } as Supplier);
      setLoading(false);
    }
  }, [supplierId]);

  const handleSubmit = (data: SupplierFormValues) => {
    if (!supplierId || !supplier) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'update_supplier', 
          id: supplierId,
          before: supplier,
          after: data as any
        },
        `Updated supplier ${data.name}`
      );

      showToast.success('Success', 'Supplier updated successfully');
      navigate('/suppliers');
    } catch (error) {
      console.error('Error updating supplier:', error);
      showToast.error('Error', 'Failed to update supplier');
    }
  };

  const handleDelete = () => {
    if (!supplierId || !supplier) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'delete_supplier', 
          supplier: supplier
        },
        `Deleted supplier ${supplier.name}`
      );

      showToast.success('Success', 'Supplier deleted successfully');
      navigate('/suppliers');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToast.error('Error', 'Failed to delete supplier');
    }
  };

  const handleCancel = () => {
    navigate('/suppliers');
  };

  if (loading) {
    return <div>Loading supplier data...</div>;
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Supplier"
        description="Update supplier information"
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
              Delete Supplier
            </Button>
          </div>
        }
      />

      <SupplierModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            handleCancel();
          }
        }}
        initialData={supplier as any}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
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
