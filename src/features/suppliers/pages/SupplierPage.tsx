import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Package, 
  FileText,
  ShoppingCart,
  History,
  Edit,
  Star,
  User,
  Calendar,
  DollarSign,
  Clock,
  BarChart as BarChartIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Share2,
  FileBarChart,
  Eye,
  Plus
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  SupplierTable, 
  SupplierTableHeader, 
  SupplierTableBody, 
  SupplierTableRow, 
  SupplierTableHead, 
  SupplierTableCell,
  SupplierTableFooter 
} from "@/components/ui/table/SupplierTable"
import { SupplierModal } from '../components/SupplierModal'
import { BankingDetailsModal } from '../components/BankingDetailsModal'
import { Supplier, SUPPLIER_STATUS, SupplierType, CommissionType } from '../types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CommissionModal } from '../components/CommissionModal'
import { CreateOrderModal } from '../components/CreateOrderModal'
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from an API
const suppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Luxury Leather Co.",
    type: SupplierType.MANUFACTURER,
    contactPerson: "John Smith",
    email: "john@luxuryleather.com",
    phone: "+1 234-567-8901",
    products: 45,
    rating: 4.5,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-20",
    address: "123 Leather Lane, Suite 405, Milan, Italy 20121",
    notes: "Premium leather goods manufacturer specializing in high-end wallets and bags. Known for exceptional craftsmanship.",
    website: "www.luxuryleather.com",
    yearEstablished: 1995,
    paymentTerms: "Net 30",
    creditLimit: 100000,
    taxId: "12-3456789",
    orderHistory: [
      { id: "ORD-2345", date: "2024-02-20", amount: 25000, status: "Delivered" },
      { id: "ORD-2190", date: "2024-01-15", amount: 18750, status: "Delivered" },
      { id: "ORD-1987", date: "2023-12-05", amount: 32000, status: "Delivered" }
    ],
    topProducts: [
      { id: "PRD-001", name: "Premium Leather Wallet", sku: "LLW-001", price: 120, stock: 50 },
      { id: "PRD-002", name: "Designer Clutch Bag", sku: "LLB-002", price: 450, stock: 25 },
      { id: "PRD-003", name: "Business Card Holder", sku: "LLH-003", price: 80, stock: 100 }
    ],
    performance: {
      onTimeDelivery: 98,
      qualityRating: 4.9,
      responseTime: 12, // hours
      returnRate: 0.5, // percentage
      priceCompetitiveness: 4.5
    },
    commission: {
      type: CommissionType.PERFORMANCE_BASED,
      rate: 5,
      performanceMetrics: {
        qualityThreshold: 95,
        deliveryTimeThreshold: 14,
        baseRate: 5,
        bonusRate: 2
      },
      notes: "Additional 2% bonus for meeting quality and delivery thresholds"
    }
  },
  {
    id: "SUP-002",
    name: "Global Bags Distribution",
    type: SupplierType.DISTRIBUTOR,
    contactPerson: "Sarah Johnson",
    email: "sarah@globalbags.com",
    phone: "+1 234-567-8902",
    products: 120,
    rating: 4.8,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-19",
    address: "456 Distribution Way, Hong Kong",
    notes: "Major distributor of bags and accessories across Asia. Excellent logistics network and competitive pricing.",
    website: "www.globalbags.com",
    yearEstablished: 2005,
    paymentTerms: "Net 45",
    creditLimit: 200000,
    taxId: "23-4567890",
    performance: {
      onTimeDelivery: 96,
      qualityRating: 4.7,
      responseTime: 24,
      returnRate: 1.2,
      priceCompetitiveness: 4.8
    },
    commission: {
      type: CommissionType.TIERED,
      rate: 3,
      tiers: [
        { minAmount: 0, maxAmount: 50000, rate: 3 },
        { minAmount: 50001, maxAmount: 100000, rate: 4 },
        { minAmount: 100001, maxAmount: 999999999, rate: 5 }
      ],
      notes: "Tiered commission structure based on monthly order volume"
    }
  },
  {
    id: "SUP-003",
    name: "Fashion Bags Ltd",
    type: SupplierType.RETAILER,
    contactPerson: "Mike Wilson",
    email: "mike@fashionbags.com",
    phone: "+1 234-567-8903",
    products: 75,
    rating: 4.2,
    status: SUPPLIER_STATUS.INACTIVE,
    lastOrder: "2024-02-18",
    address: "789 Fashion Street, Paris, France 75001",
    notes: "Boutique supplier specializing in designer bags and accessories. Currently undergoing rebranding.",
    website: "www.fashionbags.com",
    yearEstablished: 2015,
    paymentTerms: "Net 15",
    creditLimit: 50000,
    taxId: "34-5678901",
    performance: {
      onTimeDelivery: 89,
      qualityRating: 4.3,
      responseTime: 36,
      returnRate: 2.5,
      priceCompetitiveness: 3.9
    },
    commission: {
      type: CommissionType.FIXED,
      rate: 1000,
      notes: "Fixed monthly commission regardless of order volume"
    }
  },
  {
    id: "SUP-004",
    name: "Eco Bags Direct",
    type: SupplierType.MANUFACTURER,
    contactPerson: "Lisa Brown",
    email: "lisa@ecobags.com",
    phone: "+1 234-567-8904",
    products: 60,
    rating: 4.6,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-17",
    address: "101 Green Avenue, Portland, OR 97201",
    notes: "Sustainable bag manufacturer using eco-friendly materials. Specializes in vegan leather alternatives.",
    website: "www.ecobagsdirect.com",
    yearEstablished: 2012,
    paymentTerms: "Net 30",
    creditLimit: 75000,
    taxId: "45-6789012",
    performance: {
      onTimeDelivery: 94,
      qualityRating: 4.5,
      responseTime: 18,
      returnRate: 1.8,
      priceCompetitiveness: 4.2
    },
    commission: {
      type: CommissionType.PERCENTAGE,
      rate: 4.5,
      notes: "Standard percentage commission on all orders"
    }
  },
  {
    id: "SUP-005",
    name: "Premium Wallet Co",
    type: SupplierType.MANUFACTURER,
    contactPerson: "David Lee",
    email: "david@premiumwallet.com",
    phone: "+1 234-567-8905",
    products: 35,
    rating: 4.9,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-16",
    address: "202 Craft Street, Florence, Italy 50123",
    notes: "Artisanal wallet manufacturer known for premium craftsmanship and custom designs.",
    website: "www.premiumwallet.com",
    yearEstablished: 1988,
    paymentTerms: "Net 30",
    creditLimit: 150000,
    taxId: "56-7890123",
    performance: {
      onTimeDelivery: 99,
      qualityRating: 4.9,
      responseTime: 16,
      returnRate: 0.3,
      priceCompetitiveness: 4.0
    },
    commission: {
      type: CommissionType.PERFORMANCE_BASED,
      rate: 4,
      performanceMetrics: {
        qualityThreshold: 98,
        deliveryTimeThreshold: 10,
        baseRate: 4,
        bonusRate: 3
      },
      notes: "Higher bonus rate for premium quality supplier"
    }
  }
]

