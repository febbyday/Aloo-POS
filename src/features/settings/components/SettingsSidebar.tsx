import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import {
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
  ShoppingCart,
  UserCog,
  Globe,
  MessageSquare,
  Layers
} from "lucide-react"

/**
 * Settings sidebar navigation component
 * Provides consistent navigation for all settings pages
 */
export function SettingsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("appearance");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    businessSettings: false,
    productManagement: false,
    salesCustomers: false,
    staffServices: false,
    systemSettings: false,
    communication: false,
    integrations: false
  });

  // Update activeSection when location changes
  useEffect(() => {
    // Extract the section from the URL path
    const path = location.pathname.split('/');
    const section = path.length > 2 ? path[2] : 'appearance';

    // Set the active section based on the URL
    setActiveSection(section || 'appearance');

    // Auto-expand the category containing the active section
    const categoryMap: Record<string, string[]> = {
      businessSettings: ['company', 'shops', 'markets'],
      productManagement: ['products', 'inventory', 'suppliers', 'purchase-orders'],
      salesCustomers: ['sales', 'customers', 'payment', 'tax'],
      staffServices: ['staff', 'repairs', 'expenses'],
      systemSettings: ['appearance', 'security', 'system', 'hardware', 'backup'],
      communication: ['notifications', 'email', 'receipt'],
      integrations: ['woocommerce']
    };

    // Find which category contains the active section and expand it
    Object.entries(categoryMap).forEach(([category, sections]) => {
      if (section && sections.includes(section)) {
        setExpandedCategories(prev => ({ ...prev, [category]: true }));
      }
    });
  }, [location.pathname, location.key]);

  // Create a navigation link component for consistent styling and behavior
  const NavLink = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    const section = to.split('/').pop() || '';
    const isActive = activeSection === section;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setActiveSection(section);
      navigate(to);
    };

    return (
      <Link
        to={to}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 text-sm rounded-md transition-all",
          "hover:bg-accent/50 hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          isActive
            ? "bg-accent text-accent-foreground font-medium shadow-sm"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center">
          <Icon className="w-4 h-4 mr-3" />
          <span>{label}</span>
        </div>
        {isActive && <ChevronRight className="h-4 w-4" />}
      </Link>
    );
  };

  // Create a section component for consistent styling - currently unused but kept for future use
  /* const NavSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    return (
      <div className="mb-6">
        <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </h3>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    );
  }; */

  // Create a submenu component for expandable categories
  const NavSubmenu = ({
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

    return (
      <div className="mb-1">
        <button
          onClick={toggleExpanded}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-md transition-all",
            "hover:bg-accent/30 hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "font-medium"
          )}
        >
          <div className="flex items-center">
            <Icon className="w-4 h-4 mr-3" />
            <span>{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="relative pl-4 mt-1 space-y-1">
            {/* Vertical line */}
            <div className={cn(
              "absolute left-[19px] top-0 bottom-2 w-px transition-colors duration-200",
              "bg-border/60"
            )} />
            {React.Children.map(children, (child, index) => (
              <div className="relative" key={index}>
                {/* Horizontal line */}
                <div className={cn(
                  "absolute left-[-12px] top-1/2 w-3 h-px transition-colors duration-200",
                  "bg-border/60"
                )} />
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-primary" />
          Settings
        </h2>
      </div>
      <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
        {/* Business Settings */}
        <NavSubmenu id="businessSettings" title="Business Settings" icon={Building}>
          <NavLink to="/settings/company" icon={Building} label="Company" />
          <NavLink to="/settings/shops" icon={Store} label="Shops" />
          <NavLink to="/settings/markets" icon={BarChart} label="Markets" />
        </NavSubmenu>

        {/* Product Management */}
        <NavSubmenu id="productManagement" title="Product Management" icon={Package}>
          <NavLink to="/settings/products" icon={Package} label="Products" />
          <NavLink to="/settings/inventory" icon={Layers} label="Inventory" />
          <NavLink to="/settings/suppliers" icon={Truck} label="Suppliers" />
          <NavLink to="/settings/purchase-orders" icon={FileText} label="Purchase Orders" />
        </NavSubmenu>

        {/* Sales & Customers */}
        <NavSubmenu id="salesCustomers" title="Sales & Customers" icon={ShoppingCart}>
          <NavLink to="/settings/sales" icon={DollarSign} label="Sales" />
          <NavLink to="/settings/customers" icon={Users} label="Customers" />
          <NavLink to="/settings/payment" icon={CreditCard} label="Payment" />
          <NavLink to="/settings/tax" icon={Calculator} label="Tax" />
        </NavSubmenu>

        {/* Staff & Services */}
        <NavSubmenu id="staffServices" title="Staff & Services" icon={UserCog}>
          <NavLink to="/settings/staff" icon={Users} label="Staff" />
          <NavLink to="/settings/repairs" icon={Wrench} label="Repairs" />
          <NavLink to="/settings/expenses" icon={CreditCard} label="Expenses" />
        </NavSubmenu>

        {/* System Settings */}
        <NavSubmenu id="systemSettings" title="System Settings" icon={Settings}>
          <NavLink to="/settings/appearance" icon={Palette} label="Appearance" />
          <NavLink to="/settings/security" icon={Shield} label="Security" />
          <NavLink to="/settings/system" icon={Cpu} label="System" />
          <NavLink to="/settings/hardware" icon={Printer} label="Hardware" />
          <NavLink to="/settings/backup" icon={Database} label="Backup & Restore" />
        </NavSubmenu>

        {/* Communication */}
        <NavSubmenu id="communication" title="Communication" icon={MessageSquare}>
          <NavLink to="/settings/notifications" icon={Bell} label="Notifications" />
          <NavLink to="/settings/email" icon={Mail} label="Email" />
          <NavLink to="/settings/receipt" icon={Receipt} label="Receipt" />
        </NavSubmenu>

        {/* Integrations */}
        <NavSubmenu id="integrations" title="Integrations" icon={Globe}>
          <NavLink to="/settings/woocommerce" icon={Store} label="WooCommerce" />
        </NavSubmenu>
      </nav>
    </div>
  );
}
