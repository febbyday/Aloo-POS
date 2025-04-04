import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { CustomerForm } from '../components/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types';

export function CustomerAddPage() {
  const navigate = useNavigate();
  const { createCustomer } = useCustomers();
  const { toast } = useToast();
  const showToast = useToastManager();

  const handleSave = async (customer: Customer) => {
    try {
      await createCustomer(customer);
      showToast.success('Success', 'Customer created successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast.error('Error', 'Failed to create customer');
    }
  };

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Customer"
        description="Create a new customer in your system"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <CustomerForm
          onSave={handleSave}
          onCancel={() => navigate('/customers')}
        />
      </div>
    </div>
  );
}