// Update mock products to match the bag/wallet theme
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Premium Leather Bifold Wallet',
    sku: 'WLT-2024-PRO',
    price: 89.99,
    stock: 45,
    category: 'Wallets',
    lastOrdered: '2024-02-15'
  },
  {
    id: 'prod-2',
    name: 'Designer Tote Bag',
    sku: 'BAG-101-TOT',
    price: 299.99,
    stock: 20,
    category: 'Bags',
    lastOrdered: '2024-02-22'
  },
  {
    id: 'prod-3',
    name: 'Business Card Holder',
    sku: 'WLT-404-CRD',
    price: 49.99,
    stock: 75,
    category: 'Wallets',
    lastOrdered: '2024-02-05'
  },
  {
    id: 'prod-4',
    name: 'Luxury Clutch Bag',
    sku: 'BAG-61-CLT',
    price: 199.99,
    stock: 15,
    category: 'Bags',
    lastOrdered: '2024-02-10'
  },
  {
    id: 'prod-5',
    name: 'Travel Wallet Passport Holder',
    sku: 'WLT-200-TVL',
    price: 79.99,
    stock: 30,
    category: 'Wallets',
    lastOrdered: '2024-02-18'
  }
]

// Mock data for supplier orders
const mockOrders = [
  {
    id: 'ORD-2025-001',
    orderNumber: 'PO-2025-001',
    date: new Date(2025, 1, 20),
    status: 'Delivered',
    total: 1250.75,
    items: 12,
    paymentStatus: 'Paid',
    expectedDelivery: new Date(2025, 1, 25)
  },
  {
    id: 'ORD-2025-002',
    orderNumber: 'PO-2025-002',
    date: new Date(2025, 1, 15),
    status: 'Processing',
    total: 876.50,
    items: 8,
    paymentStatus: 'Pending',
    expectedDelivery: new Date(2025, 1, 28)
  },
  {
    id: 'ORD-2025-003',
    orderNumber: 'PO-2025-003',
    date: new Date(2025, 1, 5),
    status: 'Delivered',
    total: 2340.25,
    items: 15,
    paymentStatus: 'Paid',
    expectedDelivery: new Date(2025, 1, 12)
  }
]

