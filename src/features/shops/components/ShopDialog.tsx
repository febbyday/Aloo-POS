import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shop, ShopStaffMember } from '../types/shops.types'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
// Import staff hook to pull staff data
import { useStaff } from '@/features/staff/hooks/useStaff'
import { Staff } from '@/features/staff/types'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, UserCircle, CircleCheck, Check as CheckIcon, ChevronRight, ChevronLeft, Store, Clock, Plus, Trash, InfoIcon } from "lucide-react"
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useShopOperations } from '../hooks/useShopOperations'
import { Switch } from "@/components/ui/switch"

// Define time slot interface
interface TimeSlot {
  from: string;
  to: string;
}

// Define opening hours interface
interface DaySchedule {
  isOpen: boolean;
  timeSlots: TimeSlot[];
}

// New interface for grouped opening hours (weekdays/weekends)
interface GroupedOpeningHours {
  weekdays: DaySchedule;  // Monday-Friday
  weekends: DaySchedule;  // Saturday-Sunday
}

interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const defaultTimeSlot: TimeSlot = { from: '09:00', to: '17:00' };

const defaultDaySchedule: DaySchedule = {
  isOpen: true,
  timeSlots: [{ ...defaultTimeSlot }],
};

const defaultWeekendSchedule: DaySchedule = {
  isOpen: true,
  timeSlots: [{ from: '10:00', to: '15:00' }],
};

const defaultOpeningHours: OpeningHours = {
  monday: { ...defaultDaySchedule },
  tuesday: { ...defaultDaySchedule },
  wednesday: { ...defaultDaySchedule },
  thursday: { ...defaultDaySchedule },
  friday: { ...defaultDaySchedule },
  saturday: { ...defaultWeekendSchedule },
  sunday: { isOpen: false, timeSlots: [] },
};

// Default grouped opening hours
const defaultGroupedOpeningHours: GroupedOpeningHours = {
  weekdays: { ...defaultDaySchedule },
  weekends: { ...defaultWeekendSchedule }
};

// Convert from grouped hours to individual days
const expandGroupedHours = (groupedHours: GroupedOpeningHours): OpeningHours => {
  return {
    monday: { ...groupedHours.weekdays },
    tuesday: { ...groupedHours.weekdays },
    wednesday: { ...groupedHours.weekdays },
    thursday: { ...groupedHours.weekdays },
    friday: { ...groupedHours.weekdays },
    saturday: { ...groupedHours.weekends },
    sunday: { ...groupedHours.weekends },
  };
};

// Create grouped hours from individual days
const createGroupedHours = (hours: OpeningHours): GroupedOpeningHours => {
  return {
    weekdays: hours.monday, // Using Monday as the weekday template
    weekends: hours.saturday, // Using Saturday as the weekend template
  };
};

// Parse a string representation of opening hours to structured format
const parseOpeningHours = (hoursString?: string): OpeningHours => {
  if (!hoursString) return { ...defaultOpeningHours };
  
  try {
    return JSON.parse(hoursString) as OpeningHours;
  } catch (e) {
    // If parsing fails, return default
    return { ...defaultOpeningHours };
  }
};

