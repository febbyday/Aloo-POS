import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { CustomerForm } from '../components/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types';
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

export function CustomerEditPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { getCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { toast } = useToast();
  const showToast = useToastManager();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch customer data
  useEffect(() => {
    if (customerId) {
      setLoading(true);
      getCustomer(customerId)
        .then(data => {
          setCustomer(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching customer:', error);
          showToast.error('Error', 'Failed to load customer data');
          setLoading(false);
        });
    }
  }, [customerId, getCustomer, showToast]);

  const handleSave = async (updatedCustomer: Customer) => {
    if (!customerId) return;

    try {
      await updateCustomer(customerId, updatedCustomer);
      showToast.success('Success', 'Customer updated successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast.error('Error', 'Failed to update customer');
    }
  };

  const handleDelete = async () => {
    if (!customerId) return;

    try {
      await deleteCustomer(customerId);
      showToast.success('Success', 'Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast.error('Error', 'Failed to delete customer');
    }
  };

  if (loading) {
    return <div>Loading customer data...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Customer"
        description="Update customer information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Customer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <CustomerForm
          customer={customer}
          onSave={handleSave}
          onCancel={() => navigate('/customers')}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
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