// Mock data for supplier documents
const mockDocuments = [
  {
    id: 'doc-1',
    name: 'Supplier Agreement Contract',
    type: 'Contract',
    uploadDate: new Date(2024, 11, 15),
    size: '1.2 MB',
    uploadedBy: 'John Doe'
  },
  {
    id: 'doc-2',
    name: 'Product Catalog 2025',
    type: 'Catalog',
    uploadDate: new Date(2025, 0, 5),
    size: '4.5 MB',
    uploadedBy: 'Jane Smith'
  },
  {
    id: 'doc-3',
    name: 'Invoice #INV-2025-001',
    type: 'Invoice',
    uploadDate: new Date(2025, 1, 20),
    size: '0.8 MB',
    uploadedBy: 'John Doe'
  },
  {
    id: 'doc-4',
    name: 'Quality Assurance Certificate',
    type: 'Certificate',
    uploadDate: new Date(2025, 0, 12),
    size: '1.0 MB',
    uploadedBy: 'Jane Smith'
  }
]

// Mock data for activity history
const mockActivityHistory = [
  {
    id: 'act-1',
    action: 'Order Placed',
    description: 'New purchase order PO-2025-001 created',
    date: new Date(2025, 1, 20),
    user: 'John Doe'
  },
  {
    id: 'act-2',
    action: 'Payment Sent',
    description: 'Payment of $1,250.75 sent for order PO-2025-001',
    date: new Date(2025, 1, 21),
    user: 'Jane Smith'
  },
  {
    id: 'act-3',
    action: 'Order Received',
    description: 'Order PO-2025-001 marked as delivered',
    date: new Date(2025, 1, 25),
    user: 'John Doe'
  },
  {
    id: 'act-4',
    action: 'Document Uploaded',
    description: 'New invoice document uploaded',
    date: new Date(2025, 1, 20),
    user: 'John Doe'
  },
  {
    id: 'act-5',
    action: 'Product Added',
    description: 'New product "Professional Headphones" added to catalog',
    date: new Date(2025, 1, 18),
    user: 'Jane Smith'
  }
]

const mockRecentOrders = [
  {
    id: 'ORD-2025-001',
    date: new Date(2025, 1, 20),
    amount: 1250.75,
    status: 'completed',
    items: 12
  },
  {
    id: 'ORD-2025-002',
    date: new Date(2025, 1, 15),
    amount: 876.50,
    status: 'processing',
    items: 8
  },
  {
    id: 'ORD-2025-003',
    date: new Date(2025, 1, 5),
    amount: 2340.25,
    status: 'completed',
    items: 15
  }
]

const mockBankingDetails = {
  accountName: 'ABC Supplies Ltd.',
  accountNumber: '1234567890',
  bankName: 'First National Bank',
  branchCode: '250655',
  swiftCode: 'FNBZAJJ',
  iban: 'ZA6094142526',
  bankAddress: '123 Finance Street, Johannesburg, 2000'
}

// Add custom colors for charts
const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f8fafc'
}

