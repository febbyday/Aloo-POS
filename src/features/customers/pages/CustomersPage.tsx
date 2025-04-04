import { useState, useEffect } from 'react'
import { 
  Search,
  RefreshCw,
  UserPlus,
  Download,
  Filter,
  Users,
  Gift,
  UserCog,
  Upload,
  Trash2,
  UserX,
  Eye,
  Edit
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CustomersTable from '../components/CustomersTable'
import { CustomerDialog } from '../components/CustomerDialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoyaltyProgramPage } from './LoyaltyProgramPage'
import { CustomerImportExportDialog } from '../components/CustomerImportExportDialog'
import { exportCustomersToCSV, exportCustomersToExcel, exportCustomersToPDF, validateAndProcessCustomerImport } from '../utils/exportUtils'
import * as XLSX from 'xlsx'
import { generateId } from '@/lib/utils'
import { useCustomers } from '../hooks/useCustomers'
import { apiClient } from '@/lib/api/api-config'
import { LoadingState } from '@/components/ui/loading-state'
import { Toolbar } from "@/components/ui/toolbar/toolbar"

import { Customer as BaseCustomer, ApiCustomer } from '../types/customer.types'

export type Customer = BaseCustomer & {
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  totalOrders: number
  isActive: boolean
  lastPurchase?: Date | null
  status: 'active' | 'inactive' | 'blocked'
  phone?: string
}

export type ExtendedApiCustomer = ApiCustomer & {
  id: string;
  membershipLevel?: string
  totalSpent: number
  total_purchases: number
  lastOrderDate?: string | null
  isActive: boolean
  status: 'active' | 'inactive' | 'blocked'
  phone?: string
  first_name: string;
  last_name: string;
  email: string;
  loyalty_points?: number;
}

export type CustomerFilter = {
  search?: string
  tier?: Customer['tier']
  status?: Customer['status']
  minPoints?: number
  maxPoints?: number
}

// Helper function to map API Customer to UI Customer
function mapApiToUiCustomer(apiCustomer: ExtendedApiCustomer): Customer {
  // Convert createdAt string to Date, default to current date if missing or invalid
  let createdAt;
  try {
    createdAt = apiCustomer.created_at ? new Date(apiCustomer.created_at) : new Date();
    // Check if date is valid
    if (isNaN(createdAt.getTime())) {
      createdAt = new Date(); // Use current date as fallback
    }
  } catch (error) {
    console.error('Error parsing createdAt date:', error);
    createdAt = new Date();
  }

  return {
    id: apiCustomer.id || '',
    firstName: apiCustomer.first_name,
    lastName: apiCustomer.last_name,
    email: apiCustomer.email,
    phone: apiCustomer.phone,
    loyaltyPoints: apiCustomer.loyalty_points || 0,
    tier: (apiCustomer.membershipLevel?.toLowerCase() as Customer['tier']) || 'bronze',
    totalSpent: apiCustomer.totalSpent || 0,
    totalOrders: apiCustomer.total_purchases || 0,
    isActive: apiCustomer.isActive ?? true,
    lastPurchase: apiCustomer.lastOrderDate ? new Date(apiCustomer.lastOrderDate) : null,
    status: apiCustomer.status || 'active',
    createdAt: createdAt,
    updatedAt: apiCustomer.updated_at ? new Date(apiCustomer.updated_at) : new Date(),
    address: apiCustomer.address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  };
}

// Helper function to map UI Customer to API format
function mapUiToApiCustomer(uiCustomer: Customer): ExtendedApiCustomer {
  // Helper to safely convert Date to string
  const dateToString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined;
    
    try {
      // If it's already a string, return it
      if (typeof date === 'string') return date;
      
      // Check if date is valid before converting
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      return undefined;
    } catch (error) {
      console.error('Error converting date to string:', error);
      return undefined;
    }
  };

  // Debug logging
  console.log('Converting UI customer to API format:', uiCustomer);

  const apiCustomer: ExtendedApiCustomer = {
    id: uiCustomer.id,
    first_name: uiCustomer.firstName,
    last_name: uiCustomer.lastName,
    email: uiCustomer.email,
    phone: uiCustomer.phone,
    loyalty_points: uiCustomer.loyaltyPoints || 0,
    membershipLevel: uiCustomer.tier?.toUpperCase() || 'BRONZE',
    totalSpent: uiCustomer.totalSpent || 0,
    total_purchases: uiCustomer.totalOrders || 0,
    lastOrderDate: dateToString(uiCustomer.lastPurchase),
    created_at: dateToString(uiCustomer.createdAt) || new Date().toISOString(),
    updated_at: dateToString(uiCustomer.updatedAt) || new Date().toISOString(),
    isActive: uiCustomer.isActive !== undefined ? uiCustomer.isActive : true,
    status: uiCustomer.status || 'active'
  };

  if (uiCustomer.address) {
    apiCustomer.address = {
      street: uiCustomer.address.street || '',
      city: uiCustomer.address.city || '',
      state: uiCustomer.address.state || '',
      zip_code: uiCustomer.address.zipCode || '',
      country: uiCustomer.address.country || ''
    };
  }

  // Debug logging
  console.log('Converted to API customer:', apiCustomer);

  return apiCustomer;
}