// Format opening hours to a user-friendly string for display
const formatOpeningHoursToDisplay = (hours: OpeningHours): string => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const formattedDays: string[] = [];
  
  days.forEach(day => {
    const schedule = hours[day];
    if (schedule.isOpen && schedule.timeSlots.length > 0) {
      const timeRanges = schedule.timeSlots.map(slot => 
        `${slot.from} - ${slot.to}`
      ).join(', ');
      
      formattedDays.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${timeRanges}`);
    }
  });
  
  return formattedDays.join('\n');
};

// Define the validation schema for each step
const basicInfoSchema = z.object({
  name: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  type: z.enum(["retail", "warehouse", "outlet"]),
  status: z.enum(["active", "inactive", "maintenance"]),
});

const contactInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  manager: z.string().optional(),
  openingHours: z.string().optional(),
});

// Combined schema for all steps
const shopFormSchema = basicInfoSchema.merge(contactInfoSchema);

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  shop?: Shop
  onClose: () => void
  onSave?: (shop: Shop) => void
}

// Step component for the multi-step form
const FormStep = ({ 
  stepNumber, 
  title, 
  isActive, 
  isCompleted 
}: { 
  stepNumber: number; 
  title: string; 
  isActive: boolean; 
  isCompleted: boolean 
}) => (
  <div className={cn(
    "flex items-center gap-2",
    isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
  )}>
    <div className={cn(
      "flex items-center justify-center w-8 h-8 rounded-full border-2",
      isActive ? "border-primary bg-primary/10" : 
      isCompleted ? "border-success bg-success/10" : 
      "border-muted-foreground/30"
    )}>
      {isCompleted ? (
        <CheckIcon className="h-4 w-4 text-success" />
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
    <span className="font-medium">{title}</span>
  </div>
);

export function ShopDialog({
  open,
  mode,
  shop,
  onClose,
  onSave
}: ShopDialogProps) {
  // Current step state (1-based)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // State for opening hours (detailed per day)
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    parseOpeningHours(shop?.openingHours)
  );
  
  // State for grouped opening hours (weekdays/weekends for UI)
  const [groupedHours, setGroupedHours] = useState<GroupedOpeningHours>(
    createGroupedHours(parseOpeningHours(shop?.openingHours))
  );
  
  // Use React Hook Form with Zod validation
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: shop ? {
      name: shop.name,
      location: shop.location,
      type: shop.type,
      status: shop.status,
      phone: shop.phone || '',
      email: shop.email || '',
      manager: shop.manager || '',  // This is now expected to be a staff ID
      openingHours: shop.openingHours || '',
    } : {
      name: '',
      location: '',
      type: 'retail',
      status: 'active',
      phone: '',
      email: '',
      manager: '',
      openingHours: '',
    },
    mode: "onChange" // Validate on change for better UX
  });
  
  // State for staff members
  const [staffMembers, setStaffMembers] = useState<ShopStaffMember[]>(
    shop?.staffMembers || []
  );
  
  // Tracking form completion per step
  const [stepsCompleted, setStepsCompleted] = useState({
    1: false,
    2: false,
    3: false
  });
  
  // Use the staff hook to pull staff data from the staff module
  const { items: staffList, loading: loadingStaff } = useStaff({
    autoLoad: true,
    initialPageSize: 100 // Load a larger number of staff to choose from
  });
  
  const [staffSelectorOpen, setStaffSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Hook for API operations - MUST be before accessing apiLoading
  const { createShop, updateShop, loading: apiLoading, error: apiError } = useShopOperations();
  
  // Now we can safely use apiLoading
  const isLoading = isSubmitting || apiLoading;
  
  // Check if current step is valid to enable the Next button
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        // Basic info and contact validation
        const basicFields = form.getValues(['name', 'location', 'type', 'status']);
        const hasBasicErrors = !!form.formState.errors.name || 
                             !!form.formState.errors.location || 
                             !!form.formState.errors.type || 
                             !!form.formState.errors.status ||
                             !!form.formState.errors.phone ||
                             !!form.formState.errors.email;
        
        return basicFields.every(field => !!field) && !hasBasicErrors;
        
      case 2:
        // Staff and manager validation - both are optional, so always valid
        // If a manager is selected, it should be a valid staff ID
        const manager = form.getValues('manager');
        return !form.formState.errors.manager;
        
      case 3:
        // Opening hours validation - check if all days are closed
        const allDaysClosed = Object.values(groupedHours).every(schedule => !schedule.isOpen || schedule.timeSlots.length === 0);
        return !allDaysClosed;
        
      default:
        return false;
    }
  };
  
  // Navigate to next step
  const goToNextStep = async () => {
    // Only validate fields for the current step
    let fieldsToValidate: string[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'location', 'type', 'status', 'phone', 'email'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['manager'];
      // Update opening hours in form data
      form.setValue('openingHours', JSON.stringify(openingHours), { shouldValidate: false });
    } else if (currentStep === 3) {
      fieldsToValidate = ['openingHours'];
    }
    
    // Only trigger validation for current step's fields
    const isStepValid = await form.trigger(fieldsToValidate as any);
    
    if (isStepValid && isCurrentStepValid()) {
      // Mark current step as completed
      setStepsCompleted(prev => ({
        ...prev,
        [currentStep]: true
      }));
      
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (formData: ShopFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert grouped hours to detailed opening hours and update the form data
      const detailedOpeningHours = expandGroupedHours(groupedHours);
      
      // Update opening hours data
      const updatedFormData = {
        ...formData,
        openingHours: JSON.stringify(detailedOpeningHours)
      };
      
      // Create shop data based on form values and staff members
      const shopData = {
        name: updatedFormData.name,
        location: updatedFormData.location,
        type: updatedFormData.type,
        status: updatedFormData.status,
        staffCount: staffMembers.length,
        staffMembers: staffMembers,
        phone: updatedFormData.phone,
        email: updatedFormData.email,
        manager: updatedFormData.manager,
        openingHours: updatedFormData.openingHours,
      };
      
      let result: Shop | null = null;
      
      // If editing, update the existing shop
      if (mode === 'edit' && shop) {
        result = await updateShop(shop.id, shopData);
      } 
      // If creating, create a new shop
      else {
        result = await createShop(shopData);
      }
      
      // If operation was successful and we have a result
      if (result) {
        // Call the onSave callback if provided
        if (onSave) {
          onSave(result);
        }
        
        onClose();
      }
    } catch (error) {
      console.error("Error saving shop:", error);
    toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} shop. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle group open/closed status (weekdays or weekends)
  const toggleGroupOpen = (groupKey: keyof GroupedOpeningHours) => {
    setGroupedHours(prev => {
      const updated = { ...prev };
      
      // Toggle isOpen status
      updated[groupKey] = {
        ...updated[groupKey],
        isOpen: !updated[groupKey].isOpen
      };
      
      // Ensure at least one time slot if opening
      if (updated[groupKey].isOpen && updated[groupKey].timeSlots.length === 0) {
        updated[groupKey].timeSlots = groupKey === 'weekdays' 
          ? [{ ...defaultTimeSlot }] 
          : [{ from: '10:00', to: '15:00' }];
      }
      
      return updated;
    });
  };
  
  // Add a time slot to a group
  const addGroupTimeSlot = (groupKey: keyof GroupedOpeningHours) => {
    setGroupedHours(prev => {
      const updated = { ...prev };
      
      // Get the last time slot end time as a starting point for the new slot
      const lastSlot = updated[groupKey].timeSlots[updated[groupKey].timeSlots.length - 1];
      const newFromTime = lastSlot ? lastSlot.to : '09:00';
      let newToTime = '17:00';
      
      // Calculate a reasonable end time (2 hours after start)
      const [hours, minutes] = newFromTime.split(':').map(Number);
      const newHours = hours + 2;
      if (newHours < 24) {
        newToTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      updated[groupKey].timeSlots.push({ from: newFromTime, to: newToTime });
      return updated;
    });
  };
  
  // Remove a time slot from a group
  const removeGroupTimeSlot = (groupKey: keyof GroupedOpeningHours, index: number) => {
    setGroupedHours(prev => {
      const updated = { ...prev };
      updated[groupKey].timeSlots = updated[groupKey].timeSlots.filter((_, i) => i !== index);
      return updated;
    });
  };
  
  // Update a time slot in a group
  const updateGroupTimeSlot = (
    groupKey: keyof GroupedOpeningHours, 
    index: number, 
    field: 'from' | 'to', 
    value: string
  ) => {
    setGroupedHours(prev => {
      const updated = { ...prev };
      updated[groupKey].timeSlots = [...updated[groupKey].timeSlots];
      updated[groupKey].timeSlots[index] = {
        ...updated[groupKey].timeSlots[index],
        [field]: value
      };
      return updated;
    });
  };
  
  // Clone hours from one day to all weekdays or weekend days
  const applyHoursToMultipleDays = (sourceDay: keyof OpeningHours, targetDays: Array<keyof OpeningHours>) => {
    setOpeningHours(prev => {
      const updated = { ...prev };
      const sourceSchedule = updated[sourceDay];
      
      targetDays.forEach(day => {
        updated[day] = {
          isOpen: sourceSchedule.isOpen,
          timeSlots: sourceSchedule.timeSlots.map(slot => ({ ...slot }))
        };
      });
      
      return updated;
    });
  };
  
  // Convert a Staff object to a ShopStaffMember
  const convertToShopStaffMember = (staff: Staff): ShopStaffMember => {
    return {
      id: staff.id,
      name: `${staff.firstName} ${staff.lastName}`,
      position: staff.role?.name || 'Staff',
      email: staff.email || ''
    };
  };
  
  // Add a staff member to the shop
  const addStaffMember = (staff: Staff) => {
    const shopStaffMember = convertToShopStaffMember(staff);
    
    // Check if staff is already added
    if (staffMembers.some(member => member.id === staff.id)) {
      return;
    }
    
    setStaffMembers(prev => [...prev, shopStaffMember]);
  };
  
  // Remove a staff member from the shop
  const removeStaffMember = (staffId: string) => {
    setStaffMembers(prev => prev.filter(member => member.id !== staffId));
  };
  
  // Render form steps based on current step
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Store className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-medium text-center">Basic Shop Information</h3>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter shop name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location*</FormLabel>
                  <FormControl>
              <Input
                placeholder="Enter shop location"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Contact Information - Moved to appear after location */}
            <div className="pt-2 pb-2">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          {...field} 
                        />
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
                          placeholder="Enter email address" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Type*</FormLabel>
              <Select
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                      </FormControl>
                <SelectContent>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="outlet">Outlet Store</SelectItem>
                </SelectContent>
              </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Store className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-medium text-center">Staff Assignment</h3>
            </div>
            
            {/* Manager Selection */}
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      // If a staff ID is selected, store it
                      // If "none" is selected, store empty string
                      field.onChange(value === "none" ? "" : value);
                    }}
                    value={field.value || "none"}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager">
                          {field.value && staffList ? 
                            (() => {
                              // Find the staff member by ID
                              const manager = staffList.find(staff => staff.id === field.value);
                              return manager ? 
                                `${manager.firstName} ${manager.lastName}${manager.role ? ` (${manager.role.name})` : ''}` : 
                                field.value;
                            })() : 
                            "No manager assigned"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No manager assigned</SelectItem>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName}
                          {staff.role && ` (${staff.role.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3 mt-4">
              <Label>Assign Staff to Shop</Label>
              <Popover open={staffSelectorOpen} onOpenChange={setStaffSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={staffSelectorOpen}
                    className="justify-between w-full"
                    type="button"
                  >
                    Select Staff Members
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search staff by name or position..." />
                    <CommandEmpty>
                      {loadingStaff ? "Loading staff..." : "No staff found."}
                    </CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {staffList.map((staff) => (
                          <CommandItem
                            key={staff.id}
                            value={staff.id}
                            onSelect={() => {
                              addStaffMember(staff);
                              setStaffSelectorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                staffMembers.some(s => s.id === staff.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{staff.firstName} {staff.lastName}</span>
                            {staff.role && (
                              <Badge variant="outline" className="ml-2">
                                {staff.role.name}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Display selected staff members */}
              {staffMembers.length > 0 ? (
                <ScrollArea className="h-[180px] rounded-md border p-2">
                  <div className="space-y-2">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          <span>{staff.name}</span>
                          <Badge variant="outline">{staff.position}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStaffMember(staff.id)}
                          type="button"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center p-4 text-muted-foreground border rounded-md">
                  No staff members assigned to this shop
                </div>
              )}
              
              {/* Staff count is now derived from the selected staff members */}
              <div className="text-sm text-muted-foreground">
                Staff Count: {staffMembers.length}
              </div>
              
              <div className="mt-4 bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Staff members can be managed at any time from the shop details page after creation.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return renderOpeningHoursSection();
        
      default:
        return null;
    }
  };

  // Opening Hours UI Section - Step 4
  const renderOpeningHoursSection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Clock className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-medium text-center">Opening Hours</h3>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Set when your shop is open for business
          </p>
        </div>

        <div className="space-y-6">
          {/* Weekdays and Weekends sections */}
          {Object.entries(groupedHours).map(([groupKey, schedule]) => {
            const displayName = groupKey === 'weekdays' ? 'Weekdays (Mon-Fri)' : 'Weekends (Sat-Sun)';
            
            return (
              <div key={groupKey} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`open-${groupKey}`}
                      checked={schedule.isOpen}
                      onCheckedChange={() => toggleGroupOpen(groupKey as keyof GroupedOpeningHours)}
                    />
                    <Label 
                      htmlFor={`open-${groupKey}`}
                      className="font-medium"
                    >
                      {displayName}
                    </Label>
                  </div>
                  
                  {schedule.isOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addGroupTimeSlot(groupKey as keyof GroupedOpeningHours)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  )}
                </div>
                
                {schedule.isOpen && (
                  <div className="mt-4 space-y-2">
                    {schedule.timeSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No time slots added</p>
                    ) : (
                      schedule.timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={slot.from}
                              onChange={(e) => updateGroupTimeSlot(
                                groupKey as keyof GroupedOpeningHours,
                                index,
                                'from',
                                e.target.value
                              )}
                              className="w-32"
                            />
                            <span>to</span>
              <Input
                              type="time"
                              value={slot.to}
                              onChange={(e) => updateGroupTimeSlot(
                                groupKey as keyof GroupedOpeningHours,
                                index,
                                'to',
                                e.target.value
                              )}
                              className="w-32"
                            />
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGroupTimeSlot(groupKey as keyof GroupedOpeningHours, index)}
                          >
                            <Trash className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {!schedule.isOpen && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {groupKey === 'weekdays' ? 'Weekdays' : 'Weekends'} are set as closed
                  </p>
                )}
              </div>
            );
          })}
          
          {/* Show note about overriding specific days */}
          <div className="mt-4 p-4 bg-muted rounded-md">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Need different hours for specific days?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You can adjust specific days later in the shop settings after creating the shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Prevent default form submission on Enter key
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission when pressing Enter
    if (e.key === 'Enter' && currentStep < totalSteps) {
      e.preventDefault();
      // If on a text input and not the last step, go to next step instead of submitting
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        goToNextStep();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Shop' : 'Edit Shop'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new shop to your business' 
              : 'Edit shop details and settings'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicators */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <FormStep 
            stepNumber={1} 
            title="Basic Info" 
            isActive={currentStep === 1} 
            isCompleted={stepsCompleted[1]} 
          />
          <div className="w-8 h-[2px] bg-muted-foreground/30" />
          <FormStep 
            stepNumber={2} 
            title="Staff" 
            isActive={currentStep === 2} 
            isCompleted={stepsCompleted[2]} 
          />
          <div className="w-8 h-[2px] bg-muted-foreground/30" />
          <FormStep 
            stepNumber={3} 
            title="Opening Hours" 
            isActive={currentStep === 3} 
            isCompleted={stepsCompleted[3]} 
          />
        </div>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-6"
            onKeyDown={handleFormKeyDown}
          >
            {/* Form step content */}
            <div className="p-6">
              {renderFormStep()}
            </div>
            
            <DialogFooter className="pt-2 flex items-center justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      goToNextStep();
                    }}
                    disabled={!isCurrentStepValid()}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : mode === 'create' ? 'Create Shop' : 'Save Changes'}
            </Button>
                )}
              </div>
          </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