export function SupplierPage() {
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [bankingModalOpen, setBankingModalOpen] = useState(false)
  const [bankingDetails, setBankingDetails] = useState(mockBankingDetails)
  const [recentOrders, setRecentOrders] = useState(mockRecentOrders)
  const [documents, setDocuments] = useState(mockDocuments)
  const [activityHistory, setActivityHistory] = useState(mockActivityHistory)
  const [products, setProducts] = useState(mockProducts)
  const [orders, setOrders] = useState(mockOrders)
  const [commissionModalOpen, setCommissionModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  useEffect(() => {
    const loadSupplierData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // If no ID is provided, use the first supplier as default
        const supplierId = id || "SUP-001"
        const foundSupplier = suppliers.find(s => s.id === supplierId)
        
    if (foundSupplier) {
      setSupplier(foundSupplier)
      if (foundSupplier.bankingDetails) {
        setBankingDetails(foundSupplier.bankingDetails)
      }
          // Set mock orders for this supplier
          if (foundSupplier.orderHistory) {
            setOrders(foundSupplier.orderHistory.map(order => ({
              id: order.id,
              orderNumber: order.id,
              date: new Date(order.date),
              status: order.status,
              total: order.amount,
              items: Math.floor(Math.random() * 10) + 5,
              paymentStatus: order.status === 'Delivered' ? 'Paid' : 'Pending',
              expectedDelivery: new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000)
            })))
          }
          // Set mock products for this supplier
          if (foundSupplier.topProducts) {
            setProducts(foundSupplier.topProducts.map(product => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price,
              stock: product.stock,
              category: product.name.includes('Wallet') ? 'Wallets' : 'Bags',
              lastOrdered: new Date().toISOString().split('T')[0]
            })))
          }
        } else {
          setError('Supplier not found')
        }
      } catch (err) {
        setError('Failed to load supplier information')
        console.error('Error loading supplier:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSupplierData()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading supplier information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{error}</h2>
          <p className="text-muted-foreground mt-1">Please check the supplier ID and try again</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return null
  }

  const handleGoBack = () => {
    navigate('/suppliers')
  }

  const handleEditSupplier = () => {
    setModalOpen(true)
  }

  const handleAddBankingDetails = () => {
    setBankingModalOpen(true)
  }

  const handleSaveBankingDetails = (details: any) => {
    if (supplier) {
      const updatedSupplier = {
        ...supplier,
        bankingDetails: details
      }
      setSupplier(updatedSupplier)
      setBankingModalOpen(false)
    }
  }

  const handleSaveCommission = (commission: Commission) => {
    if (supplier) {
      const updatedSupplier = {
        ...supplier,
        commission
      }
      setSupplier(updatedSupplier)
    }
  }

  const handleCreateOrder = (data: any) => {
    console.log('Creating order:', data)
    // Add your order creation logic here
    setOrderModalOpen(false)
    toast({
      title: "Success",
      description: "Order created successfully"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <Badge variant={supplier.status === SUPPLIER_STATUS.ACTIVE ? "default" : "secondary"}>
            {supplier.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditSupplier}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Supplier
          </Button>
          <Button onClick={() => setOrderModalOpen(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {/* Performance Overview Card */}
              <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={supplier.rating >= 4.5 ? "default" : "secondary"}>
                      <Star className="h-3 w-3 mr-1" />
                      {supplier.rating.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Delivery & Quality Chart */}
                  <div className="col-span-2 h-[200px]">
                    <p className="text-sm font-medium mb-2">Delivery & Quality Metrics</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'On-Time Delivery',
                            value: supplier.performance?.onTimeDelivery || 0,
                            target: 95
                          },
                          {
                            name: 'Quality Rating',
                            value: (supplier.performance?.qualityRating || 0) * 20, // Convert to percentage
                            target: 90
                          }
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Performance']}
                          labelStyle={{ color: '#64748b' }}
                        />
                        <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]}>
                          {/* Add conditional coloring based on performance */}
                          {[0, 1].map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 
                                ? (supplier.performance?.onTimeDelivery || 0) >= 95 
                                  ? CHART_COLORS.success 
                                  : CHART_COLORS.warning
                                : (supplier.performance?.qualityRating || 0) >= 4.5
                                  ? CHART_COLORS.success
                                  : CHART_COLORS.warning
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    </div>

                  {/* Response Time Chart */}
                  <div className="h-[200px]">
                    <p className="text-sm font-medium mb-2">Response Time (Hours)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="60%"
                        outerRadius="100%"
                        data={[{
                          name: 'Response Time',
                          value: Math.max(0, 100 - ((supplier.performance?.responseTime || 24) / 24 * 100))
                        }]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          fill={CHART_COLORS.primary}
                          cornerRadius={30}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg font-semibold"
                          fill={CHART_COLORS.secondary}
                        >
                          {supplier.performance?.responseTime}h
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Return Rate & Price Competitiveness Chart */}
                  <div className="h-[200px]">
                    <p className="text-sm font-medium mb-2">Return Rate & Price Rating</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Return Rate',
                              value: supplier.performance?.returnRate || 0,
                              fill: CHART_COLORS.error
                            },
                            {
                              name: 'Success Rate',
                              value: 100 - (supplier.performance?.returnRate || 0),
                              fill: CHART_COLORS.success
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm font-medium"
                        >
                          {supplier.performance?.priceCompetitiveness.toFixed(1)}/5
                        </text>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    </div>
                  </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-sm text-muted-foreground">Quality Score</p>
                    <p className="text-lg font-semibold text-primary">
                      {supplier.performance?.qualityRating.toFixed(1)}/5
                    </p>
                    </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-lg font-semibold text-primary">
                      {supplier.performance?.responseTime}h
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-sm text-muted-foreground">Return Rate</p>
                    <p className="text-lg font-semibold text-primary">
                      {supplier.performance?.returnRate}%
                    </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Commission Information Card */}
              <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Commission Settings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setCommissionModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {supplier.commission ? 'Edit Commission' : 'Add Commission'}
                </Button>
                </CardHeader>
              <CardContent>
                {supplier.commission ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Commission Type</p>
                        <Badge variant="outline" className="capitalize">
                          {supplier.commission.type.replace('_', ' ')}
                        </Badge>
                    </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Base Rate</p>
                        <p className="font-medium">
                          {supplier.commission.type === 'fixed' 
                            ? `$${supplier.commission.rate.toLocaleString()}`
                            : `${supplier.commission.rate}%`
                          }
                        </p>
                  </div>
                    </div>

                    {supplier.commission.type === 'tiered' && supplier.commission.tiers && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Commission Tiers</p>
                        <div className="space-y-2">
                          {supplier.commission.tiers.map((tier, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                              <span>
                                ${tier.minAmount.toLocaleString()} - ${tier.maxAmount.toLocaleString()}
                              </span>
                              <Badge variant="secondary">{tier.rate}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {supplier.commission.type === 'performance_based' && supplier.commission.performanceMetrics && (
                      <div className="space-y-4">
                        <p className="text-sm font-medium">Performance Metrics</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                            <p className="text-muted-foreground">Quality Threshold</p>
                            <p className="font-medium">{supplier.commission.performanceMetrics.qualityThreshold}%</p>
                    </div>
                          <div>
                            <p className="text-muted-foreground">Delivery Time Threshold</p>
                            <p className="font-medium">{supplier.commission.performanceMetrics.deliveryTimeThreshold} days</p>
                  </div>
                    <div>
                            <p className="text-muted-foreground">Base Rate</p>
                            <p className="font-medium">{supplier.commission.performanceMetrics.baseRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bonus Rate</p>
                            <p className="font-medium">{supplier.commission.performanceMetrics.bonusRate}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {supplier.commission.notes && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{supplier.commission.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No commission settings configured</p>
                    <Button variant="outline" size="sm" onClick={() => setCommissionModalOpen(true)}>
                      Configure Commission
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-2 text-primary" />
                      {supplier.type}
                    </p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium flex items-center">
                      <Package className="h-4 w-4 mr-2 text-primary" />
                      {supplier.products} items
                    </p>
                    </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Established</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      {supplier.yearEstablished || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Credit Limit</p>
                    <p className="font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      ${supplier.creditLimit?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      {supplier.paymentTerms || 'N/A'}
                    </p>
                    </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {supplier.taxId || 'N/A'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{supplier.notes}</p>
                  </div>
                </CardContent>
              </Card>

            {/* Contact Information */}
              <Card>
                <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.contactPerson}</p>
                    <p className="text-sm text-muted-foreground">Primary Contact</p>
                    </div>
                  </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.phone}</p>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    </div>
                  </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.address || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Address</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Banking Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Banking Information</CardTitle>
                  {supplier.bankingDetails ? (
                    <Button variant="outline" size="sm" onClick={handleAddBankingDetails}>
                      Edit Banking Details
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {supplier.bankingDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="font-medium">{supplier.bankingDetails.accountName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{supplier.bankingDetails.accountNumber}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{supplier.bankingDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Branch Code</p>
                          <p className="font-medium">{supplier.bankingDetails.branchCode || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">SWIFT Code</p>
                          <p className="font-medium">{supplier.bankingDetails.swiftCode || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">IBAN</p>
                          <p className="font-medium">{supplier.bankingDetails.iban || 'N/A'}</p>
                        </div>
                      </div>
                      {supplier.bankingDetails.bankAddress && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Address</p>
                          <p className="font-medium">{supplier.bankingDetails.bankAddress}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No banking information available</p>
                      <Button variant="outline" size="sm" onClick={handleAddBankingDetails}>
                        Add Banking Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Orders History</CardTitle>
              <CardDescription>View all orders placed with this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  <SupplierTable data={orders} pageSize={5} pagination={true}>
                    <SupplierTableHeader>
                      <SupplierTableRow>
                        <SupplierTableHead>Order #</SupplierTableHead>
                        <SupplierTableHead>Date</SupplierTableHead>
                        <SupplierTableHead>Items</SupplierTableHead>
                        <SupplierTableHead className="text-right">Total</SupplierTableHead>
                        <SupplierTableHead>Status</SupplierTableHead>
                        <SupplierTableHead className="text-right">Actions</SupplierTableHead>
                      </SupplierTableRow>
                    </SupplierTableHeader>
                    <SupplierTableBody>
                      {orders.map((order) => (
                        <SupplierTableRow key={order.id}>
                          <SupplierTableCell className="font-medium">{order.orderNumber}</SupplierTableCell>
                          <SupplierTableCell>{order.date.toLocaleDateString()}</SupplierTableCell>
                          <SupplierTableCell>{order.items}</SupplierTableCell>
                          <SupplierTableCell className="text-right">${order.total.toFixed(2)}</SupplierTableCell>
                          <SupplierTableCell>
                            <Badge 
                              variant={order.status === 'Delivered' ? "default" : 
                                     order.status === 'Processing' ? "secondary" : 
                                     "destructive"}
                            >
                              {order.status}
                            </Badge>
                          </SupplierTableCell>
                          <SupplierTableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SupplierTableCell>
                        </SupplierTableRow>
                      ))}
                    </SupplierTableBody>
                  </SupplierTable>
                  <SupplierTableFooter>
                    <Button onClick={() => setOrderModalOpen(true)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Create New Order
                    </Button>
                  </SupplierTableFooter>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No orders found</p>
                  <Button onClick={() => setOrderModalOpen(true)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create New Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Products supplied by this vendor</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-4">
                  <SupplierTable data={products} pageSize={5} pagination={true}>
                    <SupplierTableHeader>
                      <SupplierTableRow>
                        <SupplierTableHead>Product Name</SupplierTableHead>
                        <SupplierTableHead>SKU</SupplierTableHead>
                        <SupplierTableHead>Category</SupplierTableHead>
                        <SupplierTableHead className="text-right">Price</SupplierTableHead>
                        <SupplierTableHead className="text-right">Stock</SupplierTableHead>
                        <SupplierTableHead>Last Ordered</SupplierTableHead>
                      </SupplierTableRow>
                    </SupplierTableHeader>
                    <SupplierTableBody>
                      {products.map((product) => (
                        <SupplierTableRow key={product.id}>
                          <SupplierTableCell className="font-medium">{product.name}</SupplierTableCell>
                          <SupplierTableCell>{product.sku}</SupplierTableCell>
                          <SupplierTableCell>{product.category}</SupplierTableCell>
                          <SupplierTableCell className="text-right">${product.price.toFixed(2)}</SupplierTableCell>
                          <SupplierTableCell className="text-right">{product.stock}</SupplierTableCell>
                          <SupplierTableCell>{product.lastOrdered}</SupplierTableCell>
                        </SupplierTableRow>
                      ))}
                    </SupplierTableBody>
                  </SupplierTable>
                  <SupplierTableFooter>
                    <Button>
                      <Package className="mr-2 h-4 w-4" />
                      Add Products
                    </Button>
                  </SupplierTableFooter>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button>
                    <Package className="mr-2 h-4 w-4" />
                    Add Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card className="mt-6">
            {supplier.commission ? (
              <>
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Commission Settings</CardTitle>
                      <CardDescription>Manage supplier commission structure and rates</CardDescription>
                    </div>
                    <Button onClick={() => setCommissionModalOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Commission
                    </Button>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-8">
                    {/* Commission Overview */}
                    <div className="grid grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Commission Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Badge variant="outline" className="capitalize">
                              {supplier.commission.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Base Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {supplier.commission.type === CommissionType.FIXED 
                              ? `$${supplier.commission.rate.toLocaleString()}`
                              : `${supplier.commission.rate}%`
                            }
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="default">Active</Badge>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tiered Commission Structure */}
                    {supplier.commission.type === CommissionType.TIERED && supplier.commission.tiers && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Commission Tiers</h3>
                        <div className="grid gap-4">
                          {supplier.commission.tiers.map((tier, index) => (
                            <div key={index} className="bg-muted rounded-lg p-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Min Amount</p>
                                  <p className="font-medium">${tier.minAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Max Amount</p>
                                  <p className="font-medium">${tier.maxAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                                  <Badge variant="secondary">{tier.rate}%</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {supplier.commission.type === CommissionType.PERFORMANCE_BASED && supplier.commission.performanceMetrics && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm font-medium">Quality Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Quality Threshold</p>
                                  <p className="font-medium">{supplier.commission.performanceMetrics.qualityThreshold}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Base Rate</p>
                                  <p className="font-medium">{supplier.commission.performanceMetrics.baseRate}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm font-medium">Delivery Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Delivery Time Threshold</p>
                                  <p className="font-medium">{supplier.commission.performanceMetrics.deliveryTimeThreshold} days</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Bonus Rate</p>
                                  <p className="font-medium">{supplier.commission.performanceMetrics.bonusRate}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Commission Notes */}
                    {supplier.commission.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm">{supplier.commission.notes}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center space-y-4 max-w-md">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No Commission Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure commission settings to manage payment structures and incentives for this supplier.
                  </p>
                  <Button onClick={() => setCommissionModalOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Commission Settings
                  </Button>
                </div>
                </div>
              )}
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent activity and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {activityHistory.length > 0 ? (
                <div className="space-y-4">
                  <SupplierTable data={activityHistory} pageSize={5} pagination={true}>
                    <SupplierTableHeader>
                      <SupplierTableRow>
                        <SupplierTableHead>Action</SupplierTableHead>
                        <SupplierTableHead>Description</SupplierTableHead>
                        <SupplierTableHead>Date</SupplierTableHead>
                        <SupplierTableHead>User</SupplierTableHead>
                      </SupplierTableRow>
                    </SupplierTableHeader>
                    <SupplierTableBody>
                      {activityHistory.map((activity) => (
                        <SupplierTableRow key={activity.id}>
                          <SupplierTableCell className="font-medium">{activity.action}</SupplierTableCell>
                          <SupplierTableCell>{activity.description}</SupplierTableCell>
                          <SupplierTableCell>{activity.date.toLocaleDateString()}</SupplierTableCell>
                          <SupplierTableCell>{activity.user}</SupplierTableCell>
                        </SupplierTableRow>
                      ))}
                    </SupplierTableBody>
                  </SupplierTable>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No activity history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Manage supplier related documents</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  <SupplierTable data={documents} pageSize={5} pagination={true}>
                    <SupplierTableHeader>
                      <SupplierTableRow>
                        <SupplierTableHead>Document Name</SupplierTableHead>
                        <SupplierTableHead>Type</SupplierTableHead>
                        <SupplierTableHead>Upload Date</SupplierTableHead>
                        <SupplierTableHead>Size</SupplierTableHead>
                        <SupplierTableHead>Uploaded By</SupplierTableHead>
                        <SupplierTableHead className="text-right">Actions</SupplierTableHead>
                      </SupplierTableRow>
                    </SupplierTableHeader>
                    <SupplierTableBody>
                      {documents.map((doc) => (
                        <SupplierTableRow key={doc.id}>
                          <SupplierTableCell className="font-medium">{doc.name}</SupplierTableCell>
                          <SupplierTableCell>
                            <Badge variant="outline">{doc.type}</Badge>
                          </SupplierTableCell>
                          <SupplierTableCell>{doc.uploadDate.toLocaleDateString()}</SupplierTableCell>
                          <SupplierTableCell>{doc.size}</SupplierTableCell>
                          <SupplierTableCell>{doc.uploadedBy}</SupplierTableCell>
                          <SupplierTableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </SupplierTableCell>
                        </SupplierTableRow>
                      ))}
                    </SupplierTableBody>
                  </SupplierTable>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No documents found</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SupplierModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={supplier}
      />
      <BankingDetailsModal
        open={bankingModalOpen}
        onOpenChange={setBankingModalOpen}
        onSave={handleSaveBankingDetails}
        initialData={supplier?.bankingDetails || bankingDetails}
      />
      <CommissionModal
        open={commissionModalOpen}
        onOpenChange={setCommissionModalOpen}
        initialData={supplier?.commission}
        onSave={handleSaveCommission}
      />
      <CreateOrderModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        supplierId={supplier.id}
        onSubmit={handleCreateOrder}
      />
    </div>
  )
}
