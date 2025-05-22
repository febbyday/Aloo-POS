import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Minus,
  Search,
  ShoppingCart,
  User,
  Wallet,
  CreditCard,
  Smartphone,
  Receipt,
  X,
  Save,
  Keyboard,
  FileText,
  History,
  Image,
  List,
  LayoutGrid,
  Coffee,
  Sandwich,
  Utensils,
  Soup,
  Cake,
  Salad,
  Pizza,
  Wine,
  ShoppingBag,
  Calendar
} from 'lucide-react'
import {
  useNavigate
} from 'react-router-dom'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useHotkeys } from '../hooks/useHotkeys'
import { HotkeysHelp } from '../components/HotkeysHelp'
import { ItemDiscountDialog, ItemDiscountDetails } from '../components/ItemDiscountDialog'
import { DraftSalesDialog } from '../components/DraftSalesDialog'
import { RecentTransactionsDialog } from '../components/RecentTransactionsDialog'
import { CartItemComponent } from '../components/CartItem'
import { CartItem, DraftSale, Transaction } from '../types'
import { useToast as useToastManager } from '@/lib/toast'
import { useSalesHistory } from '../context/SalesHistoryContext'
import { FieldHelpTooltip, InfoBox } from '@/components/ui/help-tooltip'
import { OperationButton, ActionStatus, ActionFeedback } from '@/components/ui/action-feedback'

// Mock products data
const mockProducts = [
  {
    id: 'PROD-1001',
    name: 'ALOO TOTE CANVAS & LEATHER COMPLIMENTARY',
    price: 149.99,
    stock: 12,
    barcode: '890000000001',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1002',
    name: 'ALOO TOTE FULL LEATHER',
    price: 199.99,
    stock: 8,
    barcode: '890000000002',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1003',
    name: 'AMAKOLE MILLED LEATHER',
    price: 129.99,
    stock: 15,
    barcode: '890000000003',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  },
  {
    id: 'PROD-1004',
    name: 'AMAKOLE OIL PULL UP LEATHER',
    price: 139.99,
    stock: 10,
    barcode: '890000000004',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  },
  {
    id: 'PROD-1005',
    name: 'AMUJAL FULL HIDE LEATHER',
    price: 179.99,
    stock: 6,
    barcode: '890000000005',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1006',
    name: 'ANIMAL KEY HOLDER',
    price: 29.99,
    stock: 25,
    barcode: '890000000006',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1007',
    name: 'ARAPSIEN WALLET',
    price: 59.99,
    stock: 20,
    barcode: '890000000007',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1008',
    name: 'ARAYO MILLED LEATHER',
    price: 119.99,
    stock: 12,
    barcode: '890000000008',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  },
  {
    id: 'PROD-1009',
    name: 'ARIKE MILLED LEATHER',
    price: 124.99,
    stock: 14,
    barcode: '890000000009',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  },
  {
    id: 'PROD-1010',
    name: 'ARIKE OIL PULLUP',
    price: 134.99,
    stock: 9,
    barcode: '890000000010',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  },
  {
    id: 'PROD-1011',
    name: 'ASHLEY',
    price: 89.99,
    stock: 18,
    barcode: '890000000011',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1012',
    name: 'ASIRD',
    price: 94.99,
    stock: 16,
    barcode: '890000000012',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1013',
    name: 'BATTERIES',
    price: 4.99,
    stock: 50,
    barcode: '890000000013',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1014',
    name: 'BB001',
    price: 79.99,
    stock: 15,
    barcode: '890000000014',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1015',
    name: 'BELTS OIL PULL UP SIZE 30',
    price: 49.99,
    stock: 22,
    barcode: '890000000015',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1016',
    name: 'BELTS OIL PULL UP SIZE 32',
    price: 49.99,
    stock: 20,
    barcode: '890000000016',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1017',
    name: 'BETSY COVER',
    price: 39.99,
    stock: 18,
    barcode: '890000000017',
    category: 'Accessories',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1018',
    name: 'BONSUK',
    price: 109.99,
    stock: 10,
    barcode: '890000000018',
    category: 'Leather Goods',
    image: null,
    hasOptions: false,
    availableSizes: null,
    availableIceLevels: null
  },
  {
    id: 'PROD-1019',
    name: 'BRIDGET MILLED LEATHER',
    price: 119.99,
    stock: 8,
    barcode: '890000000019',
    category: 'Leather Goods',
    image: null,
    hasOptions: true,
    availableSizes: ['S', 'M', 'L'],
    availableIceLevels: null
  }
]

