import {
  LayoutDashboard,
  Store,
  Package,
  Receipt,
  Users,
  BarChart,
  UserCog,
  Settings,
  HelpCircle,
  ChevronDown,
  ArrowLeftRight,
  AlertTriangle,
  History,
  Building2,
  LineChart,
  TrendingUp,
  LayoutGrid,
  ShoppingCart,
  Building,
  BarChart3,
  RefreshCw,
  Gift,
  FileText,
  Printer,
  Wrench,
  ClipboardList,
  Clock,
  Settings2,
  ScrollText,
  UserCircle,
  Shield,
  Target,
  Palette,
  Bell,
  Database,
  Calculator,
  Cpu,
  DollarSign,
  FolderTree,
  Plus,
  RotateCcw,
  Percent,
  CreditCard,
  Menu,
  Briefcase,
  LockIcon,
  Sun
} from 'lucide-react'

/**
 * Navigation Item Interface
 * Defines the structure for navigation items in the sidebar
 */
export interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  submenu?: NavigationItem[]
  children?: NavigationItem[]
  title?: string // For compatibility with components/layout/Sidebar.tsx
}

/**
 * Main Navigation Configuration
 * This array defines the structure of the sidebar navigation
 */
export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutGrid
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    submenu: [
      { name: 'All Products', href: '/products', icon: Package },
      { name: 'Categories', href: '/products/categories', icon: FolderTree },
      { name: 'Brands', href: '/products/brands', icon: Building },
      { name: 'Variations & Attributes', href: '/products/variations', icon: LayoutGrid },
      { name: 'Pricing', href: '/products/pricing', icon: TrendingUp },
      { name: 'Stock Transfer', href: '/products/stock/transfers', icon: ArrowLeftRight },
      { name: 'Low Stock Alerts', href: '/products/stock/alerts', icon: AlertTriangle },
      { name: 'Stock History', href: '/products/stock/history', icon: History },
    ]
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    submenu: [
      { name: 'All Sales', href: '/sales', icon: ShoppingCart },
      { name: 'Returns', href: '/sales/returns', icon: RotateCcw },
      { name: 'Discounts', href: '/sales/discounts', icon: Percent },
      { name: 'Gift Cards', href: '/sales/gift-cards', icon: CreditCard },
      { name: 'Transactions', href: '/sales/transactions', icon: ShoppingCart },
      { name: 'Analytics', href: '/sales/analytics', icon: LineChart },
    ]
  },
  {
    name: 'Shops',
    href: '/shops',
    icon: Store,
    submenu: [
      { name: 'All Shops', href: '/shops', icon: Store },
      { name: 'Staff', href: '/shops/staff', icon: Users },
      { name: 'Reports', href: '/shops/reports', icon: BarChart },
    ]
  },
  {
    name: 'Markets',
    href: '/markets',
    icon: Building2,
    submenu: [
      { name: 'All Markets', href: '/markets', icon: Building },
      { name: 'Reports', href: '/markets/reports', icon: BarChart3 },
    ]
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: DollarSign,
    submenu: [
      { name: 'All Expenses', href: '/expenses', icon: FileText },
      { name: 'Categories', href: '/expenses/categories', icon: FolderTree },
    ]
  },
  {
    name: 'Repairs',
    href: '/repairs',
    icon: Wrench,
    submenu: [
      { name: 'All Repairs', href: '/repairs', icon: ClipboardList },
      { name: 'Pending', href: '/repairs/pending', icon: Clock },
      { name: 'Reports', href: '/repairs/reports', icon: ScrollText },
    ]
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Users,
    submenu: [
      { name: 'All Suppliers', href: '/suppliers', icon: Users },
      { name: 'Orders', href: '/purchase-orders', icon: ClipboardList },
      { name: 'Performance', href: '/suppliers/performance', icon: TrendingUp },
      { name: 'Reports', href: '/suppliers/reports', icon: FileText },
    ]
  },
  {
    name: 'Finance',
    href: '/finance/revenue',
    icon: DollarSign,
    submenu: [
      { name: 'Sales & Revenue', href: '/finance/revenue', icon: TrendingUp },
      { name: 'Expenses', href: '/finance/expenses', icon: FileText },
      { name: 'Profit & Loss', href: '/finance/profit-loss', icon: BarChart },
      { name: 'Taxes', href: '/finance/taxes', icon: Percent },
      { name: 'Reconciliation', href: '/finance/reconciliation', icon: RefreshCw },
      { name: 'Reports', href: '/finance/reports', icon: FileText },
      { name: 'Settings', href: '/finance/settings', icon: Settings },
    ]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart,
    submenu: [
      { name: 'Sales Reports', href: '/reports/sales', icon: Receipt },
      { name: 'Inventory Reports', href: '/reports/inventory', icon: Package },
      { name: 'Financial Reports', href: '/reports/financial', icon: LineChart },
      { name: 'Staff Reports', href: '/reports/staff', icon: Users },
      { name: 'Custom Reports', href: '/reports/custom', icon: FileText },
    ]
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    submenu: [
      { name: 'All Customers', href: '/customers', icon: Users },
      { name: 'Groups', href: '/customers/groups', icon: Users },
      { name: 'Loyalty Program', href: '/customers/loyalty', icon: Gift },
      { name: 'History', href: '/customers/history', icon: History },
      { name: 'Analytics', href: '/customers/analytics', icon: BarChart },
      { name: 'Reports', href: '/customers/reports', icon: FileText },
    ]
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserCog,
    submenu: [
      {
        name: 'All Users',
        href: '/users',
        icon: Users
      },
      {
        name: 'My Profile',
        href: '/users/profile',
        icon: UserCircle
      },
      {
        name: 'Change Password',
        href: '/users/password',
        icon: LockIcon
      },
      {
        name: 'User Roles',
        href: '/users/roles',
        icon: Shield
      },
      {
        name: 'Permissions',
        href: '/users/permissions',
        icon: Target
      }
    ]
  },
  {
    name: 'Staff',
    href: '/staff',
    icon: Users,
    submenu: [
      { name: 'All Staff', href: '/staff', icon: UserCircle },
      { name: 'Employment Types', href: '/staff/employment-types', icon: Clock },
      { name: 'Employment Status', href: '/staff/employment-status', icon: Briefcase },
      { name: 'Performance', href: '/staff/performance', icon: Target },
    ]
  },
]

