import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft,
  Printer,
  FileDown,
  PlusCircle,
  CreditCard,
  Mail,
  Ban,
  Edit,
  Calendar,
  Gift,
  History,
  Settings,
  MoreHorizontal,
  DollarSign,
  Clock,
  User,
  Send,
  MessageSquare,
  Download,
  Share2,
  FileText,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useGiftCards } from '../hooks/gift-cards/useGiftCards';
import { GiftCard, GiftCardTransaction } from '../types/gift-cards';
import GiftCardService from '../services/gift-cards/giftCardService';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to format dates
const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
};

// Helper to format relative time (for transaction history)
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Helper to generate status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Active</Badge>;
    case 'used':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0">Used</Badge>;
    case 'expired':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">Expired</Badge>;
    case 'disabled':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">Disabled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper to get transaction type label
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'issue':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Issue</Badge>;
    case 'redeem':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">Redeem</Badge>;
    case 'adjustment':
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-0">Adjustment</Badge>;
    case 'expire':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">Expire</Badge>;
    case 'reactivate':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">Reactivate</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

// Transaction history chart data preparation
const prepareChartData = (transactions: GiftCardTransaction[]) => {
  if (!transactions.length) return [];
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Map transactions to chart data
  return sortedTransactions.map(tx => ({
    date: format(new Date(tx.date), 'MMM d'),
    balance: tx.balanceAfter,
    type: tx.type
  }));
};

