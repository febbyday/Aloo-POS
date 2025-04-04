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
  LockIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  submenu?: NavigationItem[]
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
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
      { name: 'Stock Transfer', href: '/products/transfers', icon: ArrowLeftRight },
      { name: 'Low Stock Alerts', href: '/products/stock/alerts', icon: AlertTriangle },
      { name: 'Stock History', href: '/products/history', icon: History },
      { name: 'Print Labels', href: '/products/labels', icon: Printer },
    ]
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    submenu: [
      { name: 'New Sale', href: '/sales/new', icon: Plus },
      { name: 'All Sales', href: '/sales', icon: ShoppingCart },
      { name: 'Supplier Orders', href: '/suppliers/orders', icon: ClipboardList },
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
      { name: 'Orders', href: '/suppliers/orders', icon: ClipboardList },
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
    icon: UserCircle,
    submenu: [
      { name: 'All Users', href: '/users', icon: UserCircle },
      { name: 'User Roles', href: '/roles', icon: Shield },
      { name: 'Permissions', href: '/permissions', icon: LockIcon },
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

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [openSubmenuHref, setOpenSubmenuHref] = useState<string | null>(null)

  const handleSubmenuClick = (href: string) => {
    setOpenSubmenuHref(openSubmenuHref === href ? null : href)
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <button
          onClick={onToggle}
          className="mr-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>
        {isOpen && (
          <span className="font-semibold">POS System</span>
        )}
      </div>

      <nav className="flex flex-col h-full">
        <div className="space-y-1 p-2">
          {navigation.slice(0, -1).map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isOpen={isOpen}
              isSubmenuOpen={openSubmenuHref === item.href}
              onSubmenuClick={handleSubmenuClick}
            />
          ))}
        </div>

        {/* Auto-spacing to push Settings to the bottom */}
        <div className="flex-grow"></div>

        {/* Settings & Support at the bottom */}
        <div className="p-2">
          <div className="border-t border-border pt-2"></div>
          <NavItem
            key={navigation[navigation.length - 1].href}
            item={navigation[navigation.length - 1]}
            isOpen={isOpen}
            isSubmenuOpen={openSubmenuHref === navigation[navigation.length - 1].href}
            onSubmenuClick={handleSubmenuClick}
          />
        </div>
      </nav>
    </aside>
  )
}

function NavItem({
  item,
  isOpen,
  isNested = false,
  isSubmenuOpen,
  onSubmenuClick
}: {
  item: NavigationItem;
  isOpen: boolean;
  isNested?: boolean;
  isSubmenuOpen: boolean;
  onSubmenuClick: (href: string) => void;
}) {
  const location = useLocation()

  const isActive = location.pathname === item.href ||
    (item.children && location.pathname.startsWith(item.href)) ||
    (item.submenu && item.submenu.some(subItem => location.pathname.startsWith(subItem.href)))

  const hasChildren = item.children && item.children.length > 0
  const hasSubmenu = item.submenu && item.submenu.length > 0

  // Check if any submenu item is active
  const activeSubmenuItem = item.submenu?.find(subItem => location.pathname === subItem.href)

  return (
    <div className="flex flex-col">
      <Link
        to={hasChildren || hasSubmenu ? "#" : item.href}
        onClick={(e) => {
          if (hasChildren || hasSubmenu) {
            e.preventDefault()
            onSubmenuClick(item.href)
          }
        }}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground group relative",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground",
          hasChildren || hasSubmenu ? "cursor-pointer" : ""
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        {isOpen && (
          <>
            <span className="ml-3 flex-1">{item.name}</span>
            {(hasChildren || hasSubmenu) && (
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isSubmenuOpen && "transform rotate-180"
                )}
              />
            )}
          </>
        )}
      </Link>
      {isOpen && (hasChildren || hasSubmenu) && isSubmenuOpen && (
        <div className="relative pl-4 mt-1">
          {/* Vertical line */}
          <div className={cn(
            "absolute left-[19px] top-0 bottom-2 w-px transition-colors duration-200",
            activeSubmenuItem ? "bg-primary" : "bg-border/60"
          )} />
          <div className="space-y-1">
            {(item.children || []).map((child) => (
              <NavItem
                key={child.href}
                item={child}
                isOpen={isOpen}
                isNested={true}
                isSubmenuOpen={false}
                onSubmenuClick={onSubmenuClick}
              />
            ))}
            {(item.submenu || []).map((subItem) => {
              const isSubItemActive = location.pathname === subItem.href;
              return (
                <Link
                  key={subItem.href}
                  to={subItem.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent/50 hover:text-accent-foreground group relative",
                    isSubItemActive
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {/* Horizontal line */}
                  <div className={cn(
                    "absolute left-[-12px] top-1/2 w-3 h-px transition-colors duration-200",
                    isSubItemActive ? "bg-primary" : "bg-border/60"
                  )} />
                  <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="ml-3 flex-1 text-sm">{subItem.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