// Add Settings & Support at the bottom with a separator
navigation.push(
  {
    name: 'Settings & Support',
    href: '/settings',
    icon: Settings,
    submenu: [
      {
        name: 'System Settings',
        href: '/settings',
        icon: Settings,
        submenu: [
          { name: 'Appearance', href: '/settings/appearance', icon: Palette },
          { name: 'Theme', href: '/settings/theme', icon: Sun },
          { name: 'Notification Settings', href: '/settings/notifications', icon: Bell },
          { name: 'Backup & Export', href: '/settings/backup', icon: Database },
          { name: 'Receipt Settings', href: '/settings/receipts', icon: Receipt },
          { name: 'Tax & Currency', href: '/settings/tax', icon: Calculator },
          { name: 'Security', href: '/settings/security', icon: Shield },
          { name: 'System Performance', href: '/settings/system', icon: Cpu },
          { name: 'Notifications', href: '/notifications', icon: Bell },
          { name: 'Printer & Hardware', href: '/settings/hardware', icon: Printer },
          { name: 'WooCommerce', href: '/settings/woocommerce', icon: ShoppingCart }
        ]
      },
      { name: 'Help Center', href: '/help', icon: HelpCircle },
    ]
  }
)

/**
 * Helper function to get navigation items by path
 * @param path The path to search for
 * @returns The navigation item if found, undefined otherwise
 */
export function getNavigationItemByPath(path: string): NavigationItem | undefined {
  // Helper function to search recursively through navigation items
  function findItem(items: NavigationItem[], targetPath: string): NavigationItem | undefined {
    for (const item of items) {
      // Check if this is the item we're looking for
      if (item.href === targetPath) {
        return item;
      }

      // Check submenu if it exists
      if (item.submenu) {
        const found = findItem(item.submenu, targetPath);
        if (found) return found;
      }

      // Check children if they exist
      if (item.children) {
        const found = findItem(item.children, targetPath);
        if (found) return found;
      }
    }

    return undefined;
  }

  return findItem(navigation, path);
}

/**
 * Convert the navigation structure to be compatible with components/layout/Sidebar.tsx
 * This adds the 'title' property which is used by that component
 */
// Process navigation items to add title property for compatibility
navigation.forEach(item => {
  item.title = item.name;

  if (item.submenu) {
    // Don't create duplicate children property, just add title to submenu items
    item.submenu.forEach(subItem => {
      subItem.title = subItem.name;

      if (subItem.submenu) {
        subItem.submenu.forEach(nestedItem => {
          nestedItem.title = nestedItem.name;
        });
      }
    });
  }
});
