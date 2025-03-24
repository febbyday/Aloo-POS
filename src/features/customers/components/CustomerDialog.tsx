/**
 * Customer Dialog Component
 * 
 * A dialog component for creating and editing customer information
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Customer } from '../types/customer.types'
import { useToast } from '@/hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const customerFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  status: z.enum(['active', 'inactive', 'blocked']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerDialogProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerAdded?: (customer: Customer) => void
  onCustomerUpdated?: (customer: Customer) => void
}

export function CustomerDialog({ 
  customer,
  open,
  onOpenChange,
  onCustomerAdded,
  onCustomerUpdated
}: CustomerDialogProps) {
  const { toast } = useToast()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      status: customer?.status ?? 'active',
      address: customer?.address ?? {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      notes: customer?.notes ?? '',
      tags: customer?.tags ?? [],
    }
  })

  function onSubmit(data: CustomerFormValues) {
    // Create a properly formatted customer object
    const updatedCustomer: Customer = {
      id: customer?.id || Date.now().toString(),
      ...data,
      loyaltyPoints: customer?.loyaltyPoints || 0,
      loyaltyTierId: customer?.loyaltyTierId,
      createdAt: customer?.createdAt || new Date(),
      updatedAt: new Date(),
      lastPurchaseDate: customer?.lastPurchaseDate,
      totalPurchases: customer?.totalPurchases || 0,
    };
    
    toast({
      title: customer ? "Customer Updated" : "Customer Created",
      description: `Successfully ${customer ? 'updated' : 'created'} ${data.firstName} ${data.lastName}`,
    })
    
    if (customer && onCustomerUpdated) {
      onCustomerUpdated(updatedCustomer);
    } else if (onCustomerAdded) {
      onCustomerAdded(updatedCustomer);
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'New Customer'}
          </DialogTitle>
          <DialogDescription>
            {customer 
              ? 'Update customer information and preferences'
              : 'Add a new customer to your database'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="john@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="+1234567890" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {customer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Add default export
export default CustomerDialog;
