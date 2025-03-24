import React from 'react';
import * as LucideIcons from 'lucide-react';

// Type for icon categories
export type IconCategory = 
  | 'finance'
  | 'navigation'
  | 'actions'
  | 'status'
  | 'products'
  | 'users'
  | 'communication'
  | 'files'
  | 'time'
  | 'layout'
  | 'misc';

// Interface for icon registry entry
export interface IconRegistryEntry {
  icon: React.ElementType;
  keywords: string[];
  categories: IconCategory[];
}

// Type for the icon registry
export type IconRegistry = Record<string, IconRegistryEntry>;

// Create the icon registry
export const iconRegistry: IconRegistry = {
  // Finance icons
  'credit-card': {
    icon: LucideIcons.CreditCard,
    keywords: ['payment', 'card', 'credit', 'debit', 'money'],
    categories: ['finance']
  },
  'dollar-sign': {
    icon: LucideIcons.DollarSign,
    keywords: ['money', 'currency', 'cash', 'payment', 'price'],
    categories: ['finance']
  },
  'banknote': {
    icon: LucideIcons.Banknote,
    keywords: ['cash', 'money', 'currency', 'payment'],
    categories: ['finance']
  },
  'wallet': {
    icon: LucideIcons.Wallet,
    keywords: ['money', 'payment', 'finance', 'digital wallet'],
    categories: ['finance']
  },
  'receipt': {
    icon: LucideIcons.Receipt,
    keywords: ['invoice', 'bill', 'payment', 'transaction'],
    categories: ['finance', 'files']
  },
  'percent': {
    icon: LucideIcons.Percent,
    keywords: ['discount', 'percentage', 'rate', 'tax'],
    categories: ['finance']
  },
  'calculator': {
    icon: LucideIcons.Calculator,
    keywords: ['math', 'calculation', 'compute', 'tax'],
    categories: ['finance', 'misc']
  },
  'tag': {
    icon: LucideIcons.Tag,
    keywords: ['price', 'label', 'category', 'tag'],
    categories: ['finance', 'products']
  },
  'coins': {
    icon: LucideIcons.Coins,
    keywords: ['money', 'cash', 'currency', 'finance'],
    categories: ['finance']
  },
  'piggy-bank': {
    icon: LucideIcons.PiggyBank,
    keywords: ['savings', 'money', 'finance', 'bank'],
    categories: ['finance']
  },
  
  // Navigation icons
  'home': {
    icon: LucideIcons.Home,
    keywords: ['dashboard', 'main', 'house', 'start'],
    categories: ['navigation']
  },
  'settings': {
    icon: LucideIcons.Settings,
    keywords: ['preferences', 'configuration', 'options', 'gear'],
    categories: ['navigation', 'actions']
  },
  'menu': {
    icon: LucideIcons.Menu,
    keywords: ['hamburger', 'navigation', 'options', 'list'],
    categories: ['navigation']
  },
  'search': {
    icon: LucideIcons.Search,
    keywords: ['find', 'magnify', 'lookup', 'query'],
    categories: ['navigation', 'actions']
  },
  'chevron-down': {
    icon: LucideIcons.ChevronDown,
    keywords: ['dropdown', 'arrow', 'expand', 'open'],
    categories: ['navigation']
  },
  'chevron-up': {
    icon: LucideIcons.ChevronUp,
    keywords: ['arrow', 'collapse', 'close', 'up'],
    categories: ['navigation']
  },
  'chevron-left': {
    icon: LucideIcons.ChevronLeft,
    keywords: ['arrow', 'back', 'previous', 'left'],
    categories: ['navigation']
  },
  'chevron-right': {
    icon: LucideIcons.ChevronRight,
    keywords: ['arrow', 'next', 'forward', 'right'],
    categories: ['navigation']
  },
  
  // Action icons
  'plus': {
    icon: LucideIcons.Plus,
    keywords: ['add', 'create', 'new', 'insert'],
    categories: ['actions']
  },
  'minus': {
    icon: LucideIcons.Minus,
    keywords: ['remove', 'subtract', 'delete', 'reduce'],
    categories: ['actions']
  },
  'edit': {
    icon: LucideIcons.Edit,
    keywords: ['modify', 'change', 'update', 'pencil'],
    categories: ['actions']
  },
  'trash': {
    icon: LucideIcons.Trash2,
    keywords: ['delete', 'remove', 'bin', 'garbage'],
    categories: ['actions']
  },
  'save': {
    icon: LucideIcons.Save,
    keywords: ['store', 'keep', 'preserve', 'disk'],
    categories: ['actions', 'files']
  },
  'refresh': {
    icon: LucideIcons.RefreshCw,
    keywords: ['reload', 'update', 'sync', 'renew'],
    categories: ['actions']
  },
  'download': {
    icon: LucideIcons.Download,
    keywords: ['save', 'get', 'arrow', 'obtain'],
    categories: ['actions', 'files']
  },
  'upload': {
    icon: LucideIcons.Upload,
    keywords: ['send', 'share', 'arrow', 'cloud'],
    categories: ['actions', 'files']
  },
  'filter': {
    icon: LucideIcons.Filter,
    keywords: ['sort', 'sift', 'refine', 'funnel'],
    categories: ['actions']
  },
  'copy': {
    icon: LucideIcons.Copy,
    keywords: ['duplicate', 'clone', 'replicate'],
    categories: ['actions']
  },
  
  // Status icons
  'check': {
    icon: LucideIcons.Check,
    keywords: ['success', 'complete', 'done', 'correct'],
    categories: ['status']
  },
  'check-circle': {
    icon: LucideIcons.CheckCircle2,
    keywords: ['success', 'complete', 'done', 'approved'],
    categories: ['status']
  },
  'x': {
    icon: LucideIcons.X,
    keywords: ['close', 'cancel', 'delete', 'remove'],
    categories: ['status', 'actions']
  },
  'x-circle': {
    icon: LucideIcons.XCircle,
    keywords: ['error', 'wrong', 'cancel', 'delete'],
    categories: ['status']
  },
  'alert-triangle': {
    icon: LucideIcons.AlertTriangle,
    keywords: ['warning', 'caution', 'alert', 'danger'],
    categories: ['status']
  },
  'alert-circle': {
    icon: LucideIcons.AlertCircle,
    keywords: ['info', 'information', 'help', 'warning'],
    categories: ['status']
  },
  'info': {
    icon: LucideIcons.Info,
    keywords: ['information', 'help', 'details', 'about'],
    categories: ['status']
  },
  'lock': {
    icon: LucideIcons.Lock,
    keywords: ['secure', 'protected', 'private', 'closed'],
    categories: ['status', 'actions']
  },
  'unlock': {
    icon: LucideIcons.Unlock,
    keywords: ['open', 'unsecure', 'public', 'accessible'],
    categories: ['status', 'actions']
  },
  'eye': {
    icon: LucideIcons.Eye,
    keywords: ['view', 'visible', 'show', 'see'],
    categories: ['status', 'actions']
  },
  'eye-off': {
    icon: LucideIcons.EyeOff,
    keywords: ['hide', 'invisible', 'private', 'hidden'],
    categories: ['status', 'actions']
  },
  
  // Product icons
  'package': {
    icon: LucideIcons.Package,
    keywords: ['product', 'box', 'item', 'inventory'],
    categories: ['products']
  },
  'shopping-cart': {
    icon: LucideIcons.ShoppingCart,
    keywords: ['cart', 'buy', 'purchase', 'checkout'],
    categories: ['products', 'finance']
  },
  'shopping-bag': {
    icon: LucideIcons.ShoppingBag,
    keywords: ['bag', 'purchase', 'buy', 'store'],
    categories: ['products', 'finance']
  },
  'gift': {
    icon: LucideIcons.Gift,
    keywords: ['present', 'reward', 'bonus', 'prize'],
    categories: ['products']
  },
  'truck': {
    icon: LucideIcons.Truck,
    keywords: ['shipping', 'delivery', 'transport', 'logistics'],
    categories: ['products']
  },
  'box': {
    icon: LucideIcons.Box,
    keywords: ['package', 'container', 'storage', 'inventory'],
    categories: ['products']
  },
  'barcode': {
    icon: LucideIcons.Barcode,
    keywords: ['scan', 'code', 'product', 'inventory'],
    categories: ['products']
  },
  'qr-code': {
    icon: LucideIcons.QrCode,
    keywords: ['scan', 'code', 'product', 'inventory'],
    categories: ['products']
  },
  
  // User icons
  'user': {
    icon: LucideIcons.User,
    keywords: ['person', 'profile', 'account', 'customer'],
    categories: ['users']
  },
  'users': {
    icon: LucideIcons.Users,
    keywords: ['people', 'group', 'team', 'customers'],
    categories: ['users']
  },
  'user-plus': {
    icon: LucideIcons.UserPlus,
    keywords: ['add user', 'new user', 'register', 'signup'],
    categories: ['users', 'actions']
  },
  'user-minus': {
    icon: LucideIcons.UserMinus,
    keywords: ['remove user', 'delete user', 'unregister'],
    categories: ['users', 'actions']
  },
  'user-check': {
    icon: LucideIcons.UserCheck,
    keywords: ['verify user', 'approve', 'confirm', 'validate'],
    categories: ['users', 'status']
  },
  'user-x': {
    icon: LucideIcons.UserX,
    keywords: ['block user', 'ban', 'remove', 'delete'],
    categories: ['users', 'status']
  },
  
  // Communication icons
  'mail': {
    icon: LucideIcons.Mail,
    keywords: ['email', 'message', 'letter', 'contact'],
    categories: ['communication']
  },
  'phone': {
    icon: LucideIcons.Phone,
    keywords: ['call', 'telephone', 'contact', 'support'],
    categories: ['communication']
  },
  'message-circle': {
    icon: LucideIcons.MessageCircle,
    keywords: ['chat', 'comment', 'message', 'talk'],
    categories: ['communication']
  },
  'bell': {
    icon: LucideIcons.Bell,
    keywords: ['notification', 'alert', 'reminder', 'alarm'],
    categories: ['communication', 'status']
  },
  'share': {
    icon: LucideIcons.Share2,
    keywords: ['distribute', 'send', 'social', 'export'],
    categories: ['communication', 'actions']
  },
  
  // File icons
  'file': {
    icon: LucideIcons.File,
    keywords: ['document', 'paper', 'page', 'blank'],
    categories: ['files']
  },
  'file-text': {
    icon: LucideIcons.FileText,
    keywords: ['document', 'text', 'note', 'paper'],
    categories: ['files']
  },
  'file-plus': {
    icon: LucideIcons.FilePlus,
    keywords: ['add file', 'new document', 'create file'],
    categories: ['files', 'actions']
  },
  'file-minus': {
    icon: LucideIcons.FileMinus,
    keywords: ['remove file', 'delete document', 'remove'],
    categories: ['files', 'actions']
  },
  'printer': {
    icon: LucideIcons.Printer,
    keywords: ['print', 'output', 'paper', 'document'],
    categories: ['files', 'actions']
  },
  'image': {
    icon: LucideIcons.Image,
    keywords: ['picture', 'photo', 'graphic', 'media'],
    categories: ['files']
  },
  
  // Time icons
  'clock': {
    icon: LucideIcons.Clock,
    keywords: ['time', 'hour', 'schedule', 'watch'],
    categories: ['time']
  },
  'calendar': {
    icon: LucideIcons.Calendar,
    keywords: ['date', 'schedule', 'event', 'appointment'],
    categories: ['time']
  },
  'hourglass': {
    icon: LucideIcons.Hourglass,
    keywords: ['timer', 'wait', 'loading', 'progress'],
    categories: ['time', 'status']
  },
  'alarm-clock': {
    icon: LucideIcons.AlarmClock,
    keywords: ['alert', 'reminder', 'time', 'wake'],
    categories: ['time']
  },
  'history': {
    icon: LucideIcons.History,
    keywords: ['past', 'log', 'record', 'previous'],
    categories: ['time', 'actions']
  },
  
  // Layout icons
  'layout': {
    icon: LucideIcons.Layout,
    keywords: ['design', 'template', 'structure', 'format'],
    categories: ['layout']
  },
  'grid': {
    icon: LucideIcons.Grid,
    keywords: ['table', 'layout', 'matrix', 'tiles'],
    categories: ['layout']
  },
  'columns': {
    icon: LucideIcons.Columns,
    keywords: ['layout', 'structure', 'format', 'divide'],
    categories: ['layout']
  },
  'sidebar': {
    icon: LucideIcons.Sidebar,
    keywords: ['panel', 'menu', 'navigation', 'drawer'],
    categories: ['layout', 'navigation']
  },
  'maximize': {
    icon: LucideIcons.Maximize2,
    keywords: ['fullscreen', 'expand', 'enlarge', 'zoom'],
    categories: ['layout', 'actions']
  },
  'minimize': {
    icon: LucideIcons.Minimize2,
    keywords: ['reduce', 'shrink', 'collapse', 'small'],
    categories: ['layout', 'actions']
  },
  
  // Misc icons
  'smartphone': {
    icon: LucideIcons.Smartphone,
    keywords: ['mobile', 'phone', 'device', 'cell'],
    categories: ['misc']
  },
  'laptop': {
    icon: LucideIcons.Laptop,
    keywords: ['computer', 'device', 'notebook', 'pc'],
    categories: ['misc']
  },
  'monitor': {
    icon: LucideIcons.Monitor,
    keywords: ['screen', 'display', 'computer', 'desktop'],
    categories: ['misc']
  },
  'tablet': {
    icon: LucideIcons.Tablet,
    keywords: ['device', 'ipad', 'mobile', 'touch'],
    categories: ['misc']
  },
  'wifi': {
    icon: LucideIcons.Wifi,
    keywords: ['network', 'internet', 'connection', 'wireless'],
    categories: ['misc', 'status']
  },
  'bluetooth': {
    icon: LucideIcons.Bluetooth,
    keywords: ['wireless', 'connection', 'device', 'pair'],
    categories: ['misc']
  },
  'battery': {
    icon: LucideIcons.Battery,
    keywords: ['power', 'energy', 'charge', 'level'],
    categories: ['misc', 'status']
  },
  'map': {
    icon: LucideIcons.Map,
    keywords: ['location', 'directions', 'navigation', 'gps'],
    categories: ['misc', 'navigation']
  },
  'globe': {
    icon: LucideIcons.Globe,
    keywords: ['world', 'internet', 'global', 'earth'],
    categories: ['misc']
  },
  'building': {
    icon: LucideIcons.Building,
    keywords: ['company', 'office', 'business', 'organization'],
    categories: ['misc']
  },
  'store': {
    icon: LucideIcons.Store,
    keywords: ['shop', 'retail', 'business', 'market'],
    categories: ['misc']
  },
  'loader': {
    icon: LucideIcons.Loader2,
    keywords: ['loading', 'spinner', 'wait', 'progress'],
    categories: ['misc', 'status']
  }
};

// Helper function to get an icon by name
export function getIcon(name: string): React.ElementType {
  return iconRegistry[name]?.icon || LucideIcons.HelpCircle;
}

// Helper function to render an icon with props
export function Icon({ 
  name, 
  className = "h-4 w-4", 
  ...props 
}: { 
  name: string; 
  className?: string; 
  [key: string]: any 
}) {
  const IconComponent = getIcon(name);
  return <IconComponent className={className} {...props} />;
}

// Helper function to get icons by category
export function getIconsByCategory(category: IconCategory): string[] {
  return Object.entries(iconRegistry)
    .filter(([_, entry]) => entry.categories.includes(category))
    .map(([name, _]) => name);
}

// Helper function to search icons by keyword
export function searchIcons(query: string): string[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return Object.entries(iconRegistry)
    .filter(([name, entry]) => {
      // Check if the name or any keyword matches any search term
      return searchTerms.some(term => 
        name.toLowerCase().includes(term) || 
        entry.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    })
    .map(([name, _]) => name);
}

// Export all Lucide icons for direct access if needed
export { LucideIcons };
