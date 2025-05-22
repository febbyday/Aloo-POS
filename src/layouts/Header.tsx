import { Bell, User, ShoppingCart, LogOut, Settings, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return user?.username?.[0]?.toUpperCase() || 'U'
    return user.fullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="h-16 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 ml-8 lg:ml-0">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Dashboard</h1>
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex"
          >
            <Link to="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              POS Mode
            </Link>
          </Button>
          {/* Mobile POS button - icon only */}
          <Button
            asChild
            variant="default"
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90 sm:hidden"
          >
            <Link to="/pos">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-1 sm:px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.fullName || user?.username || 'User'} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-sm hidden md:block">
                  <div className="font-medium text-foreground truncate max-w-[100px] lg:max-w-[200px]">
                    {user?.fullName || user?.username || 'User'}
                  </div>
                  <div className="text-muted-foreground text-xs truncate max-w-[100px] lg:max-w-[200px]">
                    {user?.role || ''}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/users/session')}>
                <User className="mr-2 h-4 w-4" />
                <span>Manage Sessions</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