export function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilter>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate();
  
  // Use the customers hook for real API data
  const { 
    customers, 
    loading, 
    error, 
    fetchCustomers, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomers({ autoLoad: true });
  
  // Simplified API initialization - just load the data
  useEffect(() => {
    // Initial load of customer data
    fetchCustomers();
    
    // Log any error for debugging
    if (error) {
      console.error('Error loading customers:', error);
    }
  }, [fetchCustomers, error]);

  const handleRefresh = () => {
    fetchCustomers();
    toast({
      title: "Refreshing data...",
      description: "Your customer data is being updated."
    })
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'csv': {
          const csvData = exportCustomersToCSV(customers);
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `customers_export_${format}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        case 'excel': {
          const workbook = exportCustomersToExcel(customers);
          const blob = new Blob([s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `customers_export_${format}.xlsx`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        case 'pdf': {
          const pdfDoc = exportCustomersToPDF(customers);
          const blob = pdfDoc.output('blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `customers_export_${format}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        default:
          toast({
            title: "Export Error",
            description: "Invalid export format selected.",
            variant: "destructive"
          });
          return;
      }
      
      toast({
        title: "Export Successful",
        description: `Customers exported successfully as ${format.toUpperCase()}.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting customers.",
        variant: "destructive"
      });
    }
  };

  // Helper function to convert string to ArrayBuffer
  function s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const handleFileImport = async (file: File) => {
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          // Validate and process the data
          const { validData, errors } = validateAndProcessCustomerImport(jsonData);
          
          if (errors.length > 0) {
            toast({
              title: "Import Errors",
              description: `${errors.length} errors found. Please check your data and try again.`,
              variant: "destructive"
            });
            console.error('Import errors:', errors);
          }
          
          if (validData.length > 0) {
            // Use the API service to create multiple customers
            for (const customerData of validData) {
              // Make sure we're using the API customer format
              const apiCustomer: ApiCustomer = {
                firstName: customerData.firstName || '',
                lastName: customerData.lastName || '',
                email: customerData.email,
                phone: customerData.phone || '',
                membershipLevel: customerData.membershipLevel || 'BRONZE',
                totalSpent: customerData.totalSpent || 0,
                loyaltyPoints: customerData.loyaltyPoints || 0,
                isActive: customerData.isActive !== undefined ? customerData.isActive : true
              };
              
              await createCustomer(apiCustomer);
            }
            
            // Refresh the customers list
            fetchCustomers();
            
            toast({
              title: "Import Successful",
              description: `${validData.length} customers imported successfully.`
            });
          } else {
            toast({
              title: "Import Failed",
              description: "No valid data found in the import file.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Import Failed",
            description: "Error processing the import file.",
            variant: "destructive"
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Import Failed",
          description: "Error reading the import file.",
          variant: "destructive"
        });
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during import.",
        variant: "destructive"
      });
    }
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null)
    setDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleViewSelectedCustomer = () => {
    // Find the first selected customer
    if (selectedCustomers.length > 0) {
      const customerId = selectedCustomers[0];
      const customerToView = uiCustomers.find(c => c.id === customerId);
      if (customerToView) {
        navigate(`/customers/${customerId}`);
      }
    }
  }

  const handleEditSelectedCustomer = () => {
    // Find the first selected customer
    if (selectedCustomers.length > 0) {
      const customerId = selectedCustomers[0];
      const customerToEdit = uiCustomers.find(c => c.id === customerId);
      if (customerToEdit) {
        setSelectedCustomer(customerToEdit);
        setDialogOpen(true);
      }
    }
  }

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery);
    setFilters(prev => ({ ...prev, search: searchQuery }));
    toast({
      title: "Search",
      description: `Searching for "${searchQuery}"`
    });
  }

  const handleFilter = () => {
    // Implement filter functionality
    toast({
      title: "Filter Customers",
      description: "Filter dialog would open here"
    });
  }

  // Map API customers to UI format
  const uiCustomers = customers.map(mapApiToUiCustomer);
  
  // Render loading state
  if (loading && customers.length === 0) {
    return (
      <LoadingState 
        isLoading={true} 
        loadingText="Loading customers..." 
        size="lg" 
        center
      />
    );
  }
  
  // Render error state
  if (error && !loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="text-destructive text-xl">Error loading customers</div>
        <p>{error.message}</p>
        <Button onClick={() => fetchCustomers()}>Try Again</Button>
      </div>
    );
  }

  // Configure toolbar groups for the Toolbar component
  const toolbarGroups = [
    {
      buttons: [
        { 
          icon: RefreshCw, 
          label: "Refresh", 
          onClick: handleRefresh 
        },
        { 
          icon: Filter, 
          label: "Filter", 
          onClick: handleFilter 
        }
      ]
    },
    {
      buttons: [
        { 
          icon: UserPlus, 
          label: "Add Customer", 
          onClick: handleNewCustomer 
        },
        { 
          icon: Eye, 
          label: "View Details", 
          onClick: handleViewSelectedCustomer,
          disabled: selectedCustomers.length !== 1,
          title: selectedCustomers.length === 1 ? 'View customer details' : 'Select a customer to view details'
        },
        { 
          icon: Edit, 
          label: "Edit Customer", 
          onClick: handleEditSelectedCustomer,
          disabled: selectedCustomers.length !== 1,
          title: selectedCustomers.length === 1 ? 'Edit customer' : 'Select a customer to edit'
        },
        { 
          icon: UserX, 
          label: `Delete${selectedCustomers.length > 0 ? ` (${selectedCustomers.length})` : ''}`, 
          onClick: () => {
            toast({
              title: "Delete Selected",
              description: "This would delete selected customers"
            });
          },
          disabled: selectedCustomers.length === 0,
          title: selectedCustomers.length > 0 ? 'Delete selected customers' : 'Select customers to delete'
        }
      ]
    },
    {
      buttons: [
        { 
          icon: Upload, 
          label: "Import", 
          onClick: () => setImportExportDialogOpen(true) 
        },
        { 
          icon: Download, 
          label: "Export", 
          onClick: () => setImportExportDialogOpen(true) 
        }
      ]
    }
  ]

  // Search input for the right side of the toolbar
  const rightContent = (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-[180px] bg-background"
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Toolbar - using the Toolbar component */}
      <Toolbar 
        groups={toolbarGroups}
        rightContent={rightContent}
        variant="default"
        size="default"
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="all" className="p-0">
          <div className="grid grid-cols-1 gap-4">
            {/* Customer Table */}
            <CustomersTable 
              filters={filters} 
              customers={uiCustomers}
              onEdit={handleEditCustomer}
              isLoading={loading}
              onSelectionChange={setSelectedCustomers}
            />
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="p-0">
          <LoyaltyProgramPage />
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <CustomerDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onCustomerAdded={(customer) => {
          console.log('CustomerDialog onCustomerAdded called with:', customer);
          
          // Convert UI customer to API format
          const apiCustomer = mapUiToApiCustomer(customer);
          console.log('Mapped to API format:', apiCustomer);
          
          // If editing an existing customer
          if (customer.id && selectedCustomer?.id) {
            console.log('Updating existing customer');
            updateCustomer(customer.id, apiCustomer)
              .then(result => console.log('Customer update result:', result))
              .catch(err => console.error('Customer update error:', err));
          } 
          // If creating a new customer
          else {
            console.log('Creating new customer');
            createCustomer(apiCustomer)
              .then(result => console.log('Customer creation result:', result))
              .catch(err => console.error('Customer creation error:', err));
          }
        }}
      />

      {/* Import/Export Dialog */}
      <CustomerImportExportDialog
        open={importExportDialogOpen}
        onOpenChange={setImportExportDialogOpen}
        onExport={handleExport}
        onImport={handleFileImport}
      />
    </div>
  )
}
