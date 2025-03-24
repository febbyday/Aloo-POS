import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Customer } from '../types';
import { useToastManager } from '@/components/ui/toast-manager';
import { useCustomerHistory } from '../context/CustomerHistoryContext';
import { FieldHelpTooltip, InfoBox } from '@/components/ui/help-tooltip';
import { OperationButton } from '@/components/ui/action-feedback';
import { Save, User, Mail, Phone, MapPin, Tag, Building, CreditCard } from 'lucide-react';

interface CustomerFormProps {
  customer?: Partial<Customer>;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer = {}, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(customer);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Use our enhanced toast manager
  const showToast = useToastManager();
  
  // Use customer history for undo/redo
  const { trackAction, canUndo, undo, canRedo, redo } = useCustomerHistory();
  
  // Validate a specific field
  const validateField = (field: string, value: any): string => {
    switch(field) {
      case 'name':
        return !value || value.trim() === '' ? 'Customer name is required' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value && !emailRegex.test(value) ? 'Invalid email format' : '';
      case 'phone':
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return value && !phoneRegex.test(value) ? 'Invalid phone number' : '';
      default:
        return '';
    }
  };
  
  // Handle field updates with validation and history tracking
  const handleFieldUpdate = (field: string, value: any, originalValue?: any) => {
    // Store original value for undo
    if (originalValue === undefined) {
      originalValue = formData[field as keyof Customer];
    }
    
    // Update form state
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark as dirty (needs saving)
    setIsDirty(true);
    
    // Validate the field
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    // Track this change for potential undo
    trackAction(
      { 
        type: 'update', 
        id: formData.id || 'new-customer', 
        before: { [field]: originalValue }, 
        after: { [field]: value } 
      },
      `Changed ${field}`
    );
  };
  
