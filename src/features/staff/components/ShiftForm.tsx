import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shift, CreateShift, CreateShiftSchema } from '../types/staff.types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ShiftFormProps {
  shift?: Shift;
  onSubmit: (data: CreateShift) => void;
  onCancel: () => void;
  shops: { id: string; name: string }[];
}

export const ShiftForm = ({
  shift,
  onSubmit,
  onCancel,
  shops,
}: ShiftFormProps) => {
  const form = useForm<CreateShift>({
    resolver: zodResolver(CreateShiftSchema),
    defaultValues: shift
      ? {
          staffId: shift.staffId,
          shopId: shift.shopId,
          startTime: shift.startTime,
          endTime: shift.endTime,
          status: shift.status,
        }
      : {
          staffId: '',
          shopId: '',
          startTime: new Date(),
          endTime: null,
          status: 'ACTIVE',
        },
  });

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  const parseInputDate = (value: string): Date => {
    return new Date(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="shopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  value={formatDateForInput(value)}
                  onChange={e => onChange(parseInputDate(e.target.value))}
                  placeholder="Select start time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  value={formatDateForInput(value)}
                  onChange={e => onChange(parseInputDate(e.target.value))}
                  placeholder="Select end time"
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {shift ? 'Update Shift' : 'Create Shift'}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 