// Category definitions with icons
const categories = [
  { id: 'leathergoods', name: 'Leather Goods', icon: ShoppingBag, count: mockProducts.filter(p => p.category === 'Leather Goods').length },
  { id: 'accessories', name: 'Accessories', icon: Wallet, count: mockProducts.filter(p => p.category === 'Accessories').length },
  { id: 'breakfast', name: 'Breakfast', icon: Coffee, count: mockProducts.filter(p => p.category === 'Breakfast').length },
  { id: 'lunch', name: 'Lunch', icon: Sandwich, count: mockProducts.filter(p => p.category === 'Lunch').length },
  { id: 'dinner', name: 'Dinner', icon: Utensils, count: mockProducts.filter(p => p.category === 'Dinner').length },
  { id: 'soup', name: 'Soup', icon: Soup, count: mockProducts.filter(p => p.category === 'Soup').length },
  { id: 'desserts', name: 'Desserts', icon: Cake, count: mockProducts.filter(p => p.category === 'Desserts').length },
  { id: 'sidedish', name: 'Side Dish', icon: Salad, count: mockProducts.filter(p => p.category === 'Side Dish').length },
  { id: 'appetizer', name: 'Appetizer', icon: Pizza, count: mockProducts.filter(p => p.category === 'Appetizer').length },
  { id: 'beverages', name: 'Beverages', icon: Wine, count: mockProducts.filter(p => p.category === 'Beverages').length },
]