  // Autosave draft
  useEffect(() => {
    if (!isDirty) return;
    
    const draftKey = 'customer_draft';
    
    // Save to localStorage
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    };
    
    // Set autosave timer (save after 3 seconds of inactivity)
    const timer = setTimeout(() => {
      saveToLocalStorage();
      showToast.info("Draft saved", "Your changes have been automatically saved as a draft.");
    }, 3000);
    
    // Cleanup
    return () => clearTimeout(timer);
  }, [formData, isDirty, showToast]);
  
  // Load draft on initial mount
  useEffect(() => {
    const draftKey = 'customer_draft';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft && Object.keys(customer).length === 0) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setLastSaved(new Date());
        
        showToast.info("Draft loaded", "Continuing from your previous draft.");
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [customer, showToast]);
  
  // Listen for undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Command+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        const action = undo();
        
        if (action && action.type === 'update') {
          const { id, before } = action;
          // Apply the change from the undo
          setFormData(prev => ({ ...prev, ...before }));
          showToast.info("Undo", "Previous change undone");
        }
      }
      
      // Check for Ctrl+Shift+Z or Command+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        const action = redo();
        
        if (action && action.type === 'update') {
          const { id, after } = action;
          // Apply the change from the redo
          setFormData(prev => ({ ...prev, ...after }));
          showToast.info("Redo", "Change reapplied");
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, showToast]);
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate all required fields
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    // Required fields
    const requiredFields = ['name'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof Customer]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });
    
    // Optional fields that need validation if present
    const optionalFields = ['email', 'phone'];
    optionalFields.forEach(field => {
      if (formData[field as keyof Customer]) {
        const error = validateField(field, formData[field as keyof Customer]);
        if (error) {
          errors[field] = error;
          hasErrors = true;
        }
      }
    });
    
    if (hasErrors) {
      setValidationErrors(errors);
      showToast.error("Validation errors", "Please fix the errors before saving.");
      return false;
    }
    
    // Track this action for undo
    trackAction(
      { type: 'create', customer: formData as Customer },
      `Created customer ${formData.name}`
    );
    
    // Clear the draft
    localStorage.removeItem('customer_draft');
    
    // Call the onSave callback
    onSave(formData as Customer);
    
    showToast.success("Customer saved", "Customer has been saved successfully");
    return true;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {customer.id ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {customer.id ? 'Update customer information' : 'Create a new customer record'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Auto-saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => undo()}
              disabled={!canUndo}
            >
              Undo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => redo()}
              disabled={!canRedo}
            >
              Redo
            </Button>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <InfoBox variant="info" className="mb-4">
        Fill in the customer information. Fields marked with * are required.
        Press Ctrl+Z (or ⌘+Z on Mac) to undo any changes.
      </InfoBox>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the customer's personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Full Name"
                  content="Customer's full name as it will appear on invoices and receipts."
                  required
                />
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    className="pl-8"
                    value={formData.name || ''}
                    onChange={(e) => handleFieldUpdate('name', e.target.value)}
                    className={validationErrors.name ? 'border-red-500 pl-8' : 'pl-8'}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-red-500 text-sm">{validationErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Customer Type"
                  content="The type of customer determines pricing tiers and available payment options."
                />
                <Select
                  value={formData.type || 'individual'}
                  onValueChange={(value) => handleFieldUpdate('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Email Address"
                  content="Primary contact email for the customer. Used for receipts and communication."
                />
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    className={validationErrors.email ? 'border-red-500 pl-8' : 'pl-8'}
                    value={formData.email || ''}
                    onChange={(e) => handleFieldUpdate('email', e.target.value)}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm">{validationErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Phone Number"
                  content="Primary contact phone number for the customer."
                />
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className={validationErrors.phone ? 'border-red-500 pl-8' : 'pl-8'}
                    value={formData.phone || ''}
                    onChange={(e) => handleFieldUpdate('phone', e.target.value)}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm">{validationErrors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Enter the customer's address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FieldHelpTooltip
                label="Street Address"
                content="The customer's street address including apartment or unit number."
              />
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="123 Main St, Apt 4B"
                  className="pl-8"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleFieldUpdate('address', { 
                    ...formData.address || {}, 
                    street: e.target.value 
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="City"
                  content="The city where the customer is located."
                />
                <Input
                  placeholder="New York"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleFieldUpdate('address', { 
                    ...formData.address || {}, 
                    city: e.target.value 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="State/Province"
                  content="The state or province where the customer is located."
                />
                <Input
                  placeholder="NY"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleFieldUpdate('address', { 
                    ...formData.address || {}, 
                    state: e.target.value 
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Postal/ZIP Code"
                  content="The postal or ZIP code for the customer's address."
                />
                <Input
                  placeholder="10001"
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handleFieldUpdate('address', { 
                    ...formData.address || {}, 
                    postalCode: e.target.value 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Country"
                  content="The country where the customer is located."
                />
                <Input
                  placeholder="United States"
                  value={formData.address?.country || ''}
                  onChange={(e) => handleFieldUpdate('address', { 
                    ...formData.address || {}, 
                    country: e.target.value 
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Enter optional details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Customer Group"
                  content="Assign the customer to a group for special pricing or promotions."
                />
                <div className="relative">
                  <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.group || ''}
                    onValueChange={(value) => handleFieldUpdate('group', value)}
                  >
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Select customer group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Tax Exempt"
                  content="Mark the customer as tax exempt if they have provided valid documentation."
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.taxExempt || false}
                    onCheckedChange={(checked) => handleFieldUpdate('taxExempt', checked)}
                  />
                  <Label>Tax Exempt</Label>
                </div>
              </div>
            </div>
            
            {formData.type === 'business' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldHelpTooltip
                    label="Company Name"
                    content="The legal name of the customer's business."
                  />
                  <div className="relative">
                    <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Acme Corporation"
                      className="pl-8"
                      value={formData.companyName || ''}
                      onChange={(e) => handleFieldUpdate('companyName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <FieldHelpTooltip
                    label="Tax ID"
                    content="The business tax identification number."
                  />
                  <Input
                    placeholder="XX-XXXXXXX"
                    value={formData.taxId || ''}
                    onChange={(e) => handleFieldUpdate('taxId', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <FieldHelpTooltip
                label="Notes"
                content="Additional information about the customer that may be helpful for staff."
              />
              <Textarea
                placeholder="Add any notes about this customer..."
                value={formData.notes || ''}
                onChange={(e) => handleFieldUpdate('notes', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <OperationButton
            onClick={handleSubmit}
            successMessage="Customer saved successfully"
            errorMessage="Failed to save customer"
            disabled={Object.values(validationErrors).some(error => error !== '')}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Customer
          </OperationButton>
        </div>
      </div>
    </div>
  );
} 