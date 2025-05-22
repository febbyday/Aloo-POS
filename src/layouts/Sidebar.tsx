import { ChevronDown, Menu, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  isMobile?: boolean
  onToggle: () => void
  onMobileClose?: () => void
}

import { NavigationItem, navigation } from '@/config/navigation'

export function Sidebar({ isOpen, isMobile = false, onToggle, onMobileClose }: SidebarProps) {
  const [openSubmenuHref, setOpenSubmenuHref] = useState<string | null>(null)

  const handleSubmenuClick = (href: string) => {
    setOpenSubmenuHref(openSubmenuHref === href ? null : href)
  }

  const handleItemClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out z-50",
        // Mobile sidebar
        isMobile ? "fixed inset-y-0 left-0 w-64" : "hidden",
        // Desktop sidebar
        "lg:fixed lg:inset-y-0 lg:flex",
        isOpen ? "lg:w-64" : "lg:w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <button
          onClick={onToggle}
          className="mr-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground hidden lg:block"
        >
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            !isOpen ? "rotate-0" : "rotate-180"
          )} />
        </button>
        <span className={cn(
          "font-semibold transition-opacity",
          (!isOpen && !isMobile) ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          POS System
        </span>
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
        {/* Always show text on mobile, conditionally on desktop */}
        <span className={cn(
          "ml-3 flex-1",
          !isOpen && "lg:hidden"
        )}>
          {item.name}
        </span>
        {(hasChildren || hasSubmenu) && (
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              !isOpen && "lg:hidden",
              isSubmenuOpen && "transform rotate-180"
            )}
          />
        )}
      </Link>
      {(hasChildren || hasSubmenu) && isSubmenuOpen && (
        <div className={cn(
          "relative pl-4 mt-1",
          !isOpen && "lg:pl-0 lg:ml-1"
        )}>
          {/* Vertical line */}
          <div className={cn(
            "absolute left-[19px] top-0 bottom-2 w-px transition-colors duration-200",
            !isOpen && "lg:hidden",
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
                    !isOpen && "lg:justify-center lg:px-1"
                  )}
                >
                  {/* Horizontal line - only show on expanded view */}
                  <div className={cn(
                    "absolute left-[-12px] top-1/2 w-3 h-px transition-colors duration-200",
                    !isOpen && "lg:hidden",
                    isSubItemActive ? "bg-primary" : "bg-border/60"
                  )} />
                  <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className={cn(
                    "ml-3 flex-1 text-sm",
                    !isOpen && "lg:hidden"
                  )}>
                    {subItem.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