export function GiftCardDetailsPage() {
  const navigate = useNavigate();
  const { giftCardId } = useParams();
  const { toast } = useToast();
  const { selectGiftCard } = useGiftCards();
  
  const [loading, setLoading] = useState(true);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<GiftCardTransaction[]>([]);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showAddValueDialog, setShowAddValueDialog] = React.useState(false);
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [showAdjustBalanceDialog, setShowAdjustBalanceDialog] = React.useState(false);
  const [showPdfExportDialog, setShowPdfExportDialog] = React.useState(false);
  const [adjustmentType, setAdjustmentType] = React.useState<'add' | 'subtract'>('add');

  // Load gift card data directly using the service
  useEffect(() => {
    const loadGiftCardData = async () => {
      if (!giftCardId) {
        toast({
          title: 'Error',
          description: 'Invalid gift card ID',
          variant: 'destructive',
        });
        navigate('/sales/gift-cards');
        return;
      }

      try {
        setLoading(true);
        // Get gift card details
        const card = await GiftCardService.getGiftCardById(giftCardId);
        
        if (!card) {
          toast({
            title: 'Error',
            description: 'Gift card not found',
            variant: 'destructive',
          });
          navigate('/sales/gift-cards');
          return;
        }
        
        setGiftCard(card);
        
        // Get transaction history
        const history = await GiftCardService.getTransactionHistory(giftCardId);
        setTransactionHistory(history);
      } catch (error) {
        console.error('Error loading gift card details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gift card details',
          variant: 'destructive',
        });
        navigate('/sales/gift-cards');
      } finally {
        setLoading(false);
      }
    };

    loadGiftCardData();
  }, [giftCardId, toast, navigate]);

  // Prepare chart data
  const chartData = prepareChartData(transactionHistory);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gift card details...</p>
        </div>
      </div>
    );
  }

  // Show error state if no gift card is selected
  if (!giftCard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Gift card not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/sales/gift-cards')}
          >
            Back to Gift Cards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sales/gift-cards')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Gift Card</h1>
              {getStatusBadge(giftCard.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              {giftCard.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Card
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPdfExportDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Email Gift Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setAdjustmentType('add');
                setShowAdjustBalanceDialog(true);
              }}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Adjust Balance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Share link copied", description: "Gift card share link copied to clipboard" })}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Summary */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x">
          <CardContent className="p-6 md:col-span-4 bg-card flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {formatCurrency(giftCard.balance)}
              </h2>
              <p className="text-muted-foreground text-sm">Current Balance</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Initial Value</p>
                <p className="font-medium">{formatCurrency(giftCard.initialValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{formatDate(giftCard.issueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiration</p>
                <p className="font-medium">{giftCard.expirationDate ? formatDate(giftCard.expirationDate) : 'Never'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Used</p>
                <p className="font-medium">{giftCard.lastUsedDate ? formatDate(giftCard.lastUsedDate) : 'Never'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={() => {
                  setAdjustmentType('add');
                  setShowAdjustBalanceDialog(true);
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Add Value
              </Button>
            </div>
          </CardContent>
          
          <div className="md:col-span-8 p-0">
            <Tabs defaultValue="activity" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="recipient">Recipient</TabsTrigger>
                  <TabsTrigger value="balance">Balance History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="activity" className="p-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  
                  {transactionHistory.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">No transactions found</p>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="mt-4"
                        onClick={() => setShowAddValueDialog(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactionHistory
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((tx) => (
                          <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                tx.type === 'redeem' || tx.type === 'expire' 
                                  ? 'bg-red-50 text-red-600' 
                                  : 'bg-green-50 text-green-600'
                              }`}>
                                {tx.type === 'redeem' ? <DollarSign className="h-4 w-4" /> :
                                tx.type === 'issue' ? <Gift className="h-4 w-4" /> :
                                tx.type === 'adjustment' ? <Edit className="h-4 w-4" /> :
                                tx.type === 'expire' ? <Ban className="h-4 w-4" /> :
                                <History className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                tx.type === 'redeem' || tx.type === 'expire' 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {tx.type === 'redeem' || tx.type === 'expire' ? '-' : '+'}
                                {formatCurrency(tx.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">Balance: {formatCurrency(tx.balanceAfter)}</p>
                            </div>
                          </div>
                        ))}
                        
                      {transactionHistory.length > 5 && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => document.getElementById('transactions-tab')?.click()}
                        >
                          View All Transactions
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recipient" className="p-6 pt-4">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recipient Information</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Card
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-primary/5 pb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Recipient</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-base">{giftCard.recipient.name || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-base">{giftCard.recipient.email || 'Not specified'}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            {giftCard.recipient.email && (
                              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowEmailDialog(true)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-primary/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Sender</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-base">{giftCard.sender.name || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-base">{giftCard.sender.email || 'Not specified'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Gift Message</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {giftCard.message ? (
                        <div className="bg-background p-4 rounded-md border italic">
                          "{giftCard.message}"
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-center p-4">
                          No message was included with this gift card.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Design Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Design Template</p>
                          <p className="text-base">Template #{giftCard.designTemplateId || 'Default'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Card Code</p>
                          <p className="text-base">{giftCard.code}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowPdfExportDialog(true)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="balance" className="p-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Balance History</h3>
                  
                  {chartData.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">No balance history available</p>
                    </div>
                  ) : (
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <ChartTooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, "Balance"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#4f46e5" 
                            fillOpacity={1}
                            fill="url(#colorBalance)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
      
      {/* Transactions Table */}
      <Card id="transactions-table">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Complete history of all transactions for this gift card</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionHistory.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">No transactions found</p>
              <Button 
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setShowAddValueDialog(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{formatDate(tx.date)}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(tx.date), 'h:mm a')}</div>
                      </TableCell>
                      <TableCell>{getTransactionTypeLabel(tx.type)}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{tx.notes || '—'}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span className={tx.type === 'redeem' || tx.type === 'expire' ? 'text-red-600' : 'text-green-600'}>
                          {tx.type === 'redeem' || tx.type === 'expire' ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(tx.balanceAfter)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Value Dialog - Replace with Adjust Balance dialog */}
      <Dialog open={showAdjustBalanceDialog} onOpenChange={setShowAdjustBalanceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{adjustmentType === 'add' ? 'Add Value to Gift Card' : 'Subtract Value from Gift Card'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{giftCard?.code}</span>
              </div>
              <Badge variant="outline">Current: {giftCard ? formatCurrency(giftCard.balance) : '$0.00'}</Badge>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      $
                    </span>
                    <input
                      id="amount"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-7"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Adjustment Type
                  </label>
                  <select 
                    id="type" 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                  >
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter notes about this adjustment..."
                ></textarea>
              </div>
              
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <div className={adjustmentType === 'add' ? "text-green-500" : "text-red-500"}>
                    {adjustmentType === 'add' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Balance Adjustment</p>
                    <p className="text-muted-foreground">This will {adjustmentType === 'add' ? 'increase' : 'decrease'} the card balance and will be recorded in the transaction history.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustBalanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowAdjustBalanceDialog(false);
              toast({
                title: adjustmentType === 'add' ? "Value Added" : "Value Subtracted",
                description: `Gift card balance has been ${adjustmentType === 'add' ? 'increased' : 'decreased'} successfully.`,
              });
            }}>
              {adjustmentType === 'add' ? 'Add Value' : 'Subtract Value'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Gift Card Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Gift Card</DialogTitle>
            <DialogDescription>
              Send this gift card to a recipient via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="recipient-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Recipient Email
              </label>
              <input
                id="recipient-email"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="recipient@example.com"
                type="email"
                defaultValue={giftCard?.recipient.email || ''}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="email-subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Subject
              </label>
              <input
                id="email-subject"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your gift card is here!"
                type="text"
                defaultValue={`Your ${formatCurrency(giftCard?.initialValue || 0)} Gift Card`}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="email-message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Message
              </label>
              <textarea
                id="email-message"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add a personal message..."
                defaultValue={giftCard?.message || ''}
              ></textarea>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="include-balance"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked
              />
              <label htmlFor="include-balance" className="text-sm text-muted-foreground">
                Include current balance in email
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowEmailDialog(false);
              toast({
                title: "Email Sent",
                description: "Gift card has been emailed successfully.",
              });
            }}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Export Dialog */}
      <Dialog open={showPdfExportDialog} onOpenChange={setShowPdfExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Gift Card as PDF</DialogTitle>
            <DialogDescription>
              Customize PDF export options
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">Export Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="include-transactions"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <label htmlFor="include-transactions" className="text-sm text-muted-foreground">
                    Include transaction history
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="include-qr"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <label htmlFor="include-qr" className="text-sm text-muted-foreground">
                    Include QR code for gift card
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="include-card-image"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <label htmlFor="include-card-image" className="text-sm text-muted-foreground">
                    Include gift card design
                  </label>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">PDF Layout</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="layout-portrait"
                    type="radio"
                    name="layout"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <label htmlFor="layout-portrait" className="text-sm text-muted-foreground">
                    Portrait
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="layout-landscape"
                    type="radio"
                    name="layout"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="layout-landscape" className="text-sm text-muted-foreground">
                    Landscape
                  </label>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">Paper Size</h3>
              <select 
                id="paper-size" 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="letter">Letter (8.5" x 11")</option>
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="legal">Legal (8.5" x 14")</option>
                <option value="tabloid">Tabloid (11" x 17")</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowPdfExportDialog(false);
              toast({
                title: "PDF Generated",
                description: "Gift card PDF has been generated successfully.",
              });
            }}>
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Gift Card</DialogTitle>
          </DialogHeader>
          <div className="text-center p-6">
            <p className="text-muted-foreground">Edit form would go here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowEditDialog(false);
              toast({
                title: "Gift Card Updated",
                description: "Gift card has been updated successfully",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 