// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Link } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  User,
  LayoutGrid
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const Header = () => {
  return (
    <header className="h-14 border-b px-4 flex items-center justify-between bg-background">
      {/* Left side - Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-9 h-9 md:w-80"
        />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <LayoutGrid className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </Button>

        <NotificationBell />

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Messages</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
