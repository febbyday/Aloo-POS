import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Package,
  Settings,
  ChevronRight,
  Store,
  Menu,
  X,
  UserCircle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Navigation items configuration
const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    title: 'Markets',
    href: '/markets',
    icon: Store,
  },
  {
    title: 'Users',
    href: '/users',
    icon: UserCircle,
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: Shield,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const Navigation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar navigation */}
      <nav
        className={cn(
          "bg-card text-card-foreground border-r flex flex-col z-40 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "fixed inset-y-0 left-0" : "hidden md:flex"
        )}
      >
        {/* Logo and collapse button */}
        <div className={cn(
          "flex items-center border-b h-14 px-3",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <span className="font-semibold text-lg">POS System</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden md:flex"
          >
            <ChevronRight className={cn(
              "h-5 w-5 transition-transform",
              collapsed ? "rotate-180" : ""
            )} />
          </Button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className={cn(
                    "flex-shrink-0",
                    collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
                  )} />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User section */}
        <div className={cn(
          "border-t p-3",
          collapsed ? "flex justify-center" : ""
        )}>
          <div className="flex items-center">
            <div
              className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"
            >
              <span className="font-medium text-sm">US</span>
            </div>
            {!collapsed && (
              <div className="ml-3 truncate">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;