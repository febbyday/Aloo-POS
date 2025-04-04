import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Info, CreditCard } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import { useTemplates } from '../../hooks/gift-cards/useTemplates';
import { DesignTemplate, GiftCard } from '../../types/gift-cards';

// Form validation schema
const formSchema = z.object({
  // Gift Card Fields
  initialValue: z.coerce.number()
    .min(1, 'Value must be at least $1')
    .max(1000, 'Value cannot exceed $1,000'),
  
  expirationDate: z.date().nullable(),
  
  // Recipient Fields
  recipientName: z.string().nullable(),
  recipientEmail: z.string().email('Please enter a valid email').or(z.literal('')).nullable(),
  
  // Sender Fields
  senderName: z.string().nullable(),
  senderEmail: z.string().email('Please enter a valid email').or(z.literal('')).nullable(),
  
  // Message
  message: z.string().max(200, 'Message cannot exceed 200 characters').nullable(),
  
  // Template
  designTemplateId: z.string().nullable(),
  
  // Options
  generateCode: z.boolean().default(true),
  manualCode: z.string().nullable(),
  sendEmailToRecipient: z.boolean().default(false),
  generatePrintableVersion: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface GiftCardFormProps {
  giftCard?: GiftCard | null;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export function GiftCardForm({ giftCard, onSubmit, onCancel }: GiftCardFormProps) {
  const { templates, loading: loadingTemplates, getDefaultTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);

  // Initialize form with default values or existing gift card data
  const defaultValues: Partial<FormValues> = {
    initialValue: giftCard?.initialValue || 25,
    expirationDate: giftCard?.expirationDate ? new Date(giftCard.expirationDate) : getDefaultExpirationDate(),
    recipientName: giftCard?.recipient.name || null,
    recipientEmail: giftCard?.recipient.email || null,
    senderName: giftCard?.sender.name || null,
    senderEmail: giftCard?.sender.email || null,
    message: giftCard?.message || null,
    designTemplateId: giftCard?.designTemplateId || null,
    generateCode: !giftCard?.code,
    manualCode: giftCard?.code || null,
    sendEmailToRecipient: false,
    generatePrintableVersion: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Load default template if no template is selected
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      if (!giftCard?.designTemplateId) {
        const defaultTemplate = await getDefaultTemplate();
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
          form.setValue('designTemplateId', defaultTemplate.id);
        }
      } else {
        const template = templates.find(t => t.id === giftCard.designTemplateId);
        if (template) {
          setSelectedTemplate(template);
        }
      }
    };
    
    loadDefaultTemplate();
  }, [giftCard, templates, getDefaultTemplate, form]);

  // Helper to get default expiration date (90 days from now)
  function getDefaultExpirationDate() {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date;
  }

  // Handle template selection
  const handleTemplateSelect = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    form.setValue('designTemplateId', template.id);
  };

  // Handle manual code toggle
  const handleGenerateCodeToggle = (checked: boolean) => {
    form.setValue('generateCode', checked);
    if (checked) {
      form.setValue('manualCode', null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Card Details</TabsTrigger>
            <TabsTrigger value="design">Card Design</TabsTrigger>
          </TabsList>
          
          {/* Card Details Tab */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Value */}
              <FormField
                control={form.control}
                name="initialValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Card Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="25.00" 
                        {...field} 
                        type="number" 
                        min={1} 
                        step={0.01}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the monetary value of the gift card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No expiration date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-center text-center"
                            onClick={() => field.onChange(null)}
                            type="button"
                          >
                            No Expiration
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the card will expire (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Code Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Card Code Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how the gift card code is generated
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="generateCode"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormLabel className="text-sm">Auto-generate code</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={handleGenerateCodeToggle}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!form.watch('generateCode') && (
                <FormField
                  control={form.control}
                  name="manualCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Card Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="GIFT-XXXX-XXXX-XXXX" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a custom code for this gift card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Recipient Information */}
            <div>
              <h3 className="text-sm font-medium mb-4">Recipient Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Name of the person receiving the gift card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john.doe@example.com" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Email address to send the gift card to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Sender Information */}
            <div>
              <h3 className="text-sm font-medium mb-4">Sender Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Jane Smith" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Name of the person sending the gift card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="jane.smith@example.com" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Email address of the sender (for records)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Gift Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a custom message for the recipient..." 
                      className="resize-none min-h-[100px]"
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Custom message to include on the gift card (max 200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Delivery Options */}
            <div>
              <h3 className="text-sm font-medium mb-4">Delivery Options</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sendEmailToRecipient"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email to Recipient</FormLabel>
                        <FormDescription>
                          Send the gift card directly to the recipient via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generatePrintableVersion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Printable Version</FormLabel>
                        <FormDescription>
                          Generate a printable PDF version of the gift card
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Card Design Tab */}
          <TabsContent value="design" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="designTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Card Design Template</FormLabel>
                  <FormDescription>
                    Select a design template for the gift card
                  </FormDescription>

                  {/* Template Selection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {loadingTemplates ? (
                      <p className="text-sm text-muted-foreground col-span-3">Loading templates...</p>
                    ) : templates.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-3">No templates available</p>
                    ) : (
                      templates.filter(t => t.isActive).map((template) => (
                        <Card 
                          key={template.id}
                          className={cn(
                            "cursor-pointer hover:border-primary/50 transition-all",
                            field.value === template.id ? "border-2 border-primary" : ""
                          )}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm flex justify-between items-center">
                              {template.name}
                              {template.isDefault && (
                                <Badge variant="outline" className="ml-2">Default</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            {/* Template Thumbnail */}
                            <div className="aspect-[16/9] relative overflow-hidden rounded-md">
                              <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ 
                                  backgroundColor: template.styles.backgroundColor,
                                  backgroundImage: template.styles.backgroundImage ? 
                                    `url(${template.styles.backgroundImage})` : 
                                    undefined
                                }}
                              >
                                {/* Show placeholder if no background image */}
                                {!template.styles.backgroundImage && (
                                  <div className="flex items-center justify-center h-full">
                                    <CreditCard className="h-12 w-12 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection checkmark */}
                              {field.value === template.id && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="p-3 pt-2">
                            <p className="text-xs text-muted-foreground">
                              {template.description || 'No description'}
                            </p>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Template Preview */}
            {selectedTemplate && (
              <div className="mt-6 border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Selected Template: {selectedTemplate.name}</h3>
                <div className="aspect-[2/1] relative overflow-hidden rounded-md">
                  <div 
                    className="w-full h-full bg-cover bg-center flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedTemplate.styles.backgroundColor,
                      backgroundImage: selectedTemplate.styles.backgroundImage ? 
                        `url(${selectedTemplate.styles.backgroundImage})` : 
                        undefined
                    }}
                  >
                    {/* Preview content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="font-bold text-center text-2xl mb-1">
                        {form.watch('initialValue') ? 
                          `$${parseFloat(form.watch('initialValue').toString()).toFixed(2)}` : 
                          '$0.00'}
                      </div>
                      <div className="text-sm mb-3">Gift Card</div>
                      <div className="font-mono text-sm">
                        {form.watch('generateCode') ? 'XXXX-XXXX-XXXX-XXXX' : form.watch('manualCode') || 'XXXX-XXXX-XXXX-XXXX'}
                      </div>
                      {form.watch('message') && (
                        <div className="mt-4 text-sm italic text-center max-w-xs">
                          "{form.watch('message')}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This is a basic preview. The actual gift card will be generated based on the template design.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit">
            {giftCard ? 'Update Gift Card' : 'Create Gift Card'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 