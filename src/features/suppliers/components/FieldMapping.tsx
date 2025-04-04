import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, ArrowLeftRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FieldMappingProps {
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  isLoading: boolean;
}

// Standard supplier fields that should be mapped
const SUPPLIER_FIELDS = [
  { id: 'id', label: 'ID', description: 'Unique identifier' },
  { id: 'name', label: 'Name', description: 'Supplier name' },
  { id: 'type', label: 'Type', description: 'Supplier type' },
  { id: 'email', label: 'Email', description: 'Contact email' },
  { id: 'phone', label: 'Phone', description: 'Contact phone number' },
  { id: 'address', label: 'Address', description: 'Physical address' },
  { id: 'website', label: 'Website', description: 'Website URL' },
  { id: 'taxId', label: 'Tax ID', description: 'Tax identification number' },
  { id: 'paymentTerms', label: 'Payment Terms', description: 'Payment terms' },
  { id: 'creditLimit', label: 'Credit Limit', description: 'Credit limit amount' },
  { id: 'contactPerson', label: 'Contact Person', description: 'Primary contact name' },
  { id: 'status', label: 'Status', description: 'Active/inactive status' },
  { id: 'yearEstablished', label: 'Year Established', description: 'Year founded' },
];

// Common external field name patterns for suggestions
const COMMON_EXTERNAL_FIELDS = [
  'supplier_id', 'vendor_id', 'id', 'external_id',
  'company_name', 'supplier_name', 'vendor_name', 'business_name', 'name',
  'supplier_type', 'vendor_type', 'category', 'type',
  'email', 'contact_email', 'email_address',
  'phone', 'contact_phone', 'phone_number', 'telephone',
  'address', 'business_address', 'location', 'street_address',
  'website', 'website_url', 'web_address', 'url',
  'tax_id', 'tax_number', 'vat_number', 'ein',
  'payment_terms', 'terms', 'payment_conditions',
  'credit_limit', 'max_credit', 'credit_amount',
  'contact_name', 'primary_contact', 'main_contact', 'contact_person',
  'status', 'supplier_status', 'vendor_status', 'account_status',
  'year_established', 'founded', 'start_year', 'established',
];

export function FieldMapping({ mapping, onChange, isLoading }: FieldMappingProps) {
  const [newMapping, setNewMapping] = useState({ localField: '', externalField: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMapping = () => {
    if (newMapping.localField && newMapping.externalField) {
      const updatedMapping = {
        ...mapping,
        [newMapping.localField]: newMapping.externalField,
      };
      onChange(updatedMapping);
      setNewMapping({ localField: '', externalField: '' });
      setDialogOpen(false);
    }
  };

  const handleRemoveMapping = (field: string) => {
    const updatedMapping = { ...mapping };
    delete updatedMapping[field];
    onChange(updatedMapping);
  };

  const handleUpdateMapping = (localField: string, externalField: string) => {
    const updatedMapping = {
      ...mapping,
      [localField]: externalField,
    };
    onChange(updatedMapping);
  };

  // Get field suggestion based on local field name
  const getSuggestionForField = (localField: string): string => {
    const fieldMap: Record<string, string> = {
      'id': 'supplier_id',
      'name': 'company_name',
      'type': 'supplier_type',
      'email': 'contact_email',
      'phone': 'contact_phone',
      'address': 'business_address',
      'website': 'website_url',
      'taxId': 'tax_id',
      'paymentTerms': 'payment_terms',
      'creditLimit': 'credit_limit',
      'contactPerson': 'contact_name',
      'status': 'supplier_status',
      'yearEstablished': 'year_established',
    };
    
    return fieldMap[localField] || localField;
  };

  const getMappingStatus = () => {
    const mappedFields = Object.keys(mapping).length;
    const totalFields = SUPPLIER_FIELDS.length;
    const percentage = Math.round((mappedFields / totalFields) * 100);
    
    if (percentage === 0) return 'Not started';
    if (percentage < 50) return 'In progress';
    if (percentage < 100) return 'Almost complete';
    return 'Complete';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Map your system's fields to the supplier's fields to ensure data syncs correctly.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm">{getMappingStatus()}</span>
            <span className="text-sm text-muted-foreground">
              ({Object.keys(mapping).length} of {SUPPLIER_FIELDS.length} fields mapped)
            </span>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={isLoading}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Field Mapping</DialogTitle>
              <DialogDescription>
                Map a field from your system to the corresponding field in the supplier's system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="localField" className="text-right">
                  Your Field
                </Label>
                <Select
                  value={newMapping.localField}
                  onValueChange={(value) => setNewMapping({
                    ...newMapping,
                    localField: value,
                    externalField: getSuggestionForField(value)
                  })}
                >
                  <SelectTrigger id="localField" className="col-span-3">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIER_FIELDS
                      .filter(field => !Object.keys(mapping).includes(field.id))
                      .map(field => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="externalField" className="text-right">
                  Supplier Field
                </Label>
                <div className="col-span-3">
                  <Input
                    id="externalField"
                    value={newMapping.externalField}
                    onChange={(e) => setNewMapping({
                      ...newMapping,
                      externalField: e.target.value
                    })}
                    placeholder="e.g. company_name"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleAddMapping}
                disabled={!newMapping.localField || !newMapping.externalField}
              >
                Add Mapping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Your Field</TableHead>
              <TableHead className="text-center">Mapping</TableHead>
              <TableHead>Supplier Field</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(mapping).length > 0 ? (
              Object.entries(mapping).map(([localField, externalField]) => {
                const fieldDef = SUPPLIER_FIELDS.find(f => f.id === localField);
                
                return (
                  <TableRow key={localField}>
                    <TableCell className="font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{fieldDef?.label || localField}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{fieldDef?.description || 'Custom field'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowLeftRight className="h-4 w-4 mx-auto text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={externalField}
                        onChange={(e) => handleUpdateMapping(localField, e.target.value)}
                        className="h-8"
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMapping(localField)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No fields mapped yet. Add your first field mapping.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {SUPPLIER_FIELDS.length - Object.keys(mapping).length > 0 && (
        <div className="bg-muted p-4 rounded-md">
          <h4 className="text-sm font-medium mb-2">Suggested Mappings</h4>
          <p className="text-sm text-muted-foreground mb-4">
            These fields are commonly mapped but haven't been configured yet:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {SUPPLIER_FIELDS
              .filter(field => !Object.keys(mapping).includes(field.id))
              .slice(0, 6)
              .map(field => (
                <Button
                  key={field.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setNewMapping({
                      localField: field.id,
                      externalField: getSuggestionForField(field.id)
                    });
                    setDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-3 w-3 mr-2" />
                  {field.label}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 