export function POSSalePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Basic state
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'installment'>('cash')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Payment handling state
  const [tenderAmount, setTenderAmount] = useState<number | ''>('')
  const [changeDue, setChangeDue] = useState<number>(0)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [splitPayment, setSplitPayment] = useState(false)
  const [splitPayments, setSplitPayments] = useState<Array<{method: 'cash' | 'card' | 'mobile' | 'installment', amount: number}>>([])
  const [remainingAmount, setRemainingAmount] = useState<number>(0)

  // Discount state
  const [subtotalDiscount, setSubtotalDiscount] = useState<{
    type: 'percentage' | 'amount',
    value: number,
    reason?: string
  } | null>(null)

  // Product option states
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [selectedIceLevel, setSelectedIceLevel] = useState<number>(50)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [showProductOptions, setShowProductOptions] = useState(false)

  // Dialog states
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showNumpad, setShowNumpad] = useState(false)
  const [showHotkeysHelp, setShowHotkeysHelp] = useState(false)
  const [showDraftSales, setShowDraftSales] = useState(false)
  const [showRecentTransactions, setShowRecentTransactions] = useState(false)
  const [showItemDiscount, setShowItemDiscount] = useState(false)
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null)

  // Draft sales state
  const [draftSales, setDraftSales] = useState<DraftSale[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  // Cart calculations with discounts
  const subtotal = cart.reduce((sum, item) => {
    let itemPrice = item.price * item.quantity

    // Apply item-level discount if any
    if (item.discount) {
      if (item.discount.type === 'percentage') {
        itemPrice -= (itemPrice * item.discount.value) / 100
      } else {
        itemPrice -= item.discount.value
      }
    }

    return sum + itemPrice
  }, 0)

  // Apply subtotal discount
  let discountedSubtotal = subtotal
  let discountAmount = 0

  if (subtotalDiscount) {
    if (subtotalDiscount.type === 'percentage') {
      discountAmount = (subtotal * subtotalDiscount.value) / 100
    } else {
      discountAmount = subtotalDiscount.value
    }
    discountedSubtotal = subtotal - discountAmount
  }

  const tax = discountedSubtotal * 0.16 // 16% VAT
  const total = discountedSubtotal + tax

  // Replace regular toast with our enhanced toast manager
  const showToast = useToastManager();

  // Add sales history for undo/redo support
  const { trackAction, canUndo, undo, canRedo, redo } = useSalesHistory();

  // Add operation status state
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [discountStatus, setDiscountStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const calculateChangeDue = (tenderedValue: number) => {
    const changeAmount = tenderedValue - total;
    return changeAmount > 0 ? changeAmount : 0;
  };

  const handleTenderAmountChange = (value: number | '') => {
    const oldValue = tenderAmount;
    setTenderAmount(value);

    // Track this change for potential undo
    if (value !== '' && oldValue !== '') {
      trackAction(
        {
          type: 'update_sale',
          id: 'current-sale',
          before: { tenderAmount: oldValue },
          after: { tenderAmount: value }
        },
        `Changed tender amount from ${oldValue} to ${value}`
      );
    }
  };

  const handleAddSplitPayment = () => {
    if (!tenderAmount || tenderAmount <= 0) {
      showToast.error("Invalid amount", "Please enter a valid payment amount");
      return;
    }

    const newPayment = {
      id: `payment-${Date.now()}`,
      method: paymentMethod,
      amount: tenderAmount as number
    };

    // Track this action for undo
    trackAction(
      {
        type: 'update_sale',
        id: 'current-sale',
        before: { splitPayments: [...splitPayments] },
        after: { splitPayments: [...splitPayments, newPayment] }
      },
      `Added ${paymentMethod} payment of ${tenderAmount}`
    );

    setSplitPayments([...splitPayments, newPayment]);

    // Calculate remaining balance
    const totalPaid = [...splitPayments, newPayment].reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = total - totalPaid;

    setTenderAmount(remaining > 0 ? remaining : 0);

    showToast.success(
      "Payment added",
      `${paymentMethod} payment of ${tenderAmount} added`
    );
  };

  const handleCompleteSale = async () => {
    try {
      setPaymentStatus("loading");

      // Validate payment
      if (paymentMethod === 'cash' && (tenderAmount as number) < total) {
        showToast.error("Insufficient payment", "The tendered amount is less than the total");
        setPaymentStatus("error");
        return;
      }

      // Create transaction record
      const transaction: Transaction = {
        id: `TRX-${Date.now()}`,
        date: new Date(),
        items: cart,
        subtotal,
        tax,
        total,
        discount: subtotalDiscount,
        payments: splitPayments.length > 0
          ? splitPayments
          : [{
              id: `payment-${Date.now()}`,
              method: paymentMethod,
              amount: total
            }],
        customer: selectedCustomer,
        status: 'completed'
      };

      // Track this action
      trackAction(
        { type: 'complete_sale', sale: transaction },
        `Completed sale ${transaction.id}`
      );

      // Add to transaction history
      setRecentTransactions([transaction, ...recentTransactions]);

      // Show success message
      showToast.success(
        "Sale completed",
        `Transaction #${transaction.id} has been processed`
      );

      // Reset the cart
      setCart([]);
      setSelectedCustomer(null);
      setSubtotalDiscount(null);
      setSplitPayments([]);
      setTenderAmount('');
      setPaymentMethod('cash');

      setPaymentStatus("success");

      // Automatically print receipt
      if (true) {
        setTimeout(() => {
          handlePrintReceipt();
        }, 500);
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      showToast.error(
        "Error processing sale",
        "There was a problem completing the transaction"
      );
      setPaymentStatus("error");
    }
  };

  const handleStartPayment = () => {
    if (cart.length === 0) {
      showToast.warning("Empty cart", "Please add items to the cart before proceeding to payment");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...cart];
      const oldQuantity = updatedItems[existingItemIndex].quantity;
      updatedItems[existingItemIndex].quantity += 1;

      // Track this action
      trackAction(
        {
          type: 'update_item',
          saleId: 'current-sale',
          itemId: product.id,
          before: { quantity: oldQuantity },
          after: { quantity: oldQuantity + 1 }
        },
        `Increased quantity of ${product.name}`
      );

      setCart(updatedItems);

      showToast.info(
        "Quantity updated",
        `${product.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`
      );
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        discount: null,
        options: null
      };

      // Track this action
      trackAction(
        { type: 'add_item', saleId: 'current-sale', item: newItem },
        `Added ${product.name} to cart`
      );

      setCart([...cart, newItem]);

      showToast.success(
        "Item added",
        `${product.name} added to cart`
      );
    }
  };

  const handleAddProductWithOptions = () => {
    if (!selectedProduct) return

    const productName = `${selectedProduct.name}${selectedProduct.availableSizes ? ` (${selectedSize})` : ''}${selectedProduct.availableIceLevels ? ` - Ice: ${selectedIceLevel}%` : ''}`

    const existingItemIndex = cart.findIndex(item =>
      item.productId === selectedProduct.id &&
      item.size === selectedSize &&
      item.iceLevel === selectedIceLevel
    )

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += selectedQuantity
      setCart(updatedCart)
    } else {
      setCart([...cart, {
        productId: selectedProduct.id,
        name: productName,
        price: selectedProduct.price,
        quantity: selectedQuantity,
        size: selectedProduct.availableSizes ? selectedSize : undefined,
        iceLevel: selectedProduct.availableIceLevels ? selectedIceLevel : undefined
      }])
    }

    toast({
      title: 'Product added',
      description: `${productName} has been added to cart.`
    })

    setShowProductOptions(false)
    setSelectedProduct(null)
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updatedItems = [...cart];
    const itemIndex = updatedItems.findIndex(item => item.productId === productId);

    if (itemIndex >= 0) {
      const oldQuantity = updatedItems[itemIndex].quantity;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        handleRemoveFromCart(productId);
        return;
      }

      updatedItems[itemIndex].quantity = quantity;

      // Track this action
      trackAction(
        {
          type: 'update_item',
          saleId: 'current-sale',
          itemId: productId,
          before: { quantity: oldQuantity },
          after: { quantity }
        },
        `Updated quantity of ${updatedItems[itemIndex].name} to ${quantity}`
      );

      setCart(updatedItems);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const itemToRemove = cart.find(item => item.productId === productId);

    if (itemToRemove) {
      // Track this action
      trackAction(
        {
          type: 'remove_item',
          saleId: 'current-sale',
          itemId: productId,
          item: itemToRemove
        },
        `Removed ${itemToRemove.name} from cart`
      );

      setCart(cart.filter(item => item.productId !== productId));

      showToast.action(
        "Item removed",
        `${itemToRemove.name} removed from cart`,
        () => {
          // Add the item back to the cart
          setCart(prev => [...prev, itemToRemove]);
        },
        "Undo"
      );
    }
  };

  const handleSaveAsDraft = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'No items to save as draft.',
        variant: 'destructive'
      })
      return
    }

    // Generate a unique ID for the draft
    const draftId = `DRAFT-${Date.now().toString().slice(-6)}`

    // Create a new draft
    const newDraft: DraftSale = {
      id: draftId,
      name: selectedCustomer ? `${selectedCustomer}'s Order` : `Draft Sale`,
      items: cart.length,
      total: subtotal,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Add to drafts
    setDraftSales([newDraft, ...draftSales])

    toast({
      title: 'Draft saved',
      description: `Sale saved as draft #${draftId}.`
    })

    // Clear the cart
    setCart([])
  }

  const handleLoadDraft = (draftId: string) => {
    const draft = draftSales.find(d => d.id === draftId)
    if (!draft) return

    // In a real app, you would fetch the cart items for this draft from an API
    // For demo purposes, we'll create some mock items
    const mockItems: CartItem[] = Array.from({ length: draft.items }, (_, i) => ({
      productId: `PROD-${1000 + i}`,
      name: `Product ${i + 1}`,
      price: Math.round((draft.total / draft.items) * 100) / 100,
      quantity: 1
    }))

    setCart(mockItems)
    setDraftSales(draftSales.filter(d => d.id !== draftId))
    setShowDraftSales(false)

    toast({
      title: 'Draft loaded',
      description: `Draft #${draftId} has been loaded.`
    })
  }

  const handleDeleteDraft = (draftId: string) => {
    setDraftSales(draftSales.filter(d => d.id !== draftId))

    toast({
      title: 'Draft deleted',
      description: `Draft #${draftId} has been deleted.`
    })
  }

  const handleApplyItemDiscount = (discount: ItemDiscountDetails) => {
    if (!selectedItemForDiscount) return

    setCart(cart.map(item =>
      item.productId === selectedItemForDiscount.productId
        ? { ...item, discount: discount }
        : item
    ))

    toast({
      title: 'Discount applied',
      description: `Discount applied to ${selectedItemForDiscount.name}.`
    })
  }

  const handleApplySubtotalDiscount = (discount: {
    type: 'percentage' | 'amount',
    value: number,
    reason?: string
  }) => {
    setSubtotalDiscount(discount)
    toast({
      title: 'Discount applied',
      description: `Discount applied to subtotal`
    })
  }

  const handleRemoveSubtotalDiscount = () => {
    setSubtotalDiscount(null)
    toast({
      title: 'Discount removed',
      description: 'Subtotal discount has been removed'
    })
  }

  const handleViewTransaction = (transactionId: string) => {
    // In a real app, you would navigate to the transaction details page
    toast({
      title: 'View transaction',
      description: `Viewing details for transaction #${transactionId}.`
    })
  }

  const handleVoidTransaction = (transactionId: string) => {
    setRecentTransactions(recentTransactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, status: 'voided' as const }
        : transaction
    ))

    toast({
      title: 'Transaction voided',
      description: `Transaction #${transactionId} has been voided.`
    })
  }

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'No items to print receipt for.',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: 'Printing receipt',
      description: 'The receipt is being printed.'
    })
  }

  const handleClearCart = () => {
    if (cart.length === 0) return

    setCart([])
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from the cart.'
    })
  }

  const handleCloseDialogs = () => {
    setShowCustomerDialog(false)
    setShowNumpad(false)
    setShowHotkeysHelp(false)
    setShowDraftSales(false)
    setShowRecentTransactions(false)
    setShowItemDiscount(false)
    setShowProductOptions(false)
  }

  // Implement keyboard shortcuts
  useHotkeys({
    'F1': () => setShowHotkeysHelp(true),
    'F2': () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    },
    'F3': () => setShowCustomerDialog(true),
    'F4': () => setShowNumpad(true),
    'F5': () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
    'F6': () => {
      if (cart.length > 0) {
        setSelectedItemForDiscount(cart[cart.length - 1])
        setShowItemDiscount(true)
      }
    },
    'F7': () => setShowDraftSales(true),
    'F8': () => setShowRecentTransactions(true),
    'F9': () => handleSaveAsDraft(),
    'F10': () => handleClearCart(),
    'F12': () => handleCompleteSale(),
    'Ctrl+P': () => handlePrintReceipt(),
    'Esc': () => handleCloseDialogs(),
  })

  // Add undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Command+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        const action = undo();

        if (action) {
          // Handle different action types
          switch (action.type) {
            case 'add_item':
              // Remove the added item
              setCart(prev => prev.filter(item => item.productId !== action.item.productId));
              break;
            case 'remove_item':
              // Add the removed item back
              setCart(prev => [...prev, action.item]);
              break;
            case 'update_item':
              // Revert the item update
              setCart(prev => {
                const updated = [...prev];
                const index = updated.findIndex(item => item.productId === action.itemId);
                if (index >= 0) {
                  updated[index] = { ...updated[index], ...action.before };
                }
                return updated;
              });
              break;
            case 'update_sale':
              // Handle various sale updates
              if ('tenderAmount' in action.before) {
                setTenderAmount(action.before.tenderAmount as number);
              }
              if ('splitPayments' in action.before) {
                setSplitPayments(action.before.splitPayments as any[]);
              }
              break;
            // Handle other action types as needed
          }

          showToast.info("Undo", "Previous action undone");
        }
      }

      // Check for Ctrl+Shift+Z or Command+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        const action = redo();

        if (action) {
          // Handle different action types (similar to undo but applying 'after' state)
          // ...

          showToast.info("Redo", "Action reapplied");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, showToast]);

  const filteredProducts = mockProducts.filter(product =>
    (searchQuery ?
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.barcode.includes(searchQuery))
      : true) &&
    (selectedCategory ? product.category === selectedCategory : true)
  )

  useEffect(() => {
    // In a real app, fetch recent transactions from API
    setRecentTransactions([
      { id: 'TRX-001', total: 156.99, time: '10:30 AM', status: 'completed' },
      { id: 'TRX-002', total: 89.99, time: '11:15 AM', status: 'completed' },
      { id: 'TRX-003', total: 245.50, time: '12:00 PM', status: 'pending' },
    ])

    // In a real app, fetch saved drafts from API or local storage
    setDraftSales([
      { id: 'DRAFT-001', name: 'Morning Sale', items: 3, total: 78.50, createdAt: '9:15 AM' },
      { id: 'DRAFT-002', name: 'Customer Order', items: 5, total: 125.75, createdAt: '11:30 AM' },
    ])
  }, [])

  return (
    <div className="flex flex-col h-screen">
      {/* Shortcuts Bar - Full Width */}
      <div className="flex items-center justify-between px-6 h-16 border-b bg-muted/30 w-full">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="default"
            onClick={() => setShowHotkeysHelp(true)}
            className="flex flex-col h-full py-2 rounded-none border-b-2 border-transparent hover:border-primary"
          >
            <Keyboard className="h-6 w-6 mb-1" />
            <div className="flex items-center">
              <span className="text-xs">Help</span>
              <span className="text-xs text-muted-foreground ml-1">(F1)</span>
            </div>
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button
            variant="ghost"
            size="default"
            onClick={() => setShowDraftSales(true)}
            className="flex flex-col h-full py-2 rounded-none border-b-2 border-transparent hover:border-primary"
          >
            <FileText className="h-6 w-6 mb-1" />
            <div className="flex items-center">
              <span className="text-xs">Drafts</span>
              <span className="text-xs text-muted-foreground ml-1">(F7)</span>
            </div>
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button
            variant="ghost"
            size="default"
            onClick={() => setShowRecentTransactions(true)}
            className="flex flex-col h-full py-2 rounded-none border-b-2 border-transparent hover:border-primary"
          >
            <History className="h-6 w-6 mb-1" />
            <div className="flex items-center">
              <span className="text-xs">History</span>
              <span className="text-xs text-muted-foreground ml-1">(F8)</span>
            </div>
          </Button>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="default"
            onClick={handleSaveAsDraft}
            disabled={cart.length === 0}
            className="flex flex-col h-full py-2 rounded-none border-b-2 border-transparent hover:border-primary"
          >
            <Save className="h-6 w-6 mb-1" />
            <div className="flex items-center">
              <span className="text-xs">Save</span>
              <span className="text-xs text-muted-foreground ml-1">(F9)</span>
            </div>
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button
            variant="ghost"
            size="default"
            onClick={handleClearCart}
            disabled={cart.length === 0}
            className="flex flex-col h-full py-2 rounded-none border-b-2 border-transparent hover:border-primary"
          >
            <X className="h-6 w-6 mb-1" />
            <div className="flex items-center">
              <span className="text-xs">Clear</span>
              <span className="text-xs text-muted-foreground ml-1">(F10)</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="border-b bg-background">
            <div className="flex items-center space-x-2 p-4">
              <Input
                ref={searchInputRef}
                placeholder="Search products by name or scan barcode... (F2)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => setShowNumpad(!showNumpad)}>
                <Keyboard className="h-4 w-4 mr-2" />
                Numpad
              </Button>
              <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <LayoutGrid className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1 p-4 overflow-auto">
            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedCategory === category.name
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-accent/50 border-border'
                  }`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.name ? null : category.name)
                  }
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                    {React.createElement(category.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} Menu In Stock</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Products */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCategory || 'All Products'}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredProducts.length} items)
                  </span>
                </h2>
                {selectedCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    View All
                  </Button>
                )}
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                      onClick={() => handleAddToCart(product)}
                    >
                      <div className="h-[170px] bg-muted flex items-center justify-center relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Image className="h-12 w-12 text-muted-foreground" />
                        )}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2"
                        >
                          ${product.price.toFixed(2)}
                        </Badge>
                      </div>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm truncate">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            {product.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Stock: {product.stock}
                          </p>
                        </div>
                        {product.hasOptions && (
                          <Badge variant="outline" className="mt-2 bg-primary/10">
                            Customizable
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          {product.hasOptions ? (
                            <Badge variant="outline" className="bg-primary/10">
                              Customizable
                            </Badge>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[400px] flex flex-col border-l bg-muted/50">
          {/* Customer Selection */}
          <div className="p-4 border-b bg-background">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCustomerDialog(true)}
            >
              <User className="h-4 w-4 mr-2" />
              {selectedCustomer || 'Select Customer'}
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-1">
                {cart.map((item) => (
                  <CartItemComponent
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveFromCart={handleRemoveFromCart}
                    onApplyDiscount={(item) => {
                      setSelectedItemForDiscount(item);
                      setShowItemDiscount(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="p-4 border-t bg-background">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {subtotalDiscount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center">
                    Discount {subtotalDiscount.type === 'percentage' ? `(${subtotalDiscount.value}%)` : ''}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 text-red-500"
                      onClick={handleRemoveSubtotalDiscount}
                    >
                      ×
                    </Button>
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {!subtotalDiscount && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSelectedItemForDiscount(null);
                      setShowItemDiscount(true);
                    }}
                  >
                    Add Discount to Subtotal
                  </Button>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>VAT (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Card
                </Button>
                <Button
                  variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
                <Button
                  variant={paymentMethod === 'installment' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('installment')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleStartPayment}
                disabled={cart.length === 0}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Complete Sale (F12)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Choose a customer for this transaction or search for one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search customers..." />
            <Select onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="bob-wilson">Bob Wilson</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => setShowCustomerDialog(false)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Numpad Dialog */}
      <Dialog open={showNumpad} onOpenChange={setShowNumpad}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Number Pad</DialogTitle>
            <DialogDescription>
              Use the number pad to enter values.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-12 text-lg"
                onClick={() => {
                  // Handle numpad input
                }}
              >
                {num}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hotkeys Help Dialog */}
      <HotkeysHelp
        open={showHotkeysHelp}
        onOpenChange={setShowHotkeysHelp}
      />

      {/* Item Discount Dialog */}
      <ItemDiscountDialog
        open={showItemDiscount}
        onOpenChange={setShowItemDiscount}
        itemName={selectedItemForDiscount ? selectedItemForDiscount.name : "Subtotal"}
        itemPrice={selectedItemForDiscount ? selectedItemForDiscount.price : subtotal}
        onApplyDiscount={(discount) => {
          if (selectedItemForDiscount) {
            handleApplyItemDiscount(discount);
          } else {
            handleApplySubtotalDiscount(discount);
          }
        }}
      />

      {/* Draft Sales Dialog */}
      <DraftSalesDialog
        open={showDraftSales}
        onOpenChange={setShowDraftSales}
        drafts={draftSales}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />

      {/* Recent Transactions Dialog */}
      <RecentTransactionsDialog
        open={showRecentTransactions}
        onOpenChange={setShowRecentTransactions}
        transactions={recentTransactions}
        onViewTransaction={handleViewTransaction}
        onVoidTransaction={handleVoidTransaction}
      />

      {/* Product Options Dialog */}
      <Dialog open={showProductOptions} onOpenChange={setShowProductOptions}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Customize your product options before adding to cart.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProduct?.availableSizes && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cup Size</label>
                <div className="flex space-x-2">
                  {selectedProduct.availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct?.availableIceLevels && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ice Level</label>
                <div className="flex space-x-2">
                  {selectedProduct.availableIceLevels.map((level) => (
                    <Button
                      key={level}
                      variant={selectedIceLevel === level ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSelectedIceLevel(level)}
                    >
                      {level}%
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center">{selectedQuantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-lg font-bold">
                Total: ${selectedProduct ? (selectedProduct.price * selectedQuantity).toFixed(2) : '0.00'}
              </div>
              <Button onClick={handleAddProductWithOptions}>
                Add To Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Enter payment details to complete the sale
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {splitPayment && remainingAmount > 0 && (
              <div className="flex justify-between text-amber-500 font-semibold">
                <span>Remaining:</span>
                <span>${remainingAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('cash')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </Button>
              <Button
                variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
              <Button
                variant={paymentMethod === 'installment' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setPaymentMethod('installment')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Install
              </Button>
            </div>

            {(paymentMethod === 'cash' || splitPayment) && (
              <div className="space-y-2">
                <Label htmlFor="tenderAmount">Amount {splitPayment ? 'Paid' : 'Tendered'}</Label>
                <Input
                  id="tenderAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={tenderAmount}
                  onChange={(e) => handleTenderAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            )}

            {paymentMethod === 'cash' && !splitPayment && typeof tenderAmount === 'number' && tenderAmount >= total && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Change Due:</span>
                <span>${changeDue.toFixed(2)}</span>
              </div>
            )}

            {splitPayment && splitPayments.length > 0 && (
              <div className="space-y-2 border rounded-md p-2">
                <Label>Payment Breakdown</Label>
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}:</span>
                    <span>${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between space-x-2">
              <Button
                variant="outline"
                onClick={() => setSplitPayment(!splitPayment)}
              >
                {splitPayment ? 'Single Payment' : 'Split Payment'}
              </Button>

              {splitPayment && remainingAmount > 0 ? (
                <Button onClick={handleAddSplitPayment}>
                  Add Payment
                </Button>
              ) : (
                <Button onClick={handleCompleteSale}>
                  Complete Sale
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
