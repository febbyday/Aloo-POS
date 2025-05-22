import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useLocation, useNavigate, NavLink as RouterNavLink } from "react-router-dom"
import { cn } from '@/lib/utils';
import { Loader2 } from "lucide-react"
import {
  Activity,
  Bell,
  Database,
  Receipt,
  Calculator,
  Shield,
  Cpu,
  Printer,
  Palette,
  FileText,
  Building,
  CreditCard,
  Users,
  Package,
  Truck,
  Wrench,
  Store,
  BarChart,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Mail,
  Settings,
  ShoppingBag,
  UserCog,
  Globe,
  MessageSquare,
  Layers
} from "lucide-react"

/**
 * Settings sidebar navigation component
 * Provides consistent navigation for all settings pages
 * Optimized with memoization to prevent unnecessary re-renders
 */
export const SettingsSidebar = memo(function SettingsSidebar() {
  // Add cleanup for any navigation timers when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any navigation timers when component unmounts
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('nav_timer_') || key?.startsWith('nav_reset_timer_')) {
          const timerId = parseInt(sessionStorage.getItem(key) || '0', 10);
          if (timerId) {
            window.clearTimeout(timerId);
          }
          sessionStorage.removeItem(key);
        }
      }
    };
  }, []);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>("appearance");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    businessSettings: false,
    productManagement: false,
    salesCustomers: false,
    staffServices: false,
    systemSettings: false,
    communication: false,
    integrations: false,
    features: false,
    tools: false
  });

  // Update activeSection when location changes - optimized to reduce work
  useEffect(() => {
    // Extract the section from the URL path
    const path = location.pathname.split('/');
    const section = path.length > 2 ? path[2] : 'appearance';

    // Skip update if section hasn't changed
    if (section === activeSection) {
      return;
    }

    // Set the active section based on the URL
    setActiveSection(section || 'appearance');

    // Auto-expand the category containing the active section
    // Memoize this map to prevent recreation on each render
    const categoryMap = useMemo(() => ({
      businessSettings: ['company', 'shops', 'markets'],
      productManagement: ['products', 'inventory', 'suppliers', 'purchase-orders'],
      salesCustomers: ['sales', 'customers', 'payment', 'tax'],
      staffServices: ['staff', 'repairs', 'expenses'],
      systemSettings: ['appearance', 'theme', 'security', 'system', 'hardware', 'backup', 'monitoring', 'session'],
      communication: ['notifications', 'email', 'receipt'],
      integrations: ['woocommerce'],
      features: ['gift-cards'],
      tools: ['migration']
    }), []);

    // Find which category contains the active section and expand it
    // Use a more efficient approach that doesn't create unnecessary objects
    let categoryToExpand = '';
    for (const [category, sections] of Object.entries(categoryMap)) {
      if (section && sections.includes(section)) {
        categoryToExpand = category;
        break;
      }
    }

    // Only update state if we found a category to expand
    if (categoryToExpand) {
      setExpandedCategories(prev => {
        // Only create a new object if the category isn't already expanded
        if (prev[categoryToExpand]) return prev;
        return { ...prev, [categoryToExpand]: true };
      });
    }
  }, [location.pathname, activeSection]);

  // State to track which links are currently navigating
  const [navigatingLinks, setNavigatingLinks] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  // Create an optimized navigation link component with loading state
  const NavLink = useCallback(({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    const section = to.split('/').pop() || '';
    const isNavigating = navigatingLinks[section] || false;

    // Handle navigation with loading state - optimized to prevent memory leaks
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Only show loading state if we're navigating to a different section
      if (section !== activeSection) {
        e.preventDefault();
        setNavigatingLinks(prev => ({ ...prev, [section]: true }));

        // Use window.setTimeout to ensure proper cleanup
        const navigateTimerId = window.setTimeout(() => {
          navigate(to);

          // Reset navigation state after a short delay
          const resetTimerId = window.setTimeout(() => {
            setNavigatingLinks(prev => ({ ...prev, [section]: false }));
          }, 300);

          // Store the timer ID to allow cleanup if component unmounts
          window.sessionStorage.setItem(`nav_reset_timer_${section}`, resetTimerId.toString());
        }, 10);

        // Store the timer ID to allow cleanup if component unmounts
        window.sessionStorage.setItem(`nav_timer_${section}`, navigateTimerId.toString());
      }
    };

    return (
      <RouterNavLink
        to={to}
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center justify-between px-4 py-2.5 text-sm rounded-md transition-all",
          "hover:bg-accent/50 hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          isActive
            ? "bg-accent text-accent-foreground font-medium shadow-sm"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center">
          {isNavigating ? (
            <Loader2 className="w-4 h-4 mr-3 animate-spin text-primary" />
          ) : (
            <Icon className="w-4 h-4 mr-3" />
          )}
          <span>{label}</span>
        </div>
        {activeSection === section && <ChevronRight className="h-4 w-4" />}
      </RouterNavLink>
    );
  }, [activeSection, navigatingLinks, navigate]);

  // Create a submenu component for expandable categories
  const NavSubmenu = useCallback(({
    id,
    title,
    icon: Icon,
    children
  }: {
    id: string,
    title: string,
    icon: React.ElementType,
    children: React.ReactNode
  }) => {
    const isExpanded = expandedCategories[id];

    const toggleExpanded = () => {
      setExpandedCategories(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    // Memoize the submenu content to prevent unnecessary re-renders
    const submenuContent = useMemo(() => {
      if (!isExpanded) return null;

      return (
        <div className="pl-8 mt-1 space-y-1">
          {children}
        </div>
      );
    }, [isExpanded, children]);

    return (
      <div>
        <button
          onClick={toggleExpanded}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-md transition-all",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            isExpanded
              ? "bg-accent/30 text-accent-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          <div className="flex items-center">
            <Icon className="w-4 h-4 mr-3" />
            <span>{title}</span>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {submenuContent}
      </div>
    );
  }, [expandedCategories]);

  // Memoize the navigation content to prevent unnecessary re-renders
  const navigationContent = useMemo(() => (
    <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
      {/* Business Settings */}
      <NavSubmenu id="businessSettings" title="Business Settings" icon={Building}>
        <NavLink to="/settings/company" icon={Building} label="Company" />
        <NavLink to="/settings/shops" icon={Store} label="Shops/Branches" />
        <NavLink to="/settings/markets" icon={Globe} label="Markets/Regions" />
      </NavSubmenu>

      {/* Product Management */}
      <NavSubmenu id="productManagement" title="Product Management" icon={Package}>
        <NavLink to="/settings/products" icon={Package} label="Products" />
        <NavLink to="/settings/inventory" icon={Layers} label="Inventory" />
        <NavLink to="/settings/suppliers" icon={Truck} label="Suppliers" />
        <NavLink to="/settings/purchase-orders" icon={FileText} label="Purchase Orders" />
      </NavSubmenu>

      {/* Sales & Customers */}
      <NavSubmenu id="salesCustomers" title="Sales & Customers" icon={BarChart}>
        <NavLink to="/settings/sales" icon={BarChart} label="Sales" />
        <NavLink to="/settings/customers" icon={Users} label="Customers" />
        <NavLink to="/settings/payment" icon={CreditCard} label="Payment Methods" />
        <NavLink to="/settings/tax" icon={Calculator} label="Tax" />
      </NavSubmenu>

      {/* Staff & Services */}
      <NavSubmenu id="staffServices" title="Staff & Services" icon={UserCog}>
        <NavLink to="/settings/staff" icon={Users} label="Staff" />
        <NavLink to="/settings/repairs" icon={Wrench} label="Repairs & Services" />
        <NavLink to="/settings/expenses" icon={DollarSign} label="Expenses" />
      </NavSubmenu>

      {/* Communication */}
      <NavSubmenu id="communication" title="Communication" icon={MessageSquare}>
        <NavLink to="/settings/notifications" icon={Bell} label="Notifications" />
        <NavLink to="/settings/email" icon={Mail} label="Email Templates" />
        <NavLink to="/settings/receipt" icon={Receipt} label="Receipt Templates" />
      </NavSubmenu>

      {/* Integrations */}
      <NavSubmenu id="integrations" title="Integrations" icon={Database}>
        <NavLink to="/settings/woocommerce" icon={ShoppingBag} label="WooCommerce" />
      </NavSubmenu>

      {/* Additional Features */}
      <NavSubmenu id="features" title="Additional Features" icon={Cpu}>
        <NavLink to="/settings/gift-cards" icon={CreditCard} label="Gift Cards" />
      </NavSubmenu>

      {/* System Settings */}
      <NavSubmenu id="systemSettings" title="System Settings" icon={Settings}>
        <NavLink to="/settings/appearance" icon={Palette} label="Appearance" />
        <NavLink to="/settings/hardware" icon={Printer} label="Hardware" />
        <NavLink to="/settings/security" icon={Shield} label="Security" />
        <NavLink to="/settings/backup" icon={Database} label="Backup & Restore" />
        <NavLink to="/settings/monitoring" icon={Activity} label="Monitoring" />
        <NavLink to="/settings/session" icon={Shield} label="Session Management" />
      </NavSubmenu>

      {/* Tools */}
      <NavSubmenu id="tools" title="Tools" icon={Wrench}>
        <NavLink to="/settings/migration" icon={Database} label="Data Migration" />
      </NavSubmenu>
    </nav>
  ), [NavSubmenu, NavLink]);

  return (
    <div className="w-64 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-primary" />
          Settings
        </h2>
      </div>
      {navigationContent}
    </div>
  );
});

// Default export for backwards compatibility
export default SettingsSidebar;
