import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Product } from "../../types";

// Define the schema for the adjustment form
const adjustmentSchema = z.object({
  locationId: z.string().min(1, "Location is required"),
  type: z.enum(["add", "remove", "set"], {
    required_error: "Adjustment type is required",
  }),
  quantity: z.coerce
    .number()
    .positive("Quantity must be a positive number")
    .min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
});

// Define the type for the adjustment values
type AdjustmentValues = z.infer<typeof adjustmentSchema>;

// Define the props for the component
interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  locationId?: string;
  onAdjustStock: (
    locationId: string,
    type: "add" | "remove" | "set",
    quantity: number,
    reason: string
  ) => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
  locationId,
  onAdjustStock,
}: StockAdjustmentDialogProps) {
  // Initialize the form
  const form = useForm<AdjustmentValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      locationId: locationId || product.locations?.[0]?.id || product.locations?.[0]?.locationId || "",
      type: "add",
      quantity: 1,
      reason: "",
    },
  });

  // Reset the form when the dialog opens or locationId changes
  useEffect(() => {
    if (open) {
      form.reset({
        locationId: locationId || product.locations?.[0]?.id || product.locations?.[0]?.locationId || "",
        type: "add",
        quantity: 1,
        reason: "",
      });
    }
  }, [open, locationId, product.locations, form]);

  // Get the selected location
  const selectedLocationId = form.watch("locationId");
  const selectedLocation = product.locations?.find(
    (loc) => loc.id === selectedLocationId || loc.locationId === selectedLocationId
  );
  const currentStock = selectedLocation?.stock || 0;

  // Get the selected adjustment type
  const adjustmentType = form.watch("type");
  const quantity = form.watch("quantity");

  // Calculate the new stock level based on the adjustment type
  const calculateNewStock = () => {
    switch (adjustmentType) {
      case "add":
        return currentStock + quantity;
      case "remove":
        return Math.max(0, currentStock - quantity);
      case "set":
        return quantity;
      default:
        return currentStock;
    }
  };

  // Handle form submission
  const onSubmit = (values: AdjustmentValues) => {
    onAdjustStock(
      values.locationId,
      values.type,
      values.quantity,
      values.reason
    );
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust inventory levels for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location Field */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product.locations?.map((location) => (
                        <SelectItem
                          key={location.id || location.locationId}
                          value={location.id || location.locationId || ""}
                        >
                          {location.name || `Location ${location.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the location where you want to adjust stock
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adjustment Type Field */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="remove">Remove Stock</SelectItem>
                      <SelectItem value="set">Set Stock Level</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {adjustmentType === "add"
                      ? "Add stock to the current inventory level"
                      : adjustmentType === "remove"
                      ? "Remove stock from the current inventory level"
                      : "Set the inventory to a specific level"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity Field */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? "" : value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {adjustmentType === "add"
                      ? "Number of units to add"
                      : adjustmentType === "remove"
                      ? "Number of units to remove"
                      : "New stock level"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for adjustment"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a reason for this stock adjustment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stock Information</AlertTitle>
              <AlertDescription className="text-sm">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>Current Stock:</div>
                  <div className="font-medium">{currentStock}</div>
                  <div>New Stock:</div>
                  <div className="font-medium">{calculateNewStock()}</div>
                  <div>Location:</div>
                  <div className="font-medium">
                    {selectedLocation?.name || `Location ${selectedLocationId}`}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Adjust Stock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
