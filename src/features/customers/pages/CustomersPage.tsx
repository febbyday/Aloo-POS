import { useState, useEffect } from 'react'
import { 
  Search,
  RefreshCw,
  UserPlus,
  Download,
  Filter,
  Users,
  Gift,
  UserCog
} from 'lucide-react'
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
import { CustomerGroupsPage } from './CustomerGroupsPage'
import { LoyaltyProgramPage } from './LoyaltyProgramPage'
import { CustomerImportExportDialog } from '../components/CustomerImportExportDialog'
import { exportCustomersToCSV, exportCustomersToExcel, exportCustomersToPDF, validateAndProcessCustomerImport } from '../utils/exportUtils'
import * as XLSX from 'xlsx'
import { generateId } from '@/lib/utils'
import { useCustomers } from '../hooks/useCustomers'
import { apiClient } from '@/lib/api/api-config'
import { LoadingState } from '@/components/ui/loading-state'

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
    createdAt: apiCustomer.created_at || new Date().toISOString(),
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
  const apiCustomer: ExtendedApiCustomer = {
    id: uiCustomer.id,
    first_name: uiCustomer.firstName,
    last_name: uiCustomer.lastName,
    email: uiCustomer.email,
    phone: uiCustomer.phone,
    loyalty_points: uiCustomer.loyaltyPoints,
    membershipLevel: uiCustomer.tier?.toUpperCase(),
    totalSpent: uiCustomer.totalSpent,
    total_purchases: uiCustomer.totalOrders,
    lastOrderDate: uiCustomer.lastPurchase?.toISOString(),
    created_at: uiCustomer.createdAt.toISOString(),
    updated_at: uiCustomer.updatedAt.toISOString(),
    isActive: uiCustomer.isActive,
    status: uiCustomer.status
  };

  if (uiCustomer.address) {
    apiCustomer.address = {
      street: uiCustomer.address.street,
      city: uiCustomer.address.city,
      state: uiCustomer.address.state,
      zip_code: uiCustomer.address.zipCode || '',
      country: uiCustomer.address.country
    };
  }

  return apiCustomer;
}

export function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilter>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()
  
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

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="bg-zinc-900 px-4 py-2 flex items-center gap-2 -mx-4 -mt-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={() => setImportExportDialogOpen(true)}
        >
          <Download className="h-4 w-4" />
        </Button>

        <div className="relative ml-auto">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input 
            type="search"
            placeholder="Search customers..."
            className="w-64 pl-9 bg-zinc-800 border-zinc-700 h-9 focus:border-zinc-600"
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <Button 
          variant="secondary" 
          size="sm"
          className="ml-2"
          onClick={handleNewCustomer}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4 bg-zinc-800 p-1 gap-1">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-zinc-700 rounded px-4 py-2 text-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            All Customers
          </TabsTrigger>
          <TabsTrigger 
            value="groups"
            className="data-[state=active]:bg-zinc-700 rounded px-4 py-2 text-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Groups
          </TabsTrigger>
          <TabsTrigger 
            value="loyalty"
            className="data-[state=active]:bg-zinc-700 rounded px-4 py-2 text-sm"
          >
            <Gift className="h-4 w-4 mr-2" />
            Loyalty Program
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="p-0">
          <div className="grid grid-cols-1 gap-4">
            {/* Filters */}
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Membership Tier</label>
                  <Select 
                    value={filters.tier || "all"}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, tier: value as Customer["tier"] || undefined }))}
                  >
                    <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Status</label>
                  <Select 
                    value={filters.status || "all"}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as Customer["status"] || undefined }))}
                  >
                    <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Customer Table */}
            <CustomersTable 
              filters={filters} 
              customers={uiCustomers}
              onEdit={handleEditCustomer}
              isLoading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="groups" className="p-0">
          <CustomerGroupsPage />
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
          // Convert UI customer to API format
          const apiCustomer = mapUiToApiCustomer(customer);
          
          // If editing an existing customer
          if (customer.id && selectedCustomer?.id) {
            updateCustomer(customer.id, apiCustomer);
          } 
          // If creating a new customer
          else {
            createCustomer(apiCustomer);
